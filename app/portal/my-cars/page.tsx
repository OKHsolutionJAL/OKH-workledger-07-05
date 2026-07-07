import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { getCustomerScope } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function MyCarsPage() {
  const { companyId, customerId } = await getCustomerScope();
  const vehicles = await prisma.vehicle.findMany({
    where: { companyId, customerId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeader title="Meus carros" description="Veiculos vinculados ao seu cadastro." />
      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Veiculo</Th>
              <Th>Placa</Th>
              <Th>Km</Th>
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
