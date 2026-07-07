import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { buttonClasses } from "@/components/ui/button";
import { requireRole } from "@/lib/auth";
import type { NavItem } from "@/types/nav";

const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/companies", label: "Lojas" },
  { href: "/admin/plans", label: "Planos" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireRole("SUPER_ADMIN");

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar title="OKH Admin" subtitle="Super Admin" items={adminNav} />
      <main className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Logado como</p>
            <p className="font-semibold text-slate-950">{user.name}</p>
          </div>
          <a href="/logout" className={buttonClasses("secondary")}>
            Sair
          </a>
        </header>
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-6">{children}</div>
      </main>
    </div>
  );
}
