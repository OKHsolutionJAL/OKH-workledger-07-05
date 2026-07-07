import { notFound } from "next/navigation";
import { setCompanyStatusAction, updateCompanyAction } from "@/actions/admin";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, Td, Th } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

type CompanyDetailProps = {
  params: Promise<{ id: string }>;
};

export default async function CompanyDetailPage({ params }: CompanyDetailProps) {
  const { id } = await params;
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      users: { orderBy: { createdAt: "desc" } },
      subscriptions: {
        include: { plan: true },
        orderBy: { startedAt: "desc" },
      },
      _count: {
        select: {
          customers: true,
          vehicles: true,
          appointments: true,
        },
      },
    },
  });

  if (!company) notFound();

  return (
    <>
      <PageHeader
        title={company.name}
        description={`Slug: ${company.slug}`}
        actions={<StatusBadge status={company.status} />}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Clientes</p>
          <p className="mt-2 text-3xl font-semibold">{company._count.customers}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Veiculos</p>
          <p className="mt-2 text-3xl font-semibold">{company._count.vehicles}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Agendamentos</p>
          <p className="mt-2 text-3xl font-semibold">{company._count.appointments}</p>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <form action={updateCompanyAction}>
          <Card className="grid gap-4">
            <CardTitle>Editar loja</CardTitle>
            <input type="hidden" name="id" value={company.id} />
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Nome" name="name" defaultValue={company.name} required />
              <Input label="Slug" name="slug" defaultValue={company.slug} required />
              <Input label="Telefone" name="phone" defaultValue={company.phone ?? ""} />
              <Input label="Email" name="email" type="email" defaultValue={company.email ?? ""} />
              <Input label="Cidade" name="city" defaultValue={company.city ?? ""} />
              <Input label="Provincia" name="prefecture" defaultValue={company.prefecture ?? ""} />
              <Input label="Codigo postal" name="postalCode" defaultValue={company.postalCode ?? ""} />
              <Input label="Logo URL" name="logoUrl" defaultValue={company.logoUrl ?? ""} />
            </div>
            <Textarea label="Endereco" name="address" defaultValue={company.address ?? ""} />
            <Button type="submit">Salvar alteracoes</Button>
          </Card>
        </form>

        <Card className="grid content-start gap-4">
          <CardTitle>Status</CardTitle>
          <p className="text-sm text-slate-500">Criada em {formatDate(company.createdAt)}</p>
          <form action={setCompanyStatusAction}>
            <input type="hidden" name="id" value={company.id} />
            <input
              type="hidden"
              name="status"
              value={company.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"}
            />
            <Button type="submit" variant={company.status === "ACTIVE" ? "danger" : "primary"}>
              {company.status === "ACTIVE" ? "Desativar loja" : "Ativar loja"}
            </Button>
          </form>
        </Card>
      </section>

      <Card>
        <CardTitle>Usuarios</CardTitle>
        <Table className="mt-4">
          <thead>
            <tr>
              <Th>Nome</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {company.users.map((user) => (
              <tr key={user.id}>
                <Td>{user.name}</Td>
                <Td>{user.email}</Td>
                <Td>{user.role}</Td>
                <Td>
                  <StatusBadge status={user.status} />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
