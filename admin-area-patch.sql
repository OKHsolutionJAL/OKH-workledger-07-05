-- OKH WorkLedger - Admin area patch
-- Run this file in Supabase SQL Editor when the admin tables already exist
-- or when /admin opens empty/redirects for an admin user.
-- This script is safe: it does not delete data.

alter table if exists public.profiles
  add column if not exists role text not null default 'client',
  add column if not exists full_name text,
  add column if not exists preferred_language text not null default 'pt',
  add column if not exists account_status text not null default 'active',
  add column if not exists subscription_status text not null default 'free',
  add column if not exists plan_id uuid,
  add column if not exists market text not null default 'JP',
  add column if not exists currency text not null default 'JPY',
  add column if not exists last_login_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.profiles drop constraint if exists profiles_role_check;
alter table if exists public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'client', 'support', 'accountant', 'student', 'collaborator', 'media_editor'));

alter table if exists public.profiles drop constraint if exists profiles_account_status_check;
alter table if exists public.profiles
  add constraint profiles_account_status_check
  check (account_status in ('active', 'blocked', 'suspended', 'trial'));

alter table if exists public.profiles drop constraint if exists profiles_subscription_status_check;
alter table if exists public.profiles
  add constraint profiles_subscription_status_check
  check (subscription_status in ('free', 'trial', 'active', 'past_due', 'cancelled', 'manual'));

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price_jpy numeric(14,2) not null default 0,
  price_aud numeric(14,2) not null default 0,
  currency text not null default 'JPY',
  billing_cycle text not null default 'monthly',
  max_clients integer not null default 3,
  max_entries_per_month integer not null default 30,
  can_use_japan_documents boolean not null default true,
  can_use_australia_documents boolean not null default false,
  can_use_expenses boolean not null default false,
  can_use_materials boolean not null default false,
  can_use_tax_export boolean not null default false,
  can_use_support boolean not null default false,
  can_use_courses boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.plans (
  name, slug, description, price_jpy, price_aud, currency, billing_cycle,
  max_clients, max_entries_per_month,
  can_use_japan_documents, can_use_australia_documents,
  can_use_expenses, can_use_materials, can_use_tax_export,
  can_use_support, can_use_courses, is_active
)
values
  ('Free', 'free', 'Plano gratuito para testar o OKH WorkLedger.', 0, 0, 'JPY', 'monthly', 2, 30, true, false, false, false, false, false, false, true),
  ('Starter', 'starter', 'Plano inicial para autonomos com poucos clientes.', 1980, 19, 'JPY', 'monthly', 10, 200, true, false, false, false, false, false, false, true),
  ('Pro', 'pro', 'Plano completo com despesas, materiais, documentos e exportacao.', 3980, 39, 'JPY', 'monthly', 50, 1000, true, true, true, true, true, true, false, true),
  ('Business', 'business', 'Plano avancado para pequenas empresas de servico.', 7980, 79, 'JPY', 'monthly', 200, 5000, true, true, true, true, true, true, true, true)
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    price_jpy = excluded.price_jpy,
    price_aud = excluded.price_aud,
    currency = excluded.currency,
    billing_cycle = excluded.billing_cycle,
    max_clients = excluded.max_clients,
    max_entries_per_month = excluded.max_entries_per_month,
    can_use_japan_documents = excluded.can_use_japan_documents,
    can_use_australia_documents = excluded.can_use_australia_documents,
    can_use_expenses = excluded.can_use_expenses,
    can_use_materials = excluded.can_use_materials,
    can_use_tax_export = excluded.can_use_tax_export,
    can_use_support = excluded.can_use_support,
    can_use_courses = excluded.can_use_courses,
    is_active = excluded.is_active,
    updated_at = now();

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete set null,
  status text not null default 'free',
  billing_provider text not null default 'manual',
  billing_provider_customer_id text,
  billing_provider_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  cancel_at timestamptz,
  cancelled_at timestamptz,
  manual_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.subscriptions
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists plan_id uuid references public.plans(id) on delete set null,
  add column if not exists status text not null default 'free',
  add column if not exists billing_provider text not null default 'manual',
  add column if not exists billing_provider_customer_id text,
  add column if not exists billing_provider_subscription_id text,
  add column if not exists current_period_start timestamptz,
  add column if not exists current_period_end timestamptz,
  add column if not exists trial_ends_at timestamptz,
  add column if not exists cancel_at timestamptz,
  add column if not exists cancelled_at timestamptz,
  add column if not exists manual_notes text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.subscriptions drop constraint if exists subscriptions_status_check;
