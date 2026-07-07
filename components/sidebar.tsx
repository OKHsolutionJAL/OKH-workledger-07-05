"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import type { NavItem } from "@/types/nav";

type SidebarProps = {
  title: string;
  subtitle: string;
  items: NavItem[];
};

export function Sidebar({ title, subtitle, items }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="border-b border-slate-200 bg-white lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <div className="px-5 py-5">
        <p className="text-lg font-semibold text-slate-950">{title}</p>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{subtitle}</p>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:grid lg:overflow-visible">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950",
                active && "bg-slate-950 text-white hover:bg-slate-950 hover:text-white",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
