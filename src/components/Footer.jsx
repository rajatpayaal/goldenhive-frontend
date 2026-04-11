import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FooterTabs } from "./FooterTabs";

const isExternalUrl = (url) =>
  /^https?:\/\//i.test(url || "") || /^mailto:/i.test(url || "");

const normalizeFooterLink = (href, columnTitle) => {
  if (!href) return "#!";
  if (href.startsWith("/") || isExternalUrl(href)) return href;

  const safeHref = String(href).trim();
  const slugOnly = safeHref.replace(/^\/+|\/+$/g, "");

  if (columnTitle === "Policies") {
    return `/policies/${slugOnly}`;
  }

  if (columnTitle === "Help & Support") {
    return `/support/${slugOnly}`;
  }

  return `/${slugOnly}`;
};

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

const WhatsAppIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M20.52 3.48A11.88 11.88 0 0 0 3.5 20.94l-.01.01a1.28 1.28 0 0 0 .27 1.34l1.6 1.6a1.28 1.28 0 0 0 1.35.26A11.88 11.88 0 0 0 20.52 3.48zm-8.37 17.87a9.36 9.36 0 0 1-4.8-1.25l-.34-.2-3.12.82.83-3.04-.22-.35a9.24 9.24 0 0 1-1.35-4.84 9.3 9.3 0 0 1 9.3-9.29c2.49 0 4.82.97 6.57 2.72a9.26 9.26 0 0 1 2.72 6.58 9.3 9.3 0 0 1-9.3 9.35z" />
    <path d="M17.54 14.3c-.24-.12-1.44-.71-1.66-.79-.22-.08-.38-.12-.54.12-.16.24-.64.79-.78.95-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.19-.71-.64-1.19-1.43-1.33-1.67-.14-.24-.02-.37.1-.49.1-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.47-.38-.4-.54-.4-.14 0-.3 0-.46 0a1.79 1.79 0 0 0-1.3.62c-.45.48-.7 1.18-.78 1.43-.08.24-.86 2.1-.86 2.38 0 .28.17.4.37.54.2.14.43.32.62.48.2.16.44.17.6.26.16.08.54.2 1.04.38.49.18.91.24 1.24.36.32.12.6.19.86.3.26.12.5.2.74.08.24-.12 1.44-.66 1.74-.92.3-.26.5-.53.66-.75.16-.22.32-.18.54-.12.24.04 1.44.67 1.7.79.26.12.43.18.5.28.08.1.08.57.02.78-.06.22-.24.36-.48.52z" />
  </svg>
);

const EmailIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 2v.01L12 13 4 6.01V6h16zm-16 12V8.51l7.2 5.07a1 1 0 0 0 1.1 0L20 8.51V18H4z" />
  </svg>
);

const PhoneIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M21 16.5a4.5 4.5 0 0 1-4.49 4.5h-9A4.5 4.5 0 0 1 3 16.5C3 11.26 7.26 7 12.5 7c.5 0 .99.04 1.47.1a1 1 0 0 1 .85.82l.55 3.2a1 1 0 0 1-.27.87l-1.13 1.13a11.12 11.12 0 0 0 3.2 3.2l1.13-1.13a1 1 0 0 1 .87-.27l3.2.55a1 1 0 0 1 .82.85c.06.48.1.97.1 1.47z" />
  </svg>
);

const YouTubeIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M19.6 7.2s-.2-1.4-.8-2c-.7-.8-1.5-.8-1.9-.9C14.4 4 12 4 12 4s-2.4 0-4.9.3c-.4 0-1.2.1-1.9.9-.6.6-.8 2-.8 2S4 8.9 4 10.8v2.4c0 1.9.2 3.6.2 3.6s.2 1.4.8 2c.7.8 1.6.8 2 .9 1.5.2 6.1.3 6.1.3s2.4 0 4.9-.3c.4 0 1.2-.1 1.9-.9.6-.6.8-2 .8-2s.2-1.7.2-3.6v-2.4c0-1.9-.2-3.6-.2-3.6zM10 14.5V9.5l4.5 2.5L10 14.5z" />
  </svg>
);

