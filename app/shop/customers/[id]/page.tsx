import Link from "next/link";
import { notFound } from "next/navigation";
import { updateCustomerAction } from "@/actions/customers";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, Td, Th } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatDateTime, formatYen } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireShopUser } from "@/lib/tenant";

type CustomerDetailProps = {
  params: Promise<{ id: string }>;
};

export default async function CustomerDetailPage({ params }: CustomerDetailProps) {
  const { companyId } = await requireShopUser();
  const { id } = await params;
  const customer = await prisma.customer.findFirst({
    where: { id, companyId },
    include: {
      vehicles: { orderBy: { createdAt: "desc" } },
      appointments: {
        orderBy: { scheduledAt: "desc" },
        include: { vehicle: true, service: true },
      },
      serviceRecords: {
        orderBy: { performedAt: "desc" },
        include: { vehicle: true, service: true },
      },
      reminders: {
        orderBy: { dueDate: "asc" },
        include: { vehicle: true },
      },
    },
  });

  if (!customer) notFound();

  return (
    <>
      <PageHeader title={customer.name} description="Detalhes, carros, agenda e historico do cliente." />

      <Card>
        <CardTitle>Dados do cliente</CardTitle>
        <form action={updateCustomerAction} className="mt-4 grid gap-4">
          <input type="hidden" name="id" value={customer.id} />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Nome" name="name" defaultValue={customer.name} required />
            <Input label="Telefone" name="phone" defaultValue={customer.phone ?? ""} />
            <Input label="Email" name="email" type="email" defaultValue={customer.email ?? ""} />
            <Input label="LINE ID" name="lineId" defaultValue={customer.lineId ?? ""} />
            <Input label="WhatsApp" name="whatsapp" defaultValue={customer.whatsapp ?? ""} />
            <Input label="Idioma" name="language" defaultValue={customer.language} />
          </div>
          <Textarea label="Endereco" name="address" defaultValue={customer.address ?? ""} />
          <Textarea label="Notas" name="notes" defaultValue={customer.notes ?? ""} />
          <Button type="submit">Salvar cliente</Button>
        </form>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <CardTitle>Veiculos</CardTitle>
          <Link href="/shop/vehicles/new" className="text-sm font-semibold text-slate-950 hover:underline">
            Novo veiculo
          </Link>
        </div>
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
            {customer.vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <Td>
                  <Link href={`/shop/vehicles/${vehicle.id}`} className="font-semibold text-slate-950 hover:underline">
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
        <CardTitle>Agendamentos</CardTitle>
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
            {customer.appointments.map((appointment) => (
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
        <CardTitle>Historico de servicos</CardTitle>
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
            {customer.serviceRecords.map((record) => (
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

      <Card>
        <CardTitle>Lembretes</CardTitle>
        <Table className="mt-4">
          <thead>
            <tr>
              <Th>Titulo</Th>
              <Th>Tipo</Th>
              <Th>Data</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {customer.reminders.map((reminder) => (
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
