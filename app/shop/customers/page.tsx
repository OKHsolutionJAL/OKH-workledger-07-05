import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireShopUser } from "@/lib/tenant";

export default async function CustomersPage() {
  const { companyId } = await requireShopUser();
  const customers = await prisma.customer.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          vehicles: true,
          appointments: true,
        },
      },
    },
  });

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Clientes pertencentes somente a esta loja."
        actions={<Link href="/shop/customers/new" className={buttonClasses()}>Novo cliente</Link>}
      />
      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Nome</Th>
              <Th>Contato</Th>
              <Th>Veiculos</Th>
              <Th>Agendamentos</Th>
              <Th>Criado em</Th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <Td>
                  <Link href={`/shop/customers/${customer.id}`} className="font-semibold text-slate-950 hover:underline">
                    {customer.name}
                  </Link>
                </Td>
                <Td>{customer.phone ?? customer.email ?? "-"}</Td>
                <Td>{customer._count.vehicles}</Td>
                <Td>{customer._count.appointments}</Td>
                <Td>{formatDate(customer.createdAt)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
