import { createCustomerAction } from "@/actions/customers";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NewCustomerPage() {
  return (
    <>
      <PageHeader title="Novo cliente" description="Cadastro operacional da loja." />
      <Card>
        <form action={createCustomerAction} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Nome" name="name" required />
            <Input label="Telefone" name="phone" />
            <Input label="Email" name="email" type="email" />
            <Input label="LINE ID" name="lineId" />
            <Input label="WhatsApp" name="whatsapp" />
            <Input label="Idioma" name="language" defaultValue="pt" />
          </div>
          <Textarea label="Endereco" name="address" />
          <Textarea label="Notas" name="notes" />
          <Button type="submit">Criar cliente</Button>
        </form>
      </Card>
    </>
  );
}
