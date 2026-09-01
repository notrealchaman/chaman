import path from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import { DatabaseSync, type StatementSync } from "node:sqlite";
import { SCHEMA } from "@/lib/schema";

export type Row = Record<string, unknown>;
export type Params = unknown[] | Record<string, unknown>;

let _db: DatabaseSync | null = null;

const DB_PATH =
  process.env.DATABASE_FILE ||
  path.join(process.cwd(), "prisma", "dev.db");

function ensureDir() {
  mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

export function getDb(): DatabaseSync {
  if (_db) return _db;
  ensureDir();
  _db = new DatabaseSync(DB_PATH);
  _db.exec("PRAGMA journal_mode=WAL;");
  _db.exec("PRAGMA foreign_keys=ON;");
  _db.exec(SCHEMA);
  return _db;
}

// node:sqlite accepts positional binds as spread args OR a single object for
// named parameters. Arrays must be spread; passing an array directly is treated
// as a named-param object with keys "0","1",… and throws. Normalize here.
function bindRun(stmt: StatementSync, params: Params) {
  return Array.isArray(params) ? stmt.run(...(params as never[])) : stmt.run(params as Record<string, never>);
}
function bindGet(stmt: StatementSync, params: Params) {
  return Array.isArray(params) ? stmt.get(...(params as never[])) : stmt.get(params as Record<string, never>);
}
function bindAll(stmt: StatementSync, params: Params) {
  return Array.isArray(params) ? stmt.all(...(params as never[])) : stmt.all(params as Record<string, never>);
}

export function run(sql: string, params: Params = []) {
  return bindRun(getDb().prepare(sql), params);
}

export function get<T = Row>(sql: string, params: Params = []): T | null {
  const row = bindGet(getDb().prepare(sql), params);
  return (row as T) ?? null;
}

export function all<T = Row>(sql: string, params: Params = []): T[] {
  return bindAll(getDb().prepare(sql), params) as T[];
}

export function first<T = Row>(sql: string, params: Params = []): T | null {
  return get<T>(sql, params);
}

/** Insert a row and return its id. Accepts an object with column keys. */
export function insert(table: string, data: Record<string, unknown>, id = crypto.randomUUID()) {
  const keys = Object.keys(data);
  const cols = keys.map((k) => `"${k}"`).join(", ");
  const placeholders = keys.map(() => "?").join(", ");
  const values = keys.map((k) => data[k]);
  const stmt = getDb().prepare(
    `INSERT INTO "${table}" ("id", ${cols}) VALUES (?, ${placeholders})`
  );
  stmt.run(id as never, ...(values as never[]));
  return id;
}

export function update(table: string, id: string, data: Record<string, unknown>) {
  const keys = Object.keys(data);
  const setClause = keys.map((k) => `"${k}" = ?`).join(", ");
  const values = keys.map((k) => data[k]);
  const stmt = getDb().prepare(`UPDATE "${table}" SET ${setClause} WHERE "id" = ?`);
  stmt.run(...(values as never[]), id as never);
}

export function remove(table: string, id: string) {
  const stmt = getDb().prepare(`DELETE FROM "${table}" WHERE "id" = ?`);
  return stmt.run(id as never);
}

export function count(table: string, where = "", params: Params = []): number {
  const stmt = getDb().prepare(`SELECT COUNT(*) as c FROM "${table}" ${where}`);
  const row = bindGet(stmt, params) as { c: number };
  return Number(row?.c ?? 0);
}

// ---------------------------------------------------------------------------
// JSON helpers — SQLite has no JSON type; store as strings for portability
// ---------------------------------------------------------------------------

export const j = (v: unknown) => JSON.stringify(v ?? []);
export const parse = <T>(s: unknown, fallback: T): T => {
  if (typeof s !== "string" || !s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
};

// Row normalization: convert 0/1 integer booleans and stored JSON back
export function normBoolean(v: unknown): boolean {
  return v === 1 || v === true || v === "1" || v === "true";
}

export function withJson<T extends Record<string, unknown>>(row: T, fields: string[]): T {
  const out = { ...row };
  for (const f of fields) {
    (out as Record<string, unknown>)[f] = parse(out[f], []);
  }
  return out;
}

export function hasData(): boolean {
  return count("Tool") > 0;
}
