import { CsvUploader } from "./csv-uploader";

export default function ImportPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Import CSV</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Bulk-load past entries into the database. Rows are appended; nothing is overwritten.
        </p>
      </div>
      <CsvUploader />
    </div>
  );
}
