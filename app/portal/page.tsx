import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { formatDate, formatDateTime, formatYen } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getCustomerScope } from "@/lib/auth";

export default async function PortalDashboardPage() {
  const { companyId, customerId } = await getCustomerScope();
  const [vehicles, appointments, records, reminders] = await Promise.all([
    prisma.vehicle.findMany({
      where: { companyId, customerId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.appointment.findMany({
      where: { companyId, customerId },
      orderBy: { scheduledAt: "asc" },
      take: 5,
      include: { vehicle: true, service: true },
    }),
    prisma.serviceRecord.findMany({
      where: { companyId, customerId },
      orderBy: { performedAt: "desc" },
      take: 5,
      include: { vehicle: true, service: true },
    }),
    prisma.reminder.findMany({
      where: { companyId, customerId, status: "PENDING" },
      orderBy: { dueDate: "asc" },
      take: 5,
      include: { vehicle: true },
    }),
  ]);

  return (
    <>
      <PageHeader title="Meu resumo" description="Seus carros, manutencoes, Shaken, Seguro e agenda." />

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Meus carros</p>
          <p className="mt-2 text-3xl font-semibold">{vehicles.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Agendamentos</p>
          <p className="mt-2 text-3xl font-semibold">{appointments.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Lembretes pendentes</p>
          <p className="mt-2 text-3xl font-semibold">{reminders.length}</p>
        </Card>
      </section>

      <Card>
        <CardTitle>Meus carros</CardTitle>
        <Table className="mt-4">
          <thead>
            <tr>
              <Th>Veiculo</Th>
              <Th>Placa</Th>
              <Th>Shaken</Th>
              <Th>Seguro</Th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <Td>
                  <Link href={`/portal/my-cars/${vehicle.id}`} className="font-semibold text-slate-950 hover:underline">
                    {vehicle.maker} {vehicle.model}
                  </Link>
                </Td>
                <Td>{vehicle.plateNumber ?? "-"}</Td>
                <Td>{formatDate(vehicle.shakenExpiry)}</Td>
                <Td>{formatDate(vehicle.insuranceExpiry)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card>
        <CardTitle>Proximos agendamentos</CardTitle>
        <Table className="mt-4">
          <thead>
            <tr>
              <Th>Titulo</Th>
              <Th>Veiculo</Th>
              <Th>Data</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <Td>{appointment.title}</Td>
                <Td>{appointment.vehicle.maker} {appointment.vehicle.model}</Td>
                <Td>{formatDateTime(appointment.scheduledAt)}</Td>
                <Td><StatusBadge status={appointment.status} /></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card>
        <CardTitle>Historico recente</CardTitle>
        <Table className="mt-4">
          <thead>
            <tr>
              <Th>Servico</Th>
              <Th>Veiculo</Th>
              <Th>Data</Th>
              <Th>Valor</Th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <Td>{record.title}</Td>
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
