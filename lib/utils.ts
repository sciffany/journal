import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateISO(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Shift a YYYY-MM-DD calendar date by N days (timezone-safe). */
export function shiftISODate(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return formatDateISO(d);
}

export function todayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isValidISODate(input: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(input) && !Number.isNaN(Date.parse(input));
}

/** Monday (UTC calendar) of the ISO week containing `iso`. */
export function startOfWeekMonday(iso: string): string {
  const day = new Date(`${iso}T00:00:00.000Z`).getUTCDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  return shiftISODate(iso, -daysFromMonday);
}

/** Monday–Sunday dates for the week containing `iso`. */
export function weekDates(iso: string): string[] {
  const start = startOfWeekMonday(iso);
  return Array.from({ length: 7 }, (_, i) => shiftISODate(start, i));
}

export function todayPath(): string {
  return `/day/${todayISO()}`;
}
