import { requestPortalAppointmentAction } from "@/actions/portal";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { getCustomerScope } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function PortalAppointmentsPage() {
  const { companyId, customerId } = await getCustomerScope();
  const [appointments, vehicles, services] = await Promise.all([
    prisma.appointment.findMany({
      where: { companyId, customerId },
      orderBy: { scheduledAt: "desc" },
      include: { vehicle: true, service: true },
    }),
    prisma.vehicle.findMany({ where: { companyId, customerId }, orderBy: { createdAt: "desc" } }),
    prisma.service.findMany({ where: { companyId, active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <PageHeader title="Agendamentos" description="Solicite um horario e acompanhe o status." />

      <Card>
        <CardTitle>Solicitar horario</CardTitle>
        <form action={requestPortalAppointmentAction} className="mt-4 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Veiculo" name="vehicleId" required>
              <option value="">Selecione</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.maker} {vehicle.model}
                </option>
              ))}
            </Select>
            <Select label="Servico" name="serviceId">
              <option value="">Nao sei ainda</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>{service.name}</option>
              ))}
            </Select>
            <Input label="Data preferida" name="scheduledAt" type="datetime-local" required />
          </div>
          <Textarea label="Notas" name="notes" placeholder="Conte o que precisa: Shaken, seguro, troca de oleo..." />
          <Button type="submit">Solicitar agendamento</Button>
        </form>
      </Card>

      <Card>
        <Table>
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
    </>
  );
}
