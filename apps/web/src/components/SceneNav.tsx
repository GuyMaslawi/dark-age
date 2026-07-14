"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navItems } from "@/lib/navigation";

export function SceneNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div
      className="fixed bottom-24 start-3 z-30 flex flex-col-reverse items-start gap-2"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label="תפריט מסעות"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="group relative flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-void/70 text-xl backdrop-blur transition-all hover:border-gold hover:bg-void/90"
        style={{ boxShadow: "0 0 22px -6px rgba(201,162,39,0.7)" }}
      >
        <span className="animate-breathe absolute inset-0 rounded-full" style={{ boxShadow: "inset 0 0 18px -4px #c9a227" }} />
        <span aria-hidden className="relative">🧭</span>
      </button>

      <nav
        className={`flex flex-col-reverse gap-1.5 transition-all duration-200 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`group flex items-center gap-2 rounded-full border py-1.5 pe-3 ps-1.5 text-sm backdrop-blur transition-all ${
                active
                  ? "border-gold bg-gold/20 text-gold-bright"
                  : "border-void-edge bg-void/70 text-neutral-200 hover:border-gold/60 hover:text-gold"
              }`}
              style={active ? { boxShadow: "0 0 18px -6px #c9a227" } : undefined}
            >
              <span aria-hidden className="flex h-7 w-7 items-center justify-center rounded-full text-base">
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
