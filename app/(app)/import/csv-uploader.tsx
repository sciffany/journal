"use client";

import { useRef, useState, useTransition } from "react";
import { Upload } from "lucide-react";
import {
  importEntriesFromCsv,
  type ImportResult,
} from "@/app/actions/import";
import { Button } from "@/components/ui/button";

const SAMPLE = `date,type,title,body,metadata
2024-06-01,journal,Morning thoughts,"Had coffee and walked the park.",
2024-06-02,ratings,Dune Part Two,,"{""stars"":5}"
2024-06-03,gratitude,,Family dinner,
`;

export function CsvUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [pending, startTransition] = useTransition();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setFileName(file?.name ?? null);
    setError(null);
    setResult(null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setError(null);
    setResult(null);

    startTransition(async () => {
      try {
        const res = await importEntriesFromCsv(formData);
        setResult(res);
        form.reset();
        setFileName(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Import failed.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-neutral-300 bg-neutral-50/50 px-6 py-10 text-center transition hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950 dark:hover:border-neutral-600 dark:hover:bg-neutral-900"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          role="button"
          tabIndex={0}
        >
          <Upload className="h-6 w-6 text-neutral-400" />
          <div>
            <p className="text-sm font-medium">
              {fileName ?? "Choose a CSV file"}
            </p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Max 5 MB · UTF-8
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            name="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={handleFileChange}
            required
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={pending || !fileName}>
            {pending ? "Importing..." : "Import entries"}
          </Button>
        </div>
      </form>

      {result && (
        <div className="space-y-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-sm">
            Imported <span className="font-semibold tabular-nums">{result.imported}</span>
            {result.skipped > 0 && (
              <>
                {" "}
                · skipped{" "}
                <span className="font-semibold tabular-nums">{result.skipped}</span>{" "}
                invalid {result.skipped === 1 ? "row" : "rows"}
              </>
            )}
          </p>
          {result.errors.length > 0 && (
            <ul className="max-h-48 space-y-1 overflow-y-auto text-xs text-red-600 dark:text-red-400">
              {result.errors.map((err) => (
                <li key={`${err.row}-${err.message}`}>
                  Row {err.row}: {err.message}
                </li>
              ))}
              {result.skipped > result.errors.length && (
                <li>…and {result.skipped - result.errors.length} more</li>
              )}
            </ul>
          )}
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-sm font-medium">Expected format</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Required columns: <code className="text-neutral-700 dark:text-neutral-300">date</code>,{" "}
          <code className="text-neutral-700 dark:text-neutral-300">type</code>. Optional:{" "}
          <code className="text-neutral-700 dark:text-neutral-300">title</code>,{" "}
          <code className="text-neutral-700 dark:text-neutral-300">body</code>,{" "}
          <code className="text-neutral-700 dark:text-neutral-300">metadata</code> (JSON).
          Dates must be <code className="text-neutral-700 dark:text-neutral-300">YYYY-MM-DD</code>.
          Type can be any slug (journal, ratings, ideas, …).
        </p>
        <pre className="overflow-x-auto rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs leading-relaxed dark:border-neutral-800 dark:bg-neutral-950">
          {SAMPLE}
        </pre>
      </div>
    </div>
  );
}
