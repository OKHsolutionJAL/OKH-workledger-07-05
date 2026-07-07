import type { ReactNode } from "react";
import { PortalNav } from "@/components/portal-nav";
import { buttonClasses } from "@/components/ui/button";
import { getCustomerScope } from "@/lib/auth";
import type { NavItem } from "@/types/nav";

const portalNav: NavItem[] = [
  { href: "/portal", label: "Resumo" },
  { href: "/portal/my-cars", label: "Meus carros" },
  { href: "/portal/appointments", label: "Agendamentos" },
  { href: "/portal/profile", label: "Perfil" },
];

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const { user } = await getCustomerScope();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-950">OKH AutoCare Portal</p>
            <p className="text-sm text-slate-500">{user.name}</p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <PortalNav items={portalNav} />
            <a href="/logout" className={buttonClasses("secondary")}>
              Sair
            </a>
          </div>
        </div>
      </header>
      <main className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-6">{children}</main>
    </div>
  );
}
