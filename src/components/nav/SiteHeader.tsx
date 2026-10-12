"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { MusicToggle } from "@/components/music/MusicToggle";

const links = [
  { href: "/", label: "問事清單" },
  { href: "/visit", label: "參拜模式" },
  { href: "/records", label: "參拜紀錄" },
  { href: "/settings", label: "設定" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const linkClass = (href: string) =>
    `inline-flex min-h-11 items-center px-3 tracking-widest transition-colors ${
      pathname === href ? "font-bold text-gold-bright" : "text-muted hover:text-ink"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ground/85 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="inline-flex min-h-11 items-center gap-2" onClick={() => setOpen(false)}>
          <span className="font-serif text-xl font-bold tracking-[0.2em] text-gold">Paipai</span>
          <span className="text-sm tracking-widest text-muted">參拜小幫手</span>
        </Link>

        <div className="flex items-center">
          <nav aria-label="網站導覽" className="hidden md:block">
            <ul className="flex">
              {links.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} aria-current={pathname === href ? "page" : undefined} className={linkClass(href)}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <MusicToggle />

          <button
            type="button"
            className="inline-flex size-11 items-center justify-center text-gold md:hidden"
            aria-label={open ? "關閉選單" : "開啟選單"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={24} strokeWidth={1.5} aria-hidden /> : <Menu size={24} strokeWidth={1.5} aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="網站導覽" className="border-t border-line/70 md:hidden">
          <ul className="mx-auto max-w-6xl px-2 py-2">
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={pathname === href ? "page" : undefined}
                  className={`${linkClass(href)} w-full`}
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
