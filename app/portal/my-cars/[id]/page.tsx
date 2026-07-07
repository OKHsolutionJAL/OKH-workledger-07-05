import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardTitle } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { getCustomerScope } from "@/lib/auth";
import { formatDate, formatDateTime, formatYen } from "@/lib/format";
import { prisma } from "@/lib/prisma";

type MyCarDetailProps = {
  params: Promise<{ id: string }>;
};

export default async function MyCarDetailPage({ params }: MyCarDetailProps) {
  const { companyId, customerId } = await getCustomerScope();
  const { id } = await params;
  const vehicle = await prisma.vehicle.findFirst({
    where: { id, companyId, customerId },
    include: {
      serviceRecords: { orderBy: { performedAt: "desc" }, include: { service: true } },
      appointments: { orderBy: { scheduledAt: "desc" }, include: { service: true } },
      reminders: { orderBy: { dueDate: "asc" } },
      documents: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!vehicle) notFound();

  return (
    <>
      <PageHeader
        title={`${vehicle.maker} ${vehicle.model}`}
        description={vehicle.plateNumber ?? "Sem placa cadastrada"}
      />

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <p className="text-sm text-slate-500">Shaken</p>
          <p className="mt-2 text-2xl font-semibold">{formatDate(vehicle.shakenExpiry)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Seguro</p>
          <p className="mt-2 text-2xl font-semibold">{formatDate(vehicle.insuranceExpiry)}</p>
        </Card>
      </section>

      <Card>
        <CardTitle>Historico de servicos</CardTitle>
        <Table className="mt-4">
          <thead>
            <tr>
              <Th>Servico</Th>
              <Th>Data</Th>
              <Th>Km</Th>
              <Th>Valor</Th>
            </tr>
          </thead>
          <tbody>
            {vehicle.serviceRecords.map((record) => (
              <tr key={record.id}>
                <Td>{record.title}</Td>
                <Td>{formatDate(record.performedAt)}</Td>
                <Td>{record.mileage ? `${record.mileage.toLocaleString("pt-BR")} km` : "-"}</Td>
                <Td>{formatYen(record.price)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card>
        <CardTitle>Agendamentos</CardTitle>
        <Table className="mt-4">
          <thead>
            <tr>
              <Th>Titulo</Th>
              <Th>Data</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {vehicle.appointments.map((appointment) => (
              <tr key={appointment.id}>
                <Td>{appointment.title}</Td>
                <Td>{formatDateTime(appointment.scheduledAt)}</Td>
                <Td><StatusBadge status={appointment.status} /></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card>
        <CardTitle>Documentos e lembretes</CardTitle>
        <Table className="mt-4">
          <thead>
            <tr>
              <Th>Item</Th>
              <Th>Tipo</Th>
              <Th>Data</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {vehicle.documents.map((document) => (
              <tr key={document.id}>
                <Td>{document.name}</Td>
                <Td>{document.type}</Td>
                <Td>{formatDate(document.expiresAt)}</Td>
                <Td>-</Td>
              </tr>
            ))}
            {vehicle.reminders.map((reminder) => (
              <tr key={reminder.id}>
                <Td>{reminder.title}</Td>
                <Td>{reminder.type}</Td>
                <Td>{formatDate(reminder.dueDate)}</Td>
                <Td><StatusBadge status={reminder.status} /></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
