export type CsvRow = Record<string, string>;

/** RFC 4180–style CSV parse. Supports quotes, commas, and newlines in fields. */
export function parseCsv(text: string): { headers: string[]; rows: CsvRow[] } {
  const input = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const next = input[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      field = "";
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
    } else if (ch === "\r") {
      // ignore; handled with \n
    } else {
      field += ch;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  }

  if (rows.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const data = rows.slice(1).map((cells) => {
    const record: CsvRow = {};
    for (let i = 0; i < headers.length; i++) {
      record[headers[i]] = (cells[i] ?? "").trim();
    }
    return record;
  });

  return { headers, rows: data };
}
