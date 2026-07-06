import { Building2, CircleDollarSign, UserCheck, UserPlus, UsersRound } from "lucide-react";
import { formatCompactCurrency } from "./chart-utils";

export type ClientOverview = {
  totalClients: number;
  newClients: number;
  activeClients: number;
  inactiveClients: number;
  averageTicket: number;
};

type ClientOverviewCardProps = {
  data: ClientOverview;
  currency: string;
};

export function ClientOverviewCard({ data, currency }: ClientOverviewCardProps) {
  const items = [
    { label: "Total de clientes", value: String(data.totalClients), icon: UsersRound },
    { label: "Novos no mes", value: String(data.newClients), icon: UserPlus },
    { label: "Ativos no mes", value: String(data.activeClients), icon: UserCheck },
    { label: "Inativos", value: String(data.inactiveClients), icon: Building2 },
    { label: "Ticket medio", value: formatCompactCurrency(data.averageTicket, currency), icon: CircleDollarSign }
  ];

  return (
    <section className="rounded-lg border border-line bg-white p-4 shadow-soft sm:p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[#0B132B]">Visao geral de clientes</h3>
        <p className="mt-1 text-sm text-zinc-500">Atividade, crescimento e ticket medio do mes atual.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div className="rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-4" key={item.label}>
              <Icon className="h-5 w-5 text-[#FF6A00]" aria-hidden="true" />
              <p className="mt-3 text-2xl font-bold text-[#0B132B]">{item.value}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-zinc-500">{item.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
