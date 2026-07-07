import { redirect } from "next/navigation";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCurrentUser, getRoleHome } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect(getRoleHome(user.role));
  }

  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            OKH AutoCare
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">Entrar no portal</h1>
          <p className="mt-2 text-sm text-slate-500">
            Acesse o painel da OKH, da loja ou o portal do cliente.
          </p>
        </div>

        {error ? (
          <div className="mb-5 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error === "inactive"
              ? "Conta ou loja inativa."
              : "Email ou senha invalidos."}
          </div>
        ) : null}

        <form action={loginAction} className="grid gap-4">
          <Input label="Email" name="email" type="email" autoComplete="email" required />
          <Input
            label="Senha"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
          <Button type="submit" className="mt-2 w-full">
            Entrar
          </Button>
        </form>
      </Card>
    </main>
  );
}
