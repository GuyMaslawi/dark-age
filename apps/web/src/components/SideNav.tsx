"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/navigation";

export function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row gap-1 overflow-x-auto p-2 md:flex-col md:gap-1 md:overflow-visible md:p-3">
      {navItems.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-gold/15 text-gold-bright"
                : "text-neutral-300 hover:bg-void-soft hover:text-gold"
            }`}
          >
            <span aria-hidden className="text-base">
              {item.icon}
            </span>
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
