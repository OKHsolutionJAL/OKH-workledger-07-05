import { createReminderAction, updateReminderStatusAction } from "@/actions/reminders";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireShopUser } from "@/lib/tenant";

const reminderTypes = ["SHAKEN", "INSURANCE", "OIL_CHANGE", "MAINTENANCE", "WASH", "CUSTOM"];
const reminderStatuses = ["PENDING", "SENT", "DONE", "CANCELLED"];

export default async function RemindersPage() {
  const { companyId } = await requireShopUser();
  const [reminders, customers, vehicles] = await Promise.all([
    prisma.reminder.findMany({
      where: { companyId },
      orderBy: { dueDate: "asc" },
      include: { customer: true, vehicle: true },
    }),
    prisma.customer.findMany({ where: { companyId }, orderBy: { name: "asc" } }),
    prisma.vehicle.findMany({ where: { companyId }, include: { customer: true }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <>
      <PageHeader
        title="Lembretes"
        description="Lembretes manuais e sugestoes criadas a partir de vencimentos de Shaken e Seguro."
      />

      <Card>
        <CardTitle>Novo lembrete</CardTitle>
        <form action={createReminderAction} className="mt-4 grid gap-4">
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
            <Select label="Tipo" name="type" required>
              {reminderTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
            <Input label="Data limite" name="dueDate" type="date" required />
            <Input label="Titulo" name="title" required />
          </div>
          <Textarea label="Mensagem" name="message" />
          <Button type="submit">Criar lembrete</Button>
        </form>
      </Card>

      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Titulo</Th>
              <Th>Cliente</Th>
              <Th>Veiculo</Th>
              <Th>Tipo</Th>
              <Th>Data</Th>
              <Th>Status</Th>
              <Th>Atualizar</Th>
            </tr>
          </thead>
          <tbody>
            {reminders.map((reminder) => (
              <tr key={reminder.id}>
                <Td>{reminder.title}</Td>
                <Td>{reminder.customer.name}</Td>
                <Td>{reminder.vehicle.maker} {reminder.vehicle.model}</Td>
                <Td>{reminder.type}</Td>
                <Td>{formatDate(reminder.dueDate)}</Td>
                <Td><StatusBadge status={reminder.status} /></Td>
                <Td>
                  <form action={updateReminderStatusAction} className="flex gap-2">
                    <input type="hidden" name="id" value={reminder.id} />
                    <Select name="status" defaultValue={reminder.status} aria-label="Status">
                      {reminderStatuses.map((status) => (
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
