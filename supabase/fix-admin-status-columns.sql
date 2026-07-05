-- OKH WorkLedger - Fix para erro: column "status" does not exist
-- Rode este arquivo primeiro se o Supabase parar no erro 42703.

alter table if exists public.payments
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists amount numeric(14,2) not null default 0,
  add column if not exists currency text not null default 'JPY',
  add column if not exists status text not null default 'pending',
  add column if not exists payment_method text,
  add column if not exists billing_provider text not null default 'manual',
  add column if not exists due_date date,
  add column if not exists paid_at timestamptz,
  add column if not exists notes text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.support_tickets
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists subject text not null default 'Suporte',
  add column if not exists message text not null default '',
  add column if not exists status text not null default 'open',
  add column if not exists priority text not null default 'medium',
  add column if not exists admin_response text,
  add column if not exists closed_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.external_exports
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists status text not null default 'pending',
  add column if not exists period_year integer,
  add column if not exists period_month smallint,
  add column if not exists currency text not null default 'JPY',
  add column if not exists gross_amount numeric(14,2) not null default 0,
  add column if not exists tax_amount numeric(14,2) not null default 0,
  add column if not exists net_amount numeric(14,2) not null default 0,
  add column if not exists expenses_amount numeric(14,2) not null default 0,
  add column if not exists total_hours numeric(12,2) not null default 0,
  add column if not exists worked_days integer not null default 0,
  add column if not exists market text not null default 'JP',
  add column if not exists payload jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();
