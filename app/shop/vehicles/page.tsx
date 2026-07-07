import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireShopUser } from "@/lib/tenant";

export default async function VehiclesPage() {
  const { companyId } = await requireShopUser();
  const vehicles = await prisma.vehicle.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });

  return (
    <>
      <PageHeader
        title="Veiculos"
        description="Frota dos clientes desta loja."
        actions={<Link href="/shop/vehicles/new" className={buttonClasses()}>Novo veiculo</Link>}
      />
      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Veiculo</Th>
              <Th>Cliente</Th>
              <Th>Placa</Th>
              <Th>Quilometragem</Th>
              <Th>Shaken</Th>
              <Th>Seguro</Th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <Td>
                  <Link href={`/shop/vehicles/${vehicle.id}`} className="font-semibold text-slate-950 hover:underline">
                    {vehicle.maker} {vehicle.model}
                  </Link>
                </Td>
                <Td>{vehicle.customer.name}</Td>
                <Td>{vehicle.plateNumber ?? "-"}</Td>
                <Td>{vehicle.mileage ? `${vehicle.mileage.toLocaleString("pt-BR")} km` : "-"}</Td>
                <Td>{formatDate(vehicle.shakenExpiry)}</Td>
                <Td>{formatDate(vehicle.insuranceExpiry)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
