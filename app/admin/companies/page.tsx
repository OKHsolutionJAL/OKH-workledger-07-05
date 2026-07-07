import Link from "next/link";
import { setCompanyStatusAction } from "@/actions/admin";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { buttonClasses, Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, Td, Th } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          customers: true,
          vehicles: true,
          users: true,
        },
      },
    },
  });

  return (
    <>
      <PageHeader
        title="Lojas"
        description="Gerencie empresas, ativacao e acesso inicial de cada shop."
        actions={
          <Link href="/admin/companies/new" className={buttonClasses()}>
            Nova loja
          </Link>
        }
      />

      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Nome</Th>
              <Th>Slug</Th>
              <Th>Status</Th>
              <Th>Usuarios</Th>
              <Th>Clientes</Th>
              <Th>Veiculos</Th>
              <Th>Acoes</Th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id}>
                <Td>
                  <Link className="font-semibold text-slate-950 hover:underline" href={`/admin/companies/${company.id}`}>
                    {company.name}
                  </Link>
                </Td>
                <Td>{company.slug}</Td>
                <Td>
                  <StatusBadge status={company.status} />
                </Td>
                <Td>{company._count.users}</Td>
                <Td>{company._count.customers}</Td>
                <Td>{company._count.vehicles}</Td>
                <Td>
                  <form action={setCompanyStatusAction}>
                    <input type="hidden" name="id" value={company.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={company.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"}
                    />
                    <Button type="submit" variant="secondary">
                      {company.status === "ACTIVE" ? "Desativar" : "Ativar"}
                    </Button>
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
