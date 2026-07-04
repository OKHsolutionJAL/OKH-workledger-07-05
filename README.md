# OKH WorkLedger

Controle de servicos, horas, despesas e documentos para autonomos no Japao e Australia.

Work, expenses, invoices and reports for contractors in Japan and Australia.

日本とオーストラリア向けの作業・経費・請求書管理システム

## Tecnologias

- Next.js com App Router
- TypeScript
- Tailwind CSS
- Supabase Database
- Supabase Auth com e-mail e senha
- Row Level Security por usuario
- Documentos A4 por preview HTML e impressao/PDF do navegador
- Estrutura preparada para PWA

## Como rodar localmente

No Windows, voce tambem pode dar dois cliques no arquivo:

```text
abrir-previa.bat
```

Ele inicia a previa em `http://localhost:3000`.

1. Instale as dependencias:

```bash
npm install
```

2. Crie o arquivo de ambiente:

```bash
cp .env.example .env.local
```

3. Preencha `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Rode o projeto:

```bash
npm run dev
```

5. Abra `http://localhost:3000`.

## Configuracao do Supabase

1. Crie um projeto no Supabase.
2. Abra o SQL Editor.
3. Execute o arquivo `supabase/schema.sql`.
4. Em Authentication > Providers, mantenha Email habilitado.
5. Em Authentication > URL Configuration, configure:

```text
Site URL: http://localhost:3000
Redirect URLs:
http://localhost:3000/**
https://seu-dominio.vercel.app/**
```

O SQL cria:

- `profiles`
- `clients`
- `time_entries`
- `work_entries`
- `monthly_reports`
- `external_exports`
- `plans`
- `subscriptions`
- `payments`
- `user_module_access`
- `support_tickets`
- `admin_audit_logs`
- `admin_settings`
- gatilho para criar perfil automaticamente no cadastro
- politicas RLS para impedir acesso a dados de outros usuarios

## Rotas principais

- `/login`
- `/register`
- `/forgot-password`
- `/dashboard`
- `/profile`
- `/clients`
- `/timecard`
- `/documents`
- `/reports`
- `/reports/[id]`
- `/documents/preview`
- `/settings`
- `/admin`
- `/admin/users`
- `/admin/clients`
- `/admin/plans`
- `/admin/modules`
- `/admin/payments`
- `/admin/support`
- `/admin/exports`
- `/admin/settings`

## Lancamentos

A rota `/timecard` foi mantida por compatibilidade, mas a area principal agora se chama Lancamentos / Work Entries.

Tipos suportados:

- Trabalho por hora
- Trabalho por dia
- Servico fechado
- Despesa cobravel do cliente
- Despesa interna do negocio
- Material
- Desconto/Ajuste

Dados antigos em `time_entries` continuam funcionando. Novos registros amplos sao salvos em `work_entries`.

## Documentos

O OKH WorkLedger gera documentos profissionais por mercado:

- Japao: documentos sempre em japones, com suporte a caracteres japoneses e valores em JPY.
- Australia: documentos sempre em ingles australiano, com AUD, GST, ABN, BSB e dados bancarios.

A geracao usa HTML A4 com `window.print()`, preservando fontes e layout no preview e no PDF salvo pelo navegador.

## Declaracao / exportacao

O botao "Enviar dados para declaracao" prepara um payload com cliente, periodo, mercado, moeda, receitas, despesas, materiais, servicos fechados, horas, dias, impostos e totais, salvando em `external_exports`.

## Area administrativa

A area `/admin` e protegida por `profiles.role = 'admin'`.

Recursos incluidos:

- dashboard administrativo
- controle de usuarios, roles, status da conta e assinatura
- controle manual de planos
- liberacao/bloqueio de modulos por usuario
- pagamentos manuais
- suporte/tickets
- consulta de exportacoes para declaracao
- configuracoes gerais do SaaS
- logs de auditoria em `admin_audit_logs`

Para transformar seu usuario em admin pelo e-mail:

```sql
update public.profiles p
set role = 'admin'
from auth.users u
where p.id = u.id
  and u.email = 'SEU_EMAIL_AQUI';
```

Ou pelo ID do usuario:

```sql
update public.profiles
set role = 'admin'
where id = 'MEU_USER_ID';
```

## PWA

O arquivo `public/manifest.webmanifest` e os icones SVG ja estao incluidos. Depois do deploy em HTTPS, o navegador pode oferecer a opcao de instalar o app no celular.

## Deploy no Vercel

1. Envie o projeto para um repositorio Git.
2. Importe o repositorio no Vercel.
3. Configure as variaveis de ambiente:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL
```

4. Rode o deploy.
5. No Supabase, adicione a URL final do Vercel nas Redirect URLs.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
```

## Observacoes de produto

- Nao ha dados falsos fixos no codigo final.
- Cada usuario enxerga somente os proprios dados via RLS.
- Clientes removidos nao apagam registros antigos; os lancamentos ficam preservados.
- Trabalho por hora continua existindo como um tipo dentro de Lancamentos.
- O MVP foi estruturado para evoluir para SaaS com planos, storage de logos e envio automatico de documentos.
