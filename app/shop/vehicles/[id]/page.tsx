import { notFound } from "next/navigation";
import { updateVehicleAction } from "@/actions/vehicles";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatDateTime, formatYen, toDateInputValue } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireShopUser } from "@/lib/tenant";

type VehicleDetailProps = {
  params: Promise<{ id: string }>;
};

export default async function VehicleDetailPage({ params }: VehicleDetailProps) {
  const { companyId } = await requireShopUser();
  const { id } = await params;
  const [vehicle, customers] = await Promise.all([
    prisma.vehicle.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        serviceRecords: {
          orderBy: { performedAt: "desc" },
          include: { service: true },
        },
        appointments: {
          orderBy: { scheduledAt: "desc" },
          include: { service: true },
        },
        documents: {
          orderBy: { createdAt: "desc" },
        },
        reminders: {
          orderBy: { dueDate: "asc" },
        },
      },
    }),
    prisma.customer.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!vehicle) notFound();

  return (
    <>
      <PageHeader
        title={`${vehicle.maker} ${vehicle.model}`}
        description={`${vehicle.customer.name} ${vehicle.plateNumber ? `- ${vehicle.plateNumber}` : ""}`}
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
        <CardTitle>Editar veiculo</CardTitle>
        <form action={updateVehicleAction} className="mt-4 grid gap-4">
          <input type="hidden" name="id" value={vehicle.id} />
          <Select label="Cliente" name="customerId" defaultValue={vehicle.customerId} required>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </Select>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Marca" name="maker" defaultValue={vehicle.maker} required />
            <Input label="Modelo" name="model" defaultValue={vehicle.model} required />
            <Input label="Ano" name="year" type="number" defaultValue={vehicle.year ?? ""} />
            <Input label="Cor" name="color" defaultValue={vehicle.color ?? ""} />
            <Input label="Placa" name="plateNumber" defaultValue={vehicle.plateNumber ?? ""} />
            <Input label="Chassi" name="chassisNumber" defaultValue={vehicle.chassisNumber ?? ""} />
            <Input label="Quilometragem" name="mileage" type="number" defaultValue={vehicle.mileage ?? ""} />
            <Input label="Data de compra" name="purchaseDate" type="date" defaultValue={toDateInputValue(vehicle.purchaseDate)} />
            <Input label="Vencimento Shaken" name="shakenExpiry" type="date" defaultValue={toDateInputValue(vehicle.shakenExpiry)} />
            <Input label="Vencimento Seguro" name="insuranceExpiry" type="date" defaultValue={toDateInputValue(vehicle.insuranceExpiry)} />
            <Input label="Imagem URL" name="imageUrl" defaultValue={vehicle.imageUrl ?? ""} />
          </div>
          <Textarea label="Notas" name="notes" defaultValue={vehicle.notes ?? ""} />
          <Button type="submit">Salvar veiculo</Button>
        </form>
      </Card>

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
        <CardTitle>Documentos</CardTitle>
        <Table className="mt-4">
          <thead>
            <tr>
              <Th>Nome</Th>
              <Th>Tipo</Th>
              <Th>Vencimento</Th>
            </tr>
          </thead>
          <tbody>
            {vehicle.documents.map((document) => (
              <tr key={document.id}>
                <Td>{document.name}</Td>
                <Td>{document.type}</Td>
                <Td>{formatDate(document.expiresAt)}</Td>
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
