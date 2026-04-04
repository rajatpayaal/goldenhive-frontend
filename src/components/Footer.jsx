import React from "react";
import Link from "next/link";
import { FooterTabs } from "./FooterTabs";

const isExternalUrl = (url) =>
  /^https?:\/\//i.test(url || "") || /^mailto:/i.test(url || "");

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-2.9h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.3.2 2.3.2v2.5h-1.3c-1.3 0-1.7.8-1.7 1.6v1.9h2.9l-.5 2.9h-2.4v7A10 10 0 0 0 22 12z" />
  </svg>
);

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm9 2h-9A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4zm-4.5 3.3a4.7 4.7 0 1 1 0 9.4 4.7 4.7 0 0 1 0-9.4zm0 2a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4zM17.7 6.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
  </svg>
);

const iconKeyForSocial = (icon) => {
  const normalized = String(icon || "").toLowerCase();
  if (normalized.includes("facebook")) return "facebook";
  if (normalized.includes("instagram")) return "instagram";
  return null;
};

const FooterLink = ({ item, dark }) => {
  if (!item?.isActive) return null;
  const label = item.label || item.url;
  const href = item.url || "#!";
  const style = item.textColor ? { color: item.textColor } : undefined;
  const className = dark
    ? "inline-flex w-fit items-center gap-2 text-sm font-semibold text-white/75 hover:text-white"
    : "inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-700 hover:text-emerald-700";

  const iconKey = iconKeyForSocial(item.icon);
  const maybeIcon =
    iconKey === "facebook" ? (
      <FacebookIcon className="h-4 w-4" />
    ) : iconKey === "instagram" ? (
      <InstagramIcon className="h-4 w-4" />
    ) : null;

  if (item.isExternal || isExternalUrl(href)) {
    return (
      <a
        className={className}
        href={href}
        target={item.isExternal ? "_blank" : undefined}
        rel={item.isExternal ? "noopener noreferrer" : undefined}
        style={style}
      >
        {maybeIcon}
        {label}
      </a>
    );
  }

  return (
    <Link className={className} href={href} style={style}>
      {maybeIcon}
      {label}
    </Link>
  );
};

export function Footer({ footer }) {
  const tabs = (footer?.seoLinkTabs || []).filter((t) => t?.isActive);
  const columns = (footer?.footerColumns || []).filter((c) => c?.isActive);

  return (
    <footer className="bg-slate-950 text-white">
      <div className="bg-gradient-to-b from-slate-950 via-slate-950 to-black">
        <div className="w-full px-5 py-14 sm:px-8 lg:px-12">
          {tabs.length > 0 && (
            <div className="mb-10">
              <FooterTabs tabs={tabs} />
            </div>
          )}

          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title} className="space-y-4">
                <div className="text-sm font-extrabold uppercase tracking-wider text-white/80">
                  {col.title}
                </div>
                <div className="grid gap-2">
                  {(col.items || []).map((item) => (
                    <FooterLink
                      key={`${col.title}-${item.label}-${item.url}`}
                      item={item}
                      dark
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-6 border-t border-white/10 pt-7 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-black tracking-tight">GoldenHive</div>
              <div className="mt-1 text-xs font-semibold text-white/60">
                © {new Date().getFullYear()} GoldenHive. All rights reserved.
              </div>
            </div>
            <div className="text-xs font-medium leading-6 text-white/55">
              By accessing this page, you confirm that you have read, understood, and agreed to our Terms of Service, Cookie Policy, Privacy Policy, and Content Guidelines.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