alter table if exists public.subscriptions
  add constraint subscriptions_status_check
  check (status in ('free', 'trial', 'active', 'past_due', 'cancelled', 'manual'));

alter table if exists public.subscriptions drop constraint if exists subscriptions_billing_provider_check;
alter table if exists public.subscriptions
  add constraint subscriptions_billing_provider_check
  check (billing_provider in ('manual', 'stripe', 'paypal', 'square'));

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid,
  plan_id uuid references public.plans(id) on delete set null,
  amount numeric(14,2) not null default 0,
  currency text not null default 'JPY',
  status text not null default 'pending',
  payment_method text,
  billing_provider text not null default 'manual',
  provider_payment_id text,
  due_date date,
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.payments
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists subscription_id uuid,
  add column if not exists plan_id uuid references public.plans(id) on delete set null,
  add column if not exists amount numeric(14,2) not null default 0,
  add column if not exists currency text not null default 'JPY',
  add column if not exists status text not null default 'pending',
  add column if not exists payment_method text,
  add column if not exists billing_provider text not null default 'manual',
  add column if not exists provider_payment_id text,
  add column if not exists due_date date,
  add column if not exists paid_at timestamptz,
  add column if not exists notes text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.user_module_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_name text not null,
  is_enabled boolean not null default true,
  enabled_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, module_name)
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  message text not null,
  status text not null default 'open',
  priority text not null default 'medium',
  admin_response text,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table if not exists public.external_exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid,
  client_name text,
  client_company_name text,
  client_country text,
  document_id uuid,
  export_type text not null default 'tax_declaration_data',
  target_system text not null default 'okh_tax_system',
  status text not null default 'pending',
  period_year integer,
  period_month smallint,
  currency text not null default 'JPY',
  gross_amount numeric(14,2) not null default 0,
  tax_amount numeric(14,2) not null default 0,
  net_amount numeric(14,2) not null default 0,
  expenses_amount numeric(14,2) not null default 0,
  total_hours numeric(12,2) not null default 0,
  worked_days integer not null default 0,
  market text not null default 'JP',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz,
  error_message text
);

alter table if exists public.external_exports
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists client_id uuid,
  add column if not exists client_name text,
  add column if not exists client_company_name text,
  add column if not exists client_country text,
  add column if not exists document_id uuid,
  add column if not exists export_type text not null default 'tax_declaration_data',
  add column if not exists target_system text not null default 'okh_tax_system',
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
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists sent_at timestamptz,
  add column if not exists error_message text;

create table if not exists public.admin_settings (
  id uuid primary key default gen_random_uuid(),
  system_name text not null default 'OKH WorkLedger',
  support_email text,
  default_market text not null default 'JP',
  default_currency text not null default 'JPY',
  free_trial_days integer not null default 14,
  trial_days integer not null default 14,
  payment_block_message text not null default 'Sua conta esta bloqueada. Entre em contato com o suporte.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references auth.users(id) on delete set null,
  target_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into public.admin_settings (system_name, default_market, default_currency)
select 'OKH WorkLedger', 'JP', 'JPY'
where not exists (select 1 from public.admin_settings);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'client');
$$;

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.user_module_access enable row level security;
alter table public.support_tickets enable row level security;
alter table public.external_exports enable row level security;
alter table public.admin_settings enable row level security;
alter table public.admin_audit_logs enable row level security;

drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin
on public.profiles for select
to authenticated
using (auth.uid() = id or public.is_admin());

drop policy if exists profiles_update_own_or_admin on public.profiles;
create policy profiles_update_own_or_admin
on public.profiles for update
to authenticated
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

