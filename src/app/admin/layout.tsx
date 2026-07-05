import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";

const adminNavigation = [
  { href: "/admin", label: "Visao geral" },
  { href: "/admin/users", label: "Usuarios" },
  { href: "/admin/clients", label: "Clientes" },
  { href: "/admin/plans", label: "Planos" },
  { href: "/admin/modules", label: "Modulos" },
  { href: "/admin/payments", label: "Pagamentos" },
  { href: "/admin/support", label: "Suporte" },
  { href: "/admin/exports", label: "Exportacoes" },
  { href: "/admin/settings", label: "Configuracoes" }
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-zinc-50">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-line bg-ink px-4 py-5 text-white md:block">
        <Link href="/admin" className="block rounded-md px-3 py-2">
          <p className="text-lg font-semibold">OKH WorkLedger Admin</p>
          <p className="text-xs text-zinc-300">Controle SaaS da OKH Solution</p>
        </Link>
        <nav className="mt-6 grid gap-1">
          {adminNavigation.map((item) => (
            <Link className="rounded-md px-3 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/10 hover:text-white" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
          <Link className="mt-4 rounded-md border border-white/15 px-3 py-2.5 text-sm font-semibold text-zinc-100 transition hover:bg-white/10" href="/dashboard">
            Voltar ao sistema
          </Link>
        </nav>
      </aside>

      <div className="md:pl-72">
        <header className="sticky top-0 z-20 border-b border-line bg-white/95 px-4 py-4 backdrop-blur md:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-jade-700">OKH Solution</p>
              <h1 className="text-xl font-semibold text-ink">Area administrativa</h1>
            </div>
            <Link className="inline-flex min-h-10 items-center justify-center rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-paper" href="/dashboard">
              Voltar ao sistema
            </Link>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 md:hidden">
            {adminNavigation.map((item) => (
              <Link className="shrink-0 rounded-md border border-line bg-white px-3 py-2 text-xs font-semibold text-zinc-700" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
