import { createServiceAction, toggleServiceAction, updateServiceAction } from "@/actions/services";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatYen } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireShopUser } from "@/lib/tenant";

export default async function ServicesPage() {
  const { companyId } = await requireShopUser();
  const services = await prisma.service.findMany({
    where: { companyId },
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });

  return (
    <>
      <PageHeader title="Servicos" description="Catalogo de servicos da loja." />

      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardTitle>Novo servico</CardTitle>
          <form action={createServiceAction} className="mt-4 grid gap-4">
            <Input label="Nome" name="name" required />
            <Input label="Categoria" name="category" placeholder="Manutencao, Shaken, Lavagem" required />
            <Input label="Preco (yen)" name="price" type="number" min={0} />
            <Input label="Duracao (min)" name="durationMin" type="number" min={0} />
            <Textarea label="Descricao" name="description" />
            <Button type="submit">Criar servico</Button>
          </form>
        </Card>

        <div className="grid gap-4">
          {services.map((service) => (
            <Card key={service.id}>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>{service.name}</CardTitle>
                  <p className="text-sm text-slate-500">
                    {service.category} · {formatYen(service.price)} · {service.durationMin ?? "-"} min
                  </p>
                </div>
                <StatusBadge status={service.active} />
              </div>
              <form action={updateServiceAction} className="grid gap-4">
                <input type="hidden" name="id" value={service.id} />
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="Nome" name="name" defaultValue={service.name} required />
                  <Input label="Categoria" name="category" defaultValue={service.category} required />
                  <Input label="Preco" name="price" type="number" min={0} defaultValue={service.price ?? ""} />
                  <Input label="Duracao" name="durationMin" type="number" min={0} defaultValue={service.durationMin ?? ""} />
                </div>
                <Textarea label="Descricao" name="description" defaultValue={service.description ?? ""} />
                <div className="flex flex-wrap gap-2">
                  <Button type="submit">Salvar</Button>
                </div>
              </form>
              <form action={toggleServiceAction} className="mt-2">
                <input type="hidden" name="id" value={service.id} />
                <Button type="submit" variant="secondary">
                  {service.active ? "Desativar" : "Ativar"}
                </Button>
              </form>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
