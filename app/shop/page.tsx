import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { addDays, endOfWeek, startOfWeek } from "@/lib/dates";
import { formatDate, formatYen } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireShopUser } from "@/lib/tenant";

export default async function ShopDashboardPage() {
  const { companyId } = await requireShopUser();
  const now = new Date();
  const in90Days = addDays(now, 90);
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);

  const [
    totalCustomers,
    totalVehicles,
    shakenExpiring,
    insuranceExpiring,
    appointmentsThisWeek,
    latestRecords,
  ] = await Promise.all([
    prisma.customer.count({ where: { companyId } }),
    prisma.vehicle.count({ where: { companyId } }),
    prisma.vehicle.count({
      where: {
        companyId,
        shakenExpiry: { gte: now, lte: in90Days },
      },
    }),
    prisma.vehicle.count({
      where: {
        companyId,
        insuranceExpiry: { gte: now, lte: in90Days },
      },
    }),
    prisma.appointment.count({
      where: {
        companyId,
        scheduledAt: { gte: weekStart, lt: weekEnd },
      },
    }),
    prisma.serviceRecord.findMany({
      where: { companyId },
      orderBy: { performedAt: "desc" },
      take: 6,
      include: {
        customer: true,
        vehicle: true,
        service: true,
      },
    }),
  ]);

  const stats = [
    { label: "Clientes", value: totalCustomers },
    { label: "Veiculos", value: totalVehicles },
    { label: "Shaken em 90 dias", value: shakenExpiring },
    { label: "Seguro em 90 dias", value: insuranceExpiring },
    { label: "Agenda da semana", value: appointmentsThisWeek },
  ];

  return (
    <>
      <PageHeader
        title="Painel da loja"
        description="Indicadores operacionais filtrados somente para esta empresa."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold">{stat.value}</p>
          </Card>
        ))}
      </section>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Historico recente</CardTitle>
          <Link href="/shop/records" className="text-sm font-semibold text-slate-950 hover:underline">
            Ver todos
          </Link>
        </div>
        <Table className="mt-4">
          <thead>
            <tr>
              <Th>Servico</Th>
              <Th>Cliente</Th>
              <Th>Veiculo</Th>
              <Th>Data</Th>
              <Th>Valor</Th>
            </tr>
          </thead>
          <tbody>
            {latestRecords.map((record) => (
              <tr key={record.id}>
                <Td className="font-semibold text-slate-950">{record.title}</Td>
                <Td>{record.customer.name}</Td>
                <Td>{record.vehicle.maker} {record.vehicle.model}</Td>
                <Td>{formatDate(record.performedAt)}</Td>
                <Td>{formatYen(record.price)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
