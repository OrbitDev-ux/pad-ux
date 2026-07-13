import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve('./data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function filePath(name: string) {
  return path.join(DATA_DIR, `${name}.json`);
}

export function readFile<T extends Record<string, unknown>>(name: string): T {
  const fp = filePath(name);
  if (!fs.existsSync(fp)) return {} as T;
  try {
    return JSON.parse(fs.readFileSync(fp, 'utf-8')) as T;
  } catch {
    return {} as T;
  }
}

export function writeFile<T>(name: string, data: T): void {
  const fp = filePath(name);
  const tmp = fp + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmp, fp);
}

export function getOne<T>(name: string, key: string): T | null {
  const db = readFile<Record<string, T>>(name);
  return db[key] ?? null;
}

export function setOne<T>(name: string, key: string, value: T): void {
  const db = readFile<Record<string, T>>(name);
  db[key] = value;
  writeFile(name, db);
}

export function getAll<T>(name: string): T[] {
  return Object.values(readFile<Record<string, T>>(name));
}

export function deleteOne(name: string, key: string): void {
  const db = readFile<Record<string, unknown>>(name);
  delete db[key];
  writeFile(name, db);
}
