import { createVehicleAction } from "@/actions/vehicles";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/prisma";
import { requireShopUser } from "@/lib/tenant";

export default async function NewVehiclePage() {
  const { companyId } = await requireShopUser();
  const customers = await prisma.customer.findMany({
    where: { companyId },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <PageHeader title="Novo veiculo" description="Vincule o carro a um cliente da loja." />
      <Card>
        <form action={createVehicleAction} className="grid gap-4">
          <Select label="Cliente" name="customerId" required>
            <option value="">Selecione</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </Select>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Marca" name="maker" required />
            <Input label="Modelo" name="model" required />
            <Input label="Ano" name="year" type="number" min={1900} />
            <Input label="Cor" name="color" />
            <Input label="Placa" name="plateNumber" />
            <Input label="Chassi" name="chassisNumber" />
            <Input label="Quilometragem" name="mileage" type="number" min={0} />
            <Input label="Data de compra" name="purchaseDate" type="date" />
            <Input label="Vencimento Shaken" name="shakenExpiry" type="date" />
            <Input label="Vencimento Seguro" name="insuranceExpiry" type="date" />
            <Input label="Imagem URL" name="imageUrl" />
          </div>
          <Textarea label="Notas" name="notes" />
          <Button type="submit">Criar veiculo</Button>
        </form>
      </Card>
    </>
  );
}