drop policy if exists profiles_insert_own_or_admin on public.profiles;
create policy profiles_insert_own_or_admin
on public.profiles for insert
to authenticated
with check (auth.uid() = id or public.is_admin());

drop policy if exists clients_select_own_or_admin on public.clients;
create policy clients_select_own_or_admin
on public.clients for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists plans_select_authenticated on public.plans;
create policy plans_select_authenticated
on public.plans for select
to authenticated
using (true);

drop policy if exists plans_admin_all on public.plans;
create policy plans_admin_all
on public.plans for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists subscriptions_select_own_or_admin on public.subscriptions;
create policy subscriptions_select_own_or_admin
on public.subscriptions for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists subscriptions_admin_all on public.subscriptions;
create policy subscriptions_admin_all
on public.subscriptions for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists payments_select_own_or_admin on public.payments;
create policy payments_select_own_or_admin
on public.payments for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists payments_admin_all on public.payments;
create policy payments_admin_all
on public.payments for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists user_module_access_select_own_or_admin on public.user_module_access;
create policy user_module_access_select_own_or_admin
on public.user_module_access for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists user_module_access_admin_all on public.user_module_access;
create policy user_module_access_admin_all
on public.user_module_access for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists support_tickets_select_own_or_admin on public.support_tickets;
create policy support_tickets_select_own_or_admin
on public.support_tickets for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists support_tickets_insert_own_or_admin on public.support_tickets;
create policy support_tickets_insert_own_or_admin
on public.support_tickets for insert
to authenticated
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists support_tickets_update_own_or_admin on public.support_tickets;
create policy support_tickets_update_own_or_admin
on public.support_tickets for update
to authenticated
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists external_exports_select_own_or_admin on public.external_exports;
create policy external_exports_select_own_or_admin
on public.external_exports for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists external_exports_insert_own_or_admin on public.external_exports;
create policy external_exports_insert_own_or_admin
on public.external_exports for insert
to authenticated
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists external_exports_update_admin on public.external_exports;
create policy external_exports_update_admin
on public.external_exports for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists admin_settings_select_admin on public.admin_settings;
create policy admin_settings_select_admin
on public.admin_settings for select
to authenticated
using (public.is_admin());

drop policy if exists admin_settings_update_admin on public.admin_settings;
create policy admin_settings_update_admin
on public.admin_settings for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists admin_audit_logs_select_admin on public.admin_audit_logs;
create policy admin_audit_logs_select_admin
on public.admin_audit_logs for select
to authenticated
using (public.is_admin());

drop policy if exists admin_audit_logs_insert_admin on public.admin_audit_logs;
create policy admin_audit_logs_insert_admin
on public.admin_audit_logs for insert
to authenticated
with check (public.is_admin());

do $$
begin
  if to_regclass('public.work_entries') is not null then
    execute 'alter table public.work_entries enable row level security';
    execute 'drop policy if exists work_entries_select_own_or_admin on public.work_entries';
    execute 'create policy work_entries_select_own_or_admin on public.work_entries for select to authenticated using (auth.uid() = user_id or public.is_admin())';
  end if;

  if to_regclass('public.time_entries') is not null then
    execute 'alter table public.time_entries enable row level security';
    execute 'drop policy if exists time_entries_select_own_or_admin on public.time_entries';
    execute 'create policy time_entries_select_own_or_admin on public.time_entries for select to authenticated using (auth.uid() = user_id or public.is_admin())';
  end if;
end $$;

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists clients_user_id_idx on public.clients(user_id);
create index if not exists subscriptions_user_status_idx on public.subscriptions(user_id, status);
create index if not exists payments_user_status_idx on public.payments(user_id, status);
create index if not exists user_module_access_user_module_idx on public.user_module_access(user_id, module_name);
create index if not exists support_tickets_user_status_idx on public.support_tickets(user_id, status);
create index if not exists external_exports_user_period_idx on public.external_exports(user_id, period_year desc, period_month desc);
create index if not exists admin_audit_logs_admin_idx on public.admin_audit_logs(admin_user_id, created_at desc);
