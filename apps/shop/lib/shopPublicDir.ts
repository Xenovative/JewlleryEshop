import fs from "node:fs";
import path from "node:path";

/**
 * Absolute path to `apps/shop/public` (the Next.js `public` root for the shop app).
 * Uploads must land here so they match what `next start` serves.
 *
 * `process.cwd()` alone is unreliable in monorepos (repo root vs `apps/shop`).
 * Set `SHOP_PUBLIC_DIR` in production if the heuristic ever misses.
 */
export function shopPublicDir(): string {
  const fromEnv = process.env.SHOP_PUBLIC_DIR?.trim();
  if (fromEnv) {
    const abs = path.resolve(fromEnv);
    if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) return abs;
  }

  let dir = path.resolve(process.cwd());
  for (let i = 0; i < 12; i++) {
    const monoPublic = path.join(dir, "apps", "shop", "public");
    if (fs.existsSync(monoPublic) && fs.statSync(monoPublic).isDirectory()) {
      return monoPublic;
    }

    const pkgPath = path.join(dir, "package.json");
    if (fs.existsSync(pkgPath)) {
      try {
        const name = JSON.parse(fs.readFileSync(pkgPath, "utf8"))?.name;
        if (name === "@lumiere/shop") {
          const localPublic = path.join(dir, "public");
          if (fs.existsSync(localPublic) && fs.statSync(localPublic).isDirectory()) {
            return localPublic;
          }
        }
      } catch {
        /* ignore malformed package.json */
      }
    }

    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return path.join(path.resolve(process.cwd()), "public");
}
