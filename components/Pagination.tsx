import { getTranslations } from "next-intl/server";

interface PaginationProps {
  page: number;
  pageCount: number;
  searchParams: Record<string, string | undefined>;
}

function buildHref(params: Record<string, string | undefined>, page: number): string {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && key !== "page") usp.set(key, value);
  }
  if (page > 1) usp.set("page", String(page));
  const qs = usp.toString();
  return qs ? `?${qs}` : "?";
}

/**
 * Condenses long ranges to `1 … 4 5 6 … 23`. Previously every page rendered as
 * a link, which overflowed horizontally on mobile once a category had more
 * than a handful of pages.
 */
function pageItems(page: number, pageCount: number): (number | "gap")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);

  const items: (number | "gap")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);

  if (start > 2) items.push("gap");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < pageCount - 1) items.push("gap");
  items.push(pageCount);

  return items;
}

export default async function Pagination({ page, pageCount, searchParams }: PaginationProps) {
  const t = await getTranslations("pagination");
  if (pageCount <= 1) return null;

  const current = Math.min(Math.max(page, 1), pageCount);
  const items = pageItems(current, pageCount);

  const arrowBase =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-medium";

  return (
    <nav aria-label={t("label")} className="mt-10 flex items-center justify-center gap-1">
      {current === 1 ? (
        <span aria-hidden="true" className={`${arrowBase} text-brand-400`}>
          ‹
        </span>
      ) : (
        <a
          href={buildHref(searchParams, current - 1)}
          aria-label={t("previous")}
          className={`${arrowBase} text-brand-700 hover:bg-brand-50`}
        >
          ‹
        </a>
      )}

      {items.map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} aria-hidden="true" className="px-1 text-brand-500">
            …
          </span>
        ) : (
          <a
            key={item}
            href={buildHref(searchParams, item)}
            aria-label={t("goToPage", { page: item })}
            aria-current={item === current ? "page" : undefined}
            className={`inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-semibold ${
              item === current ? "bg-brand-600 text-white" : "text-brand-700 hover:bg-brand-50"
            }`}
          >
            {item}
          </a>
        )
      )}

      {current === pageCount ? (
        <span aria-hidden="true" className={`${arrowBase} text-brand-400`}>
          ›
        </span>
      ) : (
        <a
          href={buildHref(searchParams, current + 1)}
          aria-label={t("next")}
          className={`${arrowBase} text-brand-700 hover:bg-brand-50`}
        >
          ›
        </a>
      )}
    </nav>
  );
}
