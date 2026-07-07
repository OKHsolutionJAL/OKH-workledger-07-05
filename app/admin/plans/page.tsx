import { createPlanAction, togglePlanAction } from "@/actions/admin";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, Td, Th } from "@/components/ui/table";
import { formatYen } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function PlansPage() {
  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeader title="Planos" description="Planos comerciais para lojas no SaaS." />

      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardTitle>Novo plano</CardTitle>
          <form action={createPlanAction} className="mt-4 grid gap-4">
            <Input label="Nome" name="name" required />
            <Input label="Mensalidade (yen)" name="priceMonthly" type="number" min={0} required />
            <Input label="Limite de clientes" name="customerLimit" type="number" min={0} />
            <Input label="Limite de veiculos" name="vehicleLimit" type="number" min={0} />
            <Button type="submit">Criar plano</Button>
          </form>
        </Card>

        <Card>
          <Table>
            <thead>
              <tr>
                <Th>Plano</Th>
                <Th>Preco</Th>
                <Th>Clientes</Th>
                <Th>Veiculos</Th>
                <Th>Status</Th>
                <Th>Acoes</Th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <Td className="font-semibold text-slate-950">{plan.name}</Td>
                  <Td>{formatYen(plan.priceMonthly)}</Td>
                  <Td>{plan.customerLimit ?? "Ilimitado"}</Td>
                  <Td>{plan.vehicleLimit ?? "Ilimitado"}</Td>
                  <Td>
                    <StatusBadge status={plan.active} />
                  </Td>
                  <Td>
                    <form action={togglePlanAction}>
                      <input type="hidden" name="id" value={plan.id} />
                      <Button type="submit" variant="secondary">
                        {plan.active ? "Desativar" : "Ativar"}
                      </Button>
                    </form>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </section>
    </>
  );
}
