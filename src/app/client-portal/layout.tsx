import Link from "next/link";
import { ClientPortalLogoutButton } from "@/components/client-portal/client-portal-logout-button";
import { PortalSwitcher } from "@/components/portal-switcher";
import { requireClientCompany } from "@/lib/client-portal/auth";

const navigation = [
  { href: "/client-portal/dashboard", label: "Dashboard" },
  { href: "/client-portal/requests", label: "Solicitacoes" },
  { href: "/client-portal/workers", label: "Prestadores" },
  { href: "/client-portal/documents", label: "Documentos recebidos" },
  { href: "/client-portal/entries", label: "Lancamentos" },
  { href: "/client-portal/adjustments", label: "Ajustes/Descontos" },
  { href: "/client-portal/payments", label: "Pagamentos" },
  { href: "/client-portal/company-profile", label: "Dados da empresa" }
];

export default async function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireClientCompany();

  return (
    <div className="min-h-screen bg-zinc-50">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-line bg-white px-4 py-5 md:block">
        <Link href="/client-portal/dashboard" className="block rounded-md px-3 py-2">
          <p className="text-lg font-semibold text-ink">Area do Cliente / Contratante</p>
          <p className="text-xs text-zinc-500">OKH WorkLedger</p>
          <p className="mt-2 rounded-md bg-jade-50 px-2 py-1 text-xs font-semibold text-jade-700">
            ID: {profile.client_company_code || "gerando..."}
          </p>
        </Link>
        <nav className="mt-6 grid gap-1">
          {navigation.map((item) => (
            <Link className="rounded-md px-3 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-paper hover:text-ink" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
          <Link className="mt-4 rounded-md border border-line px-3 py-2.5 text-sm font-semibold text-ink transition hover:bg-paper" href="/dashboard">
            Voltar ao sistema
          </Link>
          {profile.user_type === "both" ? <PortalSwitcher compact /> : null}
          <ClientPortalLogoutButton className="mt-2 w-full justify-start px-3 py-2.5" />
        </nav>
      </aside>

      <div className="md:pl-72">
        <header className="sticky top-0 z-20 border-b border-line bg-white/95 px-3 py-3 backdrop-blur sm:px-4 sm:py-4 md:px-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-jade-700">Client / Contractor Portal</p>
              <h1 className="text-xl font-semibold text-ink">{profile.company_name || profile.business_name || "Area do Cliente / Contratante"}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link className="inline-flex min-h-10 items-center justify-center rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-paper" href="/client-portal/company-profile">
                Seu ID: {profile.client_company_code || "-"}
              </Link>
              {profile.user_type === "both" ? <PortalSwitcher /> : null}
              <ClientPortalLogoutButton />
            </div>
          </div>
          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 md:hidden">
            {navigation.map((item) => (
              <Link className="shrink-0 rounded-md border border-line bg-white px-3 py-2 text-xs font-semibold text-zinc-700" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
            <ClientPortalLogoutButton className="shrink-0 px-3 py-2 text-xs" label="Sair" />
          </nav>
        </header>
        <main className="mx-auto w-full max-w-7xl min-w-0 px-3 py-4 sm:px-4 sm:py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
