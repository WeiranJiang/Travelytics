import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export function loadCsv<T = Record<string, string>>(relativePath: string): T[] {
  const filePath = path.resolve(process.cwd(), relativePath);
  const raw = fs.readFileSync(filePath, 'utf8');
  return parse(raw, {
    columns: true,
    skip_empty_lines: true,
  }) as T[];
}
