import { updateShopSettingsAction } from "@/actions/settings";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { prisma } from "@/lib/prisma";
import { requireShopUser } from "@/lib/tenant";

export default async function ShopSettingsPage() {
  const { companyId } = await requireShopUser();
  const company = await prisma.company.findUniqueOrThrow({
    where: { id: companyId },
  });

  return (
    <>
      <PageHeader title="Configuracoes" description="Dados basicos exibidos para operacao da loja." />
      <Card>
        <form action={updateShopSettingsAction} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Nome da loja" name="name" defaultValue={company.name} required />
            <Input label="Telefone" name="phone" defaultValue={company.phone ?? ""} />
            <Input label="Email" name="email" type="email" defaultValue={company.email ?? ""} />
            <Input label="Cidade" name="city" defaultValue={company.city ?? ""} />
            <Input label="Provincia" name="prefecture" defaultValue={company.prefecture ?? ""} />
            <Input label="Codigo postal" name="postalCode" defaultValue={company.postalCode ?? ""} />
          </div>
          <Textarea label="Endereco" name="address" defaultValue={company.address ?? ""} />
          <Button type="submit">Salvar configuracoes</Button>
        </form>
      </Card>
    </>
  );
}
