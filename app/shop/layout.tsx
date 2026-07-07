import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { buttonClasses } from "@/components/ui/button";
import { requireShopUser } from "@/lib/tenant";
import type { NavItem } from "@/types/nav";

const shopNav: NavItem[] = [
  { href: "/shop", label: "Dashboard" },
  { href: "/shop/customers", label: "Clientes" },
  { href: "/shop/vehicles", label: "Veiculos" },
  { href: "/shop/services", label: "Servicos" },
  { href: "/shop/appointments", label: "Agenda" },
  { href: "/shop/records", label: "Historico" },
  { href: "/shop/reminders", label: "Lembretes" },
  { href: "/shop/settings", label: "Configuracoes" },
];

export default async function ShopLayout({ children }: { children: ReactNode }) {
  const { user } = await requireShopUser();

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar title={user.company?.name ?? "Loja"} subtitle="Painel da loja" items={shopNav} />
      <main className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Equipe</p>
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
