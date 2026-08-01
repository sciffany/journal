"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { parseCsv } from "@/lib/csv";
import { isValidISODate } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024;
const BATCH_SIZE = 100;

const REQUIRED_HEADERS = ["date", "type"] as const;

export type ImportRowError = {
  row: number;
  message: string;
};

export type ImportResult = {
  imported: number;
  skipped: number;
  errors: ImportRowError[];
};

function parseDate(input: string): Date {
  if (!isValidISODate(input)) {
    throw new Error(`Invalid date "${input}". Expected YYYY-MM-DD.`);
  }
  return new Date(`${input}T00:00:00.000Z`);
}

function parseMetadata(
  raw: string | undefined,
): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (raw == null || raw.trim() === "") return undefined;
  try {
    return JSON.parse(raw) as Prisma.InputJsonValue;
  } catch {
    throw new Error("Metadata must be valid JSON.");
  }
}

type PreparedRow = {
  date: Date;
  type: string;
  title: string | null;
  body: string | null;
  metadata?: Prisma.InputJsonValue | typeof Prisma.JsonNull;
};

function prepareRow(record: Record<string, string>): PreparedRow {
  const dateRaw = record.date ?? "";
  const type = (record.type ?? "").trim();
  const title = (record.title ?? "").trim();
  const body = record.body ?? "";
  const metadataRaw = record.metadata;

  if (!dateRaw) throw new Error("date is required.");
  if (!type) throw new Error("type is required.");

  const date = parseDate(dateRaw);
  const metadata = parseMetadata(metadataRaw);

  return {
    date,
    type,
    title: title || null,
    body: body === "" ? null : body,
    ...(metadata !== undefined ? { metadata } : {}),
  };
}

export async function importEntriesFromCsv(formData: FormData): Promise<ImportResult> {
  await requireSession();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("Choose a CSV file to import.");
  }
  if (file.size === 0) {
    throw new Error("The CSV file is empty.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("CSV must be 5 MB or smaller.");
  }

  const text = await file.text();
  const { headers, rows } = parseCsv(text);

  if (headers.length === 0 || rows.length === 0) {
    throw new Error("CSV has no data rows. Include a header and at least one entry.");
  }

  for (const required of REQUIRED_HEADERS) {
    if (!headers.includes(required)) {
      throw new Error(
        `Missing required column "${required}". Expected columns: date, type[, title, body, metadata].`,
      );
    }
  }

  const prepared: PreparedRow[] = [];
  const errors: ImportRowError[] = [];

  rows.forEach((record, index) => {
    const lineNumber = index + 2; // header is line 1
    const hasAny = Object.values(record).some((v) => v.trim() !== "");
    if (!hasAny) return;

    try {
      prepared.push(prepareRow(record));
    } catch (err) {
      errors.push({
        row: lineNumber,
        message: err instanceof Error ? err.message : "Invalid row.",
      });
    }
  });

  let imported = 0;
  for (let i = 0; i < prepared.length; i += BATCH_SIZE) {
    const batch = prepared.slice(i, i + BATCH_SIZE);
    const result = await prisma.entry.createMany({
      data: batch.map((row) => ({
        date: row.date,
        type: row.type,
        title: row.title,
        body: row.body,
        ...(row.metadata !== undefined
          ? { metadata: row.metadata as Prisma.InputJsonValue }
          : {}),
      })),
    });
    imported += result.count;
  }

  if (imported > 0) {
    revalidatePath("/");
    const types = new Set(prepared.map((r) => r.type));
    for (const type of types) revalidatePath(`/${type}`);
  }

  return {
    imported,
    skipped: errors.length,
    errors: errors.slice(0, 50),
  };
}
