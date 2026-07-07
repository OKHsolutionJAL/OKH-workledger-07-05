import { PageHeader } from "@/components/page-header";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [totalCompanies, activeCompanies, totalCustomers, totalVehicles, totalAppointments, companies] =
    await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { status: "ACTIVE" } }),
      prisma.customer.count(),
      prisma.vehicle.count(),
      prisma.appointment.count(),
      prisma.company.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          _count: {
            select: {
              customers: true,
              vehicles: true,
            },
          },
        },
      }),
    ]);

  const stats = [
    { label: "Total de lojas", value: totalCompanies },
    { label: "Lojas ativas", value: activeCompanies },
    { label: "Clientes", value: totalCustomers },
    { label: "Veiculos", value: totalVehicles },
    { label: "Agendamentos", value: totalAppointments },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard OKH"
        description="Visao geral do SaaS, lojas ativas e volume operacional."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardDescription>{stat.label}</CardDescription>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{stat.value}</p>
          </Card>
        ))}
      </section>

      <Card>
        <CardTitle>Lojas recentes</CardTitle>
        <Table className="mt-4">
          <thead>
            <tr>
              <Th>Loja</Th>
              <Th>Cidade</Th>
              <Th>Clientes</Th>
              <Th>Veiculos</Th>
              <Th>Criada em</Th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id}>
                <Td>{company.name}</Td>
                <Td>{company.city ?? "-"}</Td>
                <Td>{company._count.customers}</Td>
                <Td>{company._count.vehicles}</Td>
                <Td>{formatDate(company.createdAt)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
