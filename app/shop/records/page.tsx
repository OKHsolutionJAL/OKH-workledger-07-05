import { createServiceRecordAction } from "@/actions/records";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatYen } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireShopUser } from "@/lib/tenant";

export default async function RecordsPage() {
  const { companyId } = await requireShopUser();
  const [records, customers, vehicles, services] = await Promise.all([
    prisma.serviceRecord.findMany({
      where: { companyId },
      orderBy: { performedAt: "desc" },
      include: { customer: true, vehicle: true, service: true },
    }),
    prisma.customer.findMany({ where: { companyId }, orderBy: { name: "asc" } }),
    prisma.vehicle.findMany({ where: { companyId }, include: { customer: true }, orderBy: { createdAt: "desc" } }),
    prisma.service.findMany({ where: { companyId }, orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <PageHeader title="Historico de servicos" description="Registros reais de manutencao e atendimento." />

      <Card>
        <CardTitle>Novo registro</CardTitle>
        <form action={createServiceRecordAction} className="mt-4 grid gap-4">
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
            <Input label="Titulo" name="title" required />
            <Input label="Data realizada" name="performedAt" type="date" />
            <Input label="Quilometragem" name="mileage" type="number" min={0} />
            <Input label="Preco (yen)" name="price" type="number" min={0} />
            <Input label="Antes imagem URL" name="beforeImageUrl" />
            <Input label="Depois imagem URL" name="afterImageUrl" />
          </div>
          <Textarea label="Descricao" name="description" />
          <Textarea label="Notas" name="notes" />
          <Button type="submit">Criar registro</Button>
        </form>
      </Card>

      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Titulo</Th>
              <Th>Cliente</Th>
              <Th>Veiculo</Th>
              <Th>Data</Th>
              <Th>Km</Th>
              <Th>Valor</Th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <Td>{record.title}</Td>
                <Td>{record.customer.name}</Td>
                <Td>{record.vehicle.maker} {record.vehicle.model}</Td>
                <Td>{formatDate(record.performedAt)}</Td>
                <Td>{record.mileage ? `${record.mileage.toLocaleString("pt-BR")} km` : "-"}</Td>
                <Td>{formatYen(record.price)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
