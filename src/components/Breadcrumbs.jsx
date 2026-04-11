import Link from "next/link";

export function Breadcrumbs({ items = [] }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
        <li>
          <Link href="/" className="font-semibold text-slate-700 hover:text-emerald-700">
            Home
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              <span aria-hidden="true">/</span>
              {isLast ? (
                <span aria-current="page" className="font-semibold text-slate-900">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="font-medium text-slate-600 hover:text-emerald-700">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
