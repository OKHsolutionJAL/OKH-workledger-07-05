import { createCompanyAction } from "@/actions/admin";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NewCompanyPage() {
  return (
    <>
      <PageHeader
        title="Nova loja"
        description="Crie a empresa e o primeiro usuario SHOP_ADMIN."
      />

      <form action={createCompanyAction} className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="grid gap-4">
          <CardTitle>Dados da loja</CardTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Nome" name="name" required />
            <Input label="Slug" name="slug" placeholder="aimei-garage" required />
            <Input label="Telefone" name="phone" />
            <Input label="Email" name="email" type="email" />
            <Input label="Cidade" name="city" />
            <Input label="Provincia" name="prefecture" />
            <Input label="Codigo postal" name="postalCode" />
            <Input label="Logo URL" name="logoUrl" />
          </div>
          <Textarea label="Endereco" name="address" />
        </Card>

        <Card className="grid content-start gap-4">
          <CardTitle>Primeiro admin</CardTitle>
          <Input label="Nome" name="adminName" required />
          <Input label="Email" name="adminEmail" type="email" required />
          <Input label="Senha inicial" name="adminPassword" type="password" minLength={8} required />
          <Button type="submit">Criar loja</Button>
        </Card>
      </form>
    </>
  );
}
