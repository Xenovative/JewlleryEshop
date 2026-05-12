import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

/**
 * Walk up from cwd to find this package's prisma directory (monorepo root
 * may be cwd, or apps/shop when Next runs, etc.).
 */
function findPrismaDirFromCwd(): string | null {
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

/**
 * Resolve `packages/db/prisma` from the installed `@lumiere/db` package location.
 * Works when `process.cwd()` is wrong (e.g. temp) or when this file is bundled under `.next`.
 */
function findPrismaDirFromPackage(): string | null {
  try {
    const require = createRequire(import.meta.url);
    const pkgPath = require.resolve("@lumiere/db/package.json");
    const candidate = path.join(path.dirname(pkgPath), "prisma");
    if (fs.existsSync(path.join(candidate, "schema.prisma"))) {
      return candidate;
    }
  } catch {
    /* package not resolvable yet */
  }
  return null;
}

/** Optional: absolute path to `packages/db/prisma` when auto-detect fails. */
function prismaDirFromEnv(): string | null {
  const raw = process.env.LUMIERE_PRISMA_DIR?.trim();
  if (!raw) return null;
  const abs = path.resolve(raw);
  if (fs.existsSync(path.join(abs, "schema.prisma"))) return abs;
  return null;
}

function prismaDirForSqlite(): string | null {
  return prismaDirFromEnv() ?? findPrismaDirFromCwd() ?? findPrismaDirFromPackage();
}

/**
 * Prisma + SQLite on Windows are picky about `file:` URLs. Prefer `file:C:/path`
 * (see Prisma SQLite docs); on Unix use `file:` + absolute path (`file:///var/...`).
 */
function toPrismaSqliteFileUrl(absOsPath: string): string {
  const abs = path.resolve(absOsPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  const p = abs.split(path.sep).join("/");
  if (/^[A-Za-z]:\//.test(p)) {
    return `file:${p}`;
  }
  if (p.startsWith("/")) {
    return `file://${p}`;
  }
  return `file:${p}`;
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
  if (process.env.LUMIERE_SKIP_SQLITE_URL_NORMALIZE === "1") {
    return;
  }
  const raw = process.env.DATABASE_URL;
  if (!raw) return;
  const rel = relativeSqliteFileSegment(raw);
  if (!rel) return;
  const prismaDir = prismaDirForSqlite();
  if (!prismaDir) {
    return;
  }
  const abs = path.resolve(prismaDir, rel);
  process.env.DATABASE_URL = toPrismaSqliteFileUrl(abs);
}

normalizeSqliteDatabaseUrl();