const iconKeyForSocial = (item) => {
  const normalized = `${item?.icon || ""} ${item?.label || ""} ${item?.slug || ""} ${item?.url || ""}`
    .toLowerCase();

  if (normalized.includes("whatsapp")) return "whatsapp";
  if (normalized.includes("youtube")) return "youtube";
  if (normalized.includes("instagram")) return "instagram";
  if (normalized.includes("facebook")) return "facebook";
  if (normalized.includes("gmail") || normalized.includes("mailto") || normalized.includes("email")) return "gmail";
  if (normalized.includes("contact") || normalized.includes("phone") || normalized.includes("call")) return "contact";

  return null;
};

const FooterLink = ({ item, columnTitle, dark }) => {
  if (!item?.isActive) return null;
  const label = item.label || item.slug || item.url;
  const rawHref = item.url || item.slug;
  const href = normalizeFooterLink(rawHref, columnTitle);
  const style = item.textColor ? { color: item.textColor } : undefined;
  const className = dark
    ? "inline-flex w-fit items-center gap-2 text-sm font-semibold text-white/75 hover:text-white"
    : "inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-700 hover:text-emerald-700";

  const iconKey = iconKeyForSocial(item);
  const maybeIcon =
    iconKey === "facebook" ? (
      <FacebookIcon className="h-4 w-4" />
    ) : iconKey === "instagram" ? (
      <InstagramIcon className="h-4 w-4" />
    ) : iconKey === "whatsapp" ? (
      <WhatsAppIcon className="h-4 w-4" />
    ) : iconKey === "youtube" ? (
      <YouTubeIcon className="h-4 w-4" />
    ) : iconKey === "gmail" ? (
      <EmailIcon className="h-4 w-4" />
    ) : iconKey === "contact" ? (
      <PhoneIcon className="h-4 w-4" />
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

          <div className="grid gap-10 md:grid-cols-3 lg:grid-cols-5">
            {columns.map((col) => (
              <div key={col.title} className="space-y-4">
                <div className="text-sm font-extrabold uppercase tracking-wider text-white/80">
                  {col.title}
                </div>
                <div className="grid gap-2">
                  {(col.items || []).map((item) => (
                    <FooterLink
                      key={`${col.title}-${item.label}-${item.slug || item.url}`}
                      item={item}
                      columnTitle={col.title}
                      dark
                    />
                  ))}
                </div>
              </div>
            ))}

            {footer?.qrCode?.isActive && (
              <div className="space-y-4 md:justify-self-end">
                <div className="text-sm font-extrabold uppercase tracking-wider text-white/80">
                  {footer.qrCode.title || "Download App"}
                </div>
                {footer.qrCode.subtitle && (
                  <p className="text-sm text-white/70">{footer.qrCode.subtitle}</p>
                )}
                {footer.qrCode.imageUrl && (
                  <div className="w-fit overflow-hidden rounded-2xl border border-white/10 bg-slate-900 p-4">
                    <Image
                      src={footer.qrCode.imageUrl}
                      alt={footer.qrCode.title || "QR code"}
                      width={220}
                      height={220}
                      className="h-40 w-40 object-contain sm:h-44 sm:w-44"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-12 flex flex-col gap-6 border-t border-white/10 pt-7 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-black tracking-tight">GoldenHive</div>
              <div className="mt-1 text-xs font-semibold text-white/60">
                © {new Date().getFullYear()} GoldenHive. All rights reserved.
              </div>
            </div>
            <div className="text-xs font-medium leading-6 text-white/55">
              By accessing this page, you confirm that you have read, understood, and agreed to our{" "}
              <Link href="/policies" className="text-white/75 hover:text-white underline">
                Policies
              </Link>
              , Terms of Service, Cookie Policy, Privacy Policy, and Content Guidelines.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
