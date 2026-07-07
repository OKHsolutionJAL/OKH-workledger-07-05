import { createAppointmentAction, updateAppointmentStatusAction } from "@/actions/appointments";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireShopUser } from "@/lib/tenant";

const appointmentStatuses = ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export default async function AppointmentsPage() {
  const { companyId } = await requireShopUser();
  const [appointments, customers, vehicles, services] = await Promise.all([
    prisma.appointment.findMany({
      where: { companyId },
      orderBy: { scheduledAt: "desc" },
      include: { customer: true, vehicle: true, service: true },
    }),
    prisma.customer.findMany({ where: { companyId }, orderBy: { name: "asc" } }),
    prisma.vehicle.findMany({ where: { companyId }, orderBy: { createdAt: "desc" }, include: { customer: true } }),
    prisma.service.findMany({ where: { companyId, active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <PageHeader title="Agenda" description="Agendamentos filtrados por loja." />

      <Card>
        <CardTitle>Novo agendamento</CardTitle>
        <form action={createAppointmentAction} className="mt-4 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Cliente" name="customerId" required>
              <option value="">Selecione</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </Select>
            <Select label="Veiculo" name="vehicleId" required>
              <option value="">Selecione</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.maker} {vehicle.model} - {vehicle.customer.name}
                </option>
              ))}
            </Select>
            <Select label="Servico" name="serviceId">
              <option value="">Sem servico</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>{service.name}</option>
              ))}
            </Select>
            <Input label="Data e hora" name="scheduledAt" type="datetime-local" required />
            <Input label="Titulo" name="title" placeholder="Shaken, revisao, lavagem..." required />
          </div>
          <Textarea label="Notas" name="notes" />
          <Button type="submit">Criar agendamento</Button>
        </form>
      </Card>

      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Titulo</Th>
              <Th>Cliente</Th>
              <Th>Veiculo</Th>
              <Th>Servico</Th>
              <Th>Data</Th>
              <Th>Status</Th>
              <Th>Atualizar</Th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <Td>{appointment.title}</Td>
                <Td>{appointment.customer.name}</Td>
                <Td>{appointment.vehicle.maker} {appointment.vehicle.model}</Td>
                <Td>{appointment.service?.name ?? "-"}</Td>
                <Td>{formatDateTime(appointment.scheduledAt)}</Td>
                <Td><StatusBadge status={appointment.status} /></Td>
                <Td>
                  <form action={updateAppointmentStatusAction} className="flex gap-2">
                    <input type="hidden" name="id" value={appointment.id} />
                    <Select name="status" defaultValue={appointment.status} aria-label="Status">
                      {appointmentStatuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </Select>
                    <Button type="submit" variant="secondary">Salvar</Button>
                  </form>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
