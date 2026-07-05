export default function AccountBlockedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper p-6">
      <section className="max-w-lg rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="text-sm font-semibold text-jade-700">OKH WorkLedger</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">Plano precisa ser atualizado</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Seu plano precisa ser atualizado para continuar usando o OKH WorkLedger. Entre em contato com o suporte da OKH
          Solution para regularizar a mensalidade ou reativar sua conta.
        </p>
      </section>
    </main>
  );
}
