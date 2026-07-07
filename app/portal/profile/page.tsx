import { updatePortalProfileAction } from "@/actions/portal";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getCustomerScope } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PortalProfilePage() {
  const { companyId, customerId } = await getCustomerScope();
  const customer = await prisma.customer.findFirstOrThrow({
    where: { id: customerId, companyId },
  });

  return (
    <>
      <PageHeader title="Meu perfil" description="Dados de contato visiveis para a loja." />
      <Card>
        <form action={updatePortalProfileAction} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Nome" name="name" defaultValue={customer.name} required />
            <Input label="Telefone" name="phone" defaultValue={customer.phone ?? ""} />
            <Input label="Email" name="email" type="email" defaultValue={customer.email ?? ""} />
            <Input label="LINE ID" name="lineId" defaultValue={customer.lineId ?? ""} />
            <Input label="WhatsApp" name="whatsapp" defaultValue={customer.whatsapp ?? ""} />
            <Input label="Idioma" name="language" defaultValue={customer.language} />
          </div>
          <Textarea label="Endereco" name="address" defaultValue={customer.address ?? ""} />
          <Button type="submit">Salvar perfil</Button>
        </form>
      </Card>
    </>
  );
}
