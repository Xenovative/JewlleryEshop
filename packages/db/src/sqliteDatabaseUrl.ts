import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Walk up from cwd to find this package's prisma directory (monorepo root
 * may be cwd, or apps/shop when Next runs, etc.).
 */
function findPrismaDir(): string | null {
  let dir = process.cwd();
  for (let i = 0; i < 16; i++) {
    const candidate = path.join(dir, "packages", "db", "prisma");
    if (fs.existsSync(path.join(candidate, "schema.prisma"))) {
      return candidate;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/** If DATABASE_URL is a relative `file:` SQLite path, return the relative file segment. */
function relativeSqliteFileSegment(databaseUrl: string): string | null {
  if (!databaseUrl.startsWith("file:")) return null;
  const rest = databaseUrl.slice("file:".length);
  if (rest.startsWith("//")) {
    try {
      const { pathname } = new URL(databaseUrl);
      if (pathname && path.isAbsolute(pathname)) return null;
    } catch {
      return null;
    }
    return null;
  }
  const normalized = rest.replace(/\//g, path.sep);
  if (path.isAbsolute(normalized)) return null;
  return normalized.replace(/^\.\/+/, "") || null;
}

/** Mutates process.env.DATABASE_URL so every entrypoint uses the same SQLite file. */
export function normalizeSqliteDatabaseUrl(): void {
  const raw = process.env.DATABASE_URL;
  if (!raw) return;
  const rel = relativeSqliteFileSegment(raw);
  if (!rel) return;
  const prismaDir = findPrismaDir();
  if (!prismaDir) return;
  const abs = path.resolve(prismaDir, rel);
  process.env.DATABASE_URL = pathToFileURL(abs).href;
}

normalizeSqliteDatabaseUrl();
