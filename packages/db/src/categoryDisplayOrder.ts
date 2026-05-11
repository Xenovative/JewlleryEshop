/** Category slugs shown last in left-to-right storefront grids (e.g. catch-all). */
const LAST_SLUGS = new Set(["other"]);

/**
 * Sort categories for display: alphabetical by name, with `other` (and configured
 * last slugs) always at the end.
 */
export function sortCategoriesForDisplay<T extends { slug: string; name: string }>(
  categories: T[]
): T[] {
  return [...categories].sort((a, b) => {
    const aLast = LAST_SLUGS.has(a.slug.toLowerCase());
    const bLast = LAST_SLUGS.has(b.slug.toLowerCase());
    if (aLast && !bLast) return 1;
    if (!aLast && bLast) return -1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
}
