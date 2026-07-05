-- OKH WorkLedger - Client company portal, contractor search and connection workflow
-- Safe patch: no drop table, no destructive data changes.

alter table if exists public.profiles
  add column if not exists user_type text not null default 'worker',
  add column if not exists client_company_code text,
  add column if not exists phone_normalized text,
  add column if not exists company_name text,
  add column if not exists company_country text not null default 'JP',
  add column if not exists default_currency text not null default 'JPY',
  add column if not exists full_name text,
  add column if not exists owner_name text,
  add column if not exists business_name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists address text,
  add column if not exists business_address text,
  add column if not exists country text not null default 'JP',
  add column if not exists market text not null default 'JP',
  add column if not exists document_market text not null default 'JP',
  add column if not exists default_document_market text not null default 'JP',
  add column if not exists currency text not null default 'JPY',
  add column if not exists invoice_registration_number text,
  add column if not exists japan_invoice_registration_number text,
  add column if not exists australia_abn text,
  add column if not exists abn text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.clients
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists client_company_id uuid references public.profiles(id) on delete set null,
  add column if not exists phone_normalized text,
  add column if not exists client_name text,
  add column if not exists company_name text,
  add column if not exists address text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists contact_person text,
  add column if not exists registration_number text,
  add column if not exists client_country text not null default 'JP',
  add column if not exists preferred_document_market text not null default 'JP',
  add column if not exists currency text not null default 'JPY',
  add column if not exists notes text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.time_entries
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create table if not exists public.work_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  entry_type text not null default 'hourly_work',
  market text not null default 'JP',
  date date not null,
  title text,
  description text,
  location text,
  start_time time,
  end_time time,
  break_minutes integer not null default 0,
  hours numeric(10,2),
  days numeric(10,2),
  quantity numeric(12,3),
  unit text,
  unit_price numeric(14,2),
  hourly_rate numeric(14,2),
  daily_rate numeric(14,2),
  fixed_amount numeric(14,2),
  expense_amount numeric(14,2),
  material_cost numeric(14,2),
  markup_amount numeric(14,2) not null default 0,
  discount_amount numeric(14,2) not null default 0,
  subtotal numeric(14,2) not null default 0,
  tax_amount numeric(14,2) not null default 0,
  total_amount numeric(14,2) not null default 0,
  currency text not null default 'JPY',
  tax_mode text not null default 'exclusive',
  tax_rate numeric(6,3) not null default 0,
  is_billable boolean not null default true,
  is_business_expense boolean not null default false,
  is_client_charge boolean not null default true,
  receipt_url text,
  status text not null default 'billable',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.work_entries
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists client_id uuid references public.clients(id) on delete set null,
  add column if not exists entry_type text not null default 'hourly_work',
  add column if not exists market text not null default 'JP',
  add column if not exists date date not null default current_date,
  add column if not exists title text,
  add column if not exists description text,
  add column if not exists location text,
  add column if not exists start_time time,
  add column if not exists end_time time,
  add column if not exists break_minutes integer not null default 0,
  add column if not exists hours numeric(10,2),
  add column if not exists days numeric(10,2),
  add column if not exists quantity numeric(12,3),
  add column if not exists unit text,
  add column if not exists unit_price numeric(14,2),
  add column if not exists hourly_rate numeric(14,2),
  add column if not exists daily_rate numeric(14,2),
  add column if not exists fixed_amount numeric(14,2),
  add column if not exists expense_amount numeric(14,2),
  add column if not exists material_cost numeric(14,2),
  add column if not exists markup_amount numeric(14,2) not null default 0,
  add column if not exists discount_amount numeric(14,2) not null default 0,
  add column if not exists subtotal numeric(14,2) not null default 0,
  add column if not exists tax_amount numeric(14,2) not null default 0,
  add column if not exists total_amount numeric(14,2) not null default 0,
  add column if not exists currency text not null default 'JPY',
  add column if not exists tax_mode text not null default 'exclusive',
  add column if not exists tax_rate numeric(6,3) not null default 0,
  add column if not exists is_billable boolean not null default true,
  add column if not exists is_business_expense boolean not null default false,
  add column if not exists is_client_charge boolean not null default true,
  add column if not exists receipt_url text,
  add column if not exists status text not null default 'billable',
  add column if not exists client_company_id uuid references public.profiles(id) on delete set null,
  add column if not exists contractor_relationship_id uuid,
  add column if not exists visibility_to_client boolean not null default false,
  add column if not exists sent_to_client_at timestamptz,
  add column if not exists client_review_status text not null default 'draft',
  add column if not exists client_review_comment text,
  add column if not exists client_reviewed_at timestamptz,
  add column if not exists overtime_hours numeric(10,2) not null default 0,
  add column if not exists overtime_rate_percent numeric(6,2) not null default 25,
  add column if not exists night_hours numeric(10,2) not null default 0,
  add column if not exists night_rate_percent numeric(6,2) not null default 25,
  add column if not exists weekend_hours numeric(10,2) not null default 0,
  add column if not exists weekend_rate_percent numeric(6,2) not null default 35,
  add column if not exists holiday_hours numeric(10,2) not null default 0,
  add column if not exists holiday_rate_percent numeric(6,2) not null default 50,
  add column if not exists custom_premium_title text,
  add column if not exists custom_premium_amount numeric(14,2) not null default 0,
  add column if not exists normal_amount numeric(14,2) not null default 0,
  add column if not exists overtime_amount numeric(14,2) not null default 0,
  add column if not exists night_premium_amount numeric(14,2) not null default 0,
  add column if not exists weekend_premium_amount numeric(14,2) not null default 0,
  add column if not exists holiday_premium_amount numeric(14,2) not null default 0,
  add column if not exists premium_total_amount numeric(14,2) not null default 0,
  add column if not exists notes text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.profiles drop constraint if exists profiles_user_type_check;
alter table if exists public.profiles
  add constraint profiles_user_type_check check (user_type in ('admin', 'worker', 'client_company', 'both'));

alter table if exists public.profiles
  add column if not exists overtime_rate_percent numeric(6,2) not null default 25,
  add column if not exists night_rate_percent numeric(6,2) not null default 25,
  add column if not exists weekend_rate_percent numeric(6,2) not null default 35,
  add column if not exists holiday_rate_percent numeric(6,2) not null default 50,
  add column if not exists night_start_time time not null default '22:00',
  add column if not exists night_end_time time not null default '05:00',
  add column if not exists custom_premium_enabled boolean not null default true;

create sequence if not exists public.client_company_code_seq start 1;

create or replace function public.normalize_phone(input_value text)
returns text
language sql
immutable
as $$
  select regexp_replace(coalesce(input_value, ''), '[^0-9+]', '', 'g');
$$;

create or replace function public.mask_phone(input_value text)
returns text
language plpgsql
immutable
as $$
declare
  cleaned text := public.normalize_phone(input_value);
begin
  if cleaned is null or length(cleaned) = 0 then
    return null;
  end if;

  if length(cleaned) <= 4 then
    return '****';
  end if;

  return left(cleaned, greatest(length(cleaned) - 8, 2)) || '****' || right(cleaned, 4);
end;
$$;

create or replace function public.mask_email(input_value text)
returns text
language plpgsql
immutable
as $$
declare
  local_part text;
  domain_part text;
begin
  if input_value is null or position('@' in input_value) = 0 then
    return null;
  end if;

  local_part := split_part(input_value, '@', 1);
  domain_part := split_part(input_value, '@', 2);

  if length(local_part) <= 3 then
    return left(local_part, 1) || '****@' || domain_part;
  end if;

  return left(local_part, 3) || '****@' || domain_part;
end;
$$;

create or replace function public.sync_profile_client_company_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'admin' then
    new.user_type := 'admin';
  end if;

  new.phone_normalized := public.normalize_phone(new.phone);

  if new.user_type in ('client_company', 'both') and (new.client_company_code is null or new.client_company_code = '') then
    new.client_company_code := 'OKH-C-' || lpad(nextval('public.client_company_code_seq')::text, 6, '0');
  end if;

  if new.user_type in ('client_company', 'both') and (new.company_name is null or new.company_name = '') then
    new.company_name := coalesce(nullif(new.business_name, ''), nullif(new.full_name, ''), new.email);
  end if;

  return new;
end;
$$;

drop trigger if exists sync_profile_client_company_fields_trigger on public.profiles;
create trigger sync_profile_client_company_fields_trigger
before insert or update on public.profiles
for each row execute function public.sync_profile_client_company_fields();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  metadata jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  selected_user_type text := coalesce(metadata->>'user_type', 'worker');
  selected_country text := coalesce(metadata->>'company_country', metadata->>'country', metadata->>'market', 'JP');
  selected_currency text := coalesce(metadata->>'default_currency', metadata->>'currency', case when selected_country = 'AU' then 'AUD' else 'JPY' end);
begin
  if selected_user_type not in ('worker', 'client_company', 'both') then
    selected_user_type := 'worker';
  end if;

  insert into public.profiles (
    id,
    email,
    role,
    user_type,
    full_name,
    owner_name,
    business_name,
    company_name,
    phone,
    preferred_language,
    country,
    company_country,
    market,
    document_market,
    default_document_market,
    currency,
    default_currency,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.email,
    'client',
    selected_user_type,
    metadata->>'full_name',
    metadata->>'owner_name',
    metadata->>'business_name',
    coalesce(metadata->>'company_name', metadata->>'business_name', metadata->>'full_name', new.email),
    metadata->>'phone',
    coalesce(metadata->>'preferred_language', 'pt'),
    selected_country,
    selected_country,
    selected_country,
    selected_country,
    selected_country,
    selected_currency,
    selected_currency,
    now(),
    now()
  )
  on conflict (id) do update
  set
    email = excluded.email,
    user_type = excluded.user_type,
    full_name = excluded.full_name,
    owner_name = excluded.owner_name,
    business_name = excluded.business_name,
    company_name = excluded.company_name,
    phone = excluded.phone,
    preferred_language = excluded.preferred_language,
    country = excluded.country,
    company_country = excluded.company_country,
    market = excluded.market,
    document_market = excluded.document_market,
    default_document_market = excluded.default_document_market,
    currency = excluded.currency,
    default_currency = excluded.default_currency,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

update public.profiles
set user_type = 'admin'
where role = 'admin' and user_type <> 'admin';

update public.profiles
set user_type = 'worker'
where user_type is null;

update public.profiles
set phone_normalized = public.normalize_phone(phone)
where phone is not null;

update public.profiles
set company_name = coalesce(nullif(company_name, ''), nullif(business_name, ''), nullif(full_name, ''), email)
where user_type = 'client_company';

update public.profiles
set client_company_code = 'OKH-C-' || lpad(nextval('public.client_company_code_seq')::text, 6, '0')
where user_type in ('client_company', 'both')
  and (client_company_code is null or client_company_code = '');

create table if not exists public.entry_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  entry_type text not null default 'hourly_work',
  client_id uuid references public.clients(id) on delete set null,
  client_company_id uuid,
  contractor_relationship_id uuid,
  market text not null default 'JP',
  currency text not null default 'JPY',
  title text,
  description text,
  location text,
  hourly_rate numeric(14,2),
  daily_rate numeric(14,2),
  unit_price numeric(14,2),
  default_break_minutes integer not null default 0,
  overtime_rate_percent numeric(6,2) not null default 25,
  night_rate_percent numeric(6,2) not null default 25,
  weekend_rate_percent numeric(6,2) not null default 35,
  holiday_rate_percent numeric(6,2) not null default 50,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.entry_templates
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists name text,
  add column if not exists entry_type text not null default 'hourly_work',
  add column if not exists client_id uuid references public.clients(id) on delete set null,
  add column if not exists client_company_id uuid,
  add column if not exists contractor_relationship_id uuid,
  add column if not exists market text not null default 'JP',
  add column if not exists currency text not null default 'JPY',
  add column if not exists title text,
  add column if not exists description text,
  add column if not exists location text,
  add column if not exists hourly_rate numeric(14,2),
  add column if not exists daily_rate numeric(14,2),
  add column if not exists unit_price numeric(14,2),
  add column if not exists default_break_minutes integer not null default 0,
  add column if not exists overtime_rate_percent numeric(6,2) not null default 25,
  add column if not exists night_rate_percent numeric(6,2) not null default 25,
  add column if not exists weekend_rate_percent numeric(6,2) not null default 35,
  add column if not exists holiday_rate_percent numeric(6,2) not null default 50,
  add column if not exists is_default boolean not null default false,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists profiles_client_company_code_key
on public.profiles(client_company_code)
where client_company_code is not null;

create table if not exists public.client_company_users (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id, user_id)
);

create table if not exists public.contractor_relationships (
  id uuid primary key default gen_random_uuid(),
  worker_user_id uuid not null references auth.users(id) on delete cascade,
  client_company_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending',
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  rejected_at timestamptz,
  suspended_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(worker_user_id, client_company_id)
);

create table if not exists public.issued_documents (
  id uuid primary key default gen_random_uuid(),
  worker_user_id uuid not null references auth.users(id) on delete cascade,
  client_company_id uuid references public.profiles(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  document_number text not null,
  document_type text not null,
  document_market text not null default 'JP',
  title text not null,
  period_year integer not null,
  period_month smallint not null,
  gross_amount numeric(14,2) not null default 0,
  currency text not null default 'JPY',
  original_payload jsonb not null default '{}'::jsonb,
  preview_storage_key text,
  status text not null default 'issued',
  issued_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.document_reviews (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.issued_documents(id) on delete cascade,
  worker_user_id uuid not null references auth.users(id) on delete cascade,
  client_company_id uuid not null references public.profiles(id) on delete cascade,
  reviewed_by uuid references auth.users(id) on delete set null,
  status text not null default 'received',
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(document_id, client_company_id)
);

create table if not exists public.client_adjustments (
  id uuid primary key default gen_random_uuid(),
  client_company_id uuid not null references public.profiles(id) on delete cascade,
  worker_user_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid references public.issued_documents(id) on delete cascade,
  period_year integer,
  period_month smallint,
  adjustment_type text not null,
  title text not null,
  description text,
  amount numeric(14,2) not null default 0,
  currency text not null default 'JPY',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  target_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table if exists public.contractor_relationships drop constraint if exists contractor_relationships_status_check;
alter table if exists public.contractor_relationships
  add constraint contractor_relationships_status_check check (status in ('pending', 'active', 'rejected', 'suspended', 'ended'));

alter table if exists public.work_entries drop constraint if exists work_entries_entry_type_check;
alter table if exists public.work_entries
  add constraint work_entries_entry_type_check check (
    entry_type in ('hourly_work', 'daily_work', 'fixed_service', 'client_expense', 'business_expense', 'material', 'adjustment')
  );

alter table if exists public.work_entries drop constraint if exists work_entries_market_check;
alter table if exists public.work_entries
  add constraint work_entries_market_check check (market in ('JP', 'AU'));

alter table if exists public.work_entries drop constraint if exists work_entries_currency_check;
alter table if exists public.work_entries
  add constraint work_entries_currency_check check (currency in ('JPY', 'AUD'));

alter table if exists public.work_entries drop constraint if exists work_entries_tax_mode_check;
alter table if exists public.work_entries
  add constraint work_entries_tax_mode_check check (tax_mode in ('inclusive', 'exclusive', 'none'));

alter table if exists public.work_entries drop constraint if exists work_entries_status_check;
alter table if exists public.work_entries
  add constraint work_entries_status_check check (status in ('draft', 'billable', 'invoiced', 'paid', 'cancelled', 'non_billable'));

alter table if exists public.work_entries drop constraint if exists work_entries_client_review_status_check;
alter table if exists public.work_entries
  add constraint work_entries_client_review_status_check check (client_review_status in ('draft', 'sent', 'received', 'approved', 'rejected', 'paid'));

alter table if exists public.entry_templates drop constraint if exists entry_templates_entry_type_check;
alter table if exists public.entry_templates
  add constraint entry_templates_entry_type_check check (
    entry_type in ('hourly_work', 'daily_work', 'fixed_service', 'client_expense', 'business_expense', 'material', 'adjustment')
  );

alter table if exists public.document_reviews drop constraint if exists document_reviews_status_check;
alter table if exists public.document_reviews
  add constraint document_reviews_status_check check (status in ('received', 'reviewing', 'approved', 'rejected', 'paid'));

alter table if exists public.issued_documents drop constraint if exists issued_documents_status_check;
alter table if exists public.issued_documents
  add constraint issued_documents_status_check check (status in ('issued', 'received', 'reviewing', 'approved', 'rejected', 'paid'));

alter table if exists public.client_adjustments drop constraint if exists client_adjustments_type_check;
alter table if exists public.client_adjustments
  add constraint client_adjustments_type_check check (
    adjustment_type in (
      'health_insurance', 'social_insurance', 'housing', 'transport', 'food',
      'advance_payment', 'tools', 'uniform', 'internal_fee', 'other'
    )
  );

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and (role = 'admin' or user_type = 'admin')
  );
$$;

create or replace function public.is_client_company_member(_company_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select _company_id = auth.uid()
    or exists (
      select 1
      from public.client_company_users ccu
      where ccu.company_id = _company_id
        and ccu.user_id = auth.uid()
    );
$$;

create or replace function public.search_client_companies(search_term text)
returns table (
  id uuid,
  company_name text,
  country text,
  client_company_code text,
  masked_phone text,
  masked_email text,
  relationship_status text
)
language sql
security definer
set search_path = public
as $$
  with term as (
    select lower(trim(coalesce(search_term, ''))) as raw_term,
           public.normalize_phone(search_term) as phone_term
  )
  select
    p.id,
    coalesce(p.company_name, p.business_name, p.full_name) as company_name,
    coalesce(p.company_country, p.country, p.market) as country,
    p.client_company_code,
    public.mask_phone(p.phone) as masked_phone,
    public.mask_email(p.email) as masked_email,
    cr.status as relationship_status
  from public.profiles p
  cross join term
  left join public.contractor_relationships cr
    on cr.worker_user_id = auth.uid()
   and cr.client_company_id = p.id
  where p.user_type in ('client_company', 'both')
    and term.raw_term <> ''
    and (
      lower(coalesce(p.client_company_code, '')) like '%' || term.raw_term || '%'
      or lower(coalesce(p.company_name, '')) like '%' || term.raw_term || '%'
      or lower(coalesce(p.business_name, '')) like '%' || term.raw_term || '%'
      or lower(coalesce(p.full_name, '')) like '%' || term.raw_term || '%'
      or lower(coalesce(p.email, '')) like '%' || term.raw_term || '%'
      or coalesce(p.phone_normalized, '') like '%' || term.phone_term || '%'
    )
  order by p.company_name nulls last, p.business_name nulls last
  limit 20;
$$;

create or replace function public.sync_active_relationship_client()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  company_profile public.profiles%rowtype;
begin
  if new.status <> 'active' then
    return new;
  end if;

  select *
  into company_profile
  from public.profiles
  where id = new.client_company_id;

  if company_profile.id is null then
    return new;
  end if;

  if exists (
    select 1
    from public.clients c
    where c.user_id = new.worker_user_id
      and c.client_company_id = new.client_company_id
  ) then
    update public.clients
    set
      client_name = coalesce(nullif(company_profile.company_name, ''), nullif(company_profile.business_name, ''), nullif(company_profile.full_name, ''), company_profile.email, client_name),
      company_name = coalesce(nullif(company_profile.company_name, ''), nullif(company_profile.business_name, ''), company_name),
      address = coalesce(company_profile.address, company_profile.business_address, address),
      phone = coalesce(company_profile.phone, phone),
      phone_normalized = public.normalize_phone(coalesce(company_profile.phone, phone)),
      email = coalesce(company_profile.email, email),
      contact_person = coalesce(company_profile.owner_name, company_profile.full_name, contact_person),
      registration_number = coalesce(company_profile.invoice_registration_number, company_profile.japan_invoice_registration_number, company_profile.australia_abn, company_profile.abn, registration_number),
      client_country = coalesce(company_profile.company_country, company_profile.country, company_profile.market, client_country),
      preferred_document_market = coalesce(company_profile.document_market, company_profile.default_document_market, company_profile.market, preferred_document_market),
      currency = coalesce(company_profile.default_currency, company_profile.currency, currency),
      updated_at = now()
    where user_id = new.worker_user_id
      and client_company_id = new.client_company_id;
  else
    insert into public.clients (
      user_id,
      client_company_id,
      client_name,
      company_name,
      address,
      phone,
      phone_normalized,
      email,
      contact_person,
      registration_number,
      client_country,
      preferred_document_market,
      currency,
      notes
    )
    values (
      new.worker_user_id,
      new.client_company_id,
      coalesce(nullif(company_profile.company_name, ''), nullif(company_profile.business_name, ''), nullif(company_profile.full_name, ''), company_profile.email, 'Cliente / Contratante'),
      coalesce(nullif(company_profile.company_name, ''), nullif(company_profile.business_name, ''), null),
      coalesce(company_profile.address, company_profile.business_address),
      company_profile.phone,
      public.normalize_phone(company_profile.phone),
      company_profile.email,
      coalesce(company_profile.owner_name, company_profile.full_name),
      coalesce(company_profile.invoice_registration_number, company_profile.japan_invoice_registration_number, company_profile.australia_abn, company_profile.abn),
      coalesce(company_profile.company_country, company_profile.country, company_profile.market, 'JP'),
      coalesce(company_profile.document_market, company_profile.default_document_market, company_profile.market, 'JP'),
      coalesce(company_profile.default_currency, company_profile.currency, 'JPY'),
      'Criado automaticamente pelo vinculo OKH WorkLedger.'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists sync_active_relationship_client_trigger on public.contractor_relationships;
create trigger sync_active_relationship_client_trigger
after insert or update of status on public.contractor_relationships
for each row execute function public.sync_active_relationship_client();

create or replace function public.review_work_entry(entry_id uuid, review_status text, review_comment text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if review_status not in ('received', 'approved', 'rejected', 'paid') then
    raise exception 'Invalid review status';
  end if;

  update public.work_entries we
  set
    client_review_status = review_status,
    client_review_comment = nullif(review_comment, ''),
    client_reviewed_at = now(),
    updated_at = now()
  where we.id = entry_id
    and we.visibility_to_client = true
    and we.client_company_id is not null
    and public.is_client_company_member(we.client_company_id)
    and exists (
      select 1
      from public.contractor_relationships cr
      where cr.worker_user_id = we.user_id
        and cr.client_company_id = we.client_company_id
        and cr.status = 'active'
    );

  if not found then
    raise exception 'Work entry not found or not available for this client company';
  end if;
end;
$$;

grant execute on function public.review_work_entry(uuid, text, text) to authenticated;

insert into public.clients (
  user_id,
  client_company_id,
  client_name,
  company_name,
  address,
  phone,
  phone_normalized,
  email,
  contact_person,
  registration_number,
  client_country,
  preferred_document_market,
  currency,
  notes
)
select
  cr.worker_user_id,
  cr.client_company_id,
  coalesce(nullif(p.company_name, ''), nullif(p.business_name, ''), nullif(p.full_name, ''), p.email, 'Cliente / Contratante'),
  coalesce(nullif(p.company_name, ''), nullif(p.business_name, ''), null),
  coalesce(p.address, p.business_address),
  p.phone,
  public.normalize_phone(p.phone),
  p.email,
  coalesce(p.owner_name, p.full_name),
  coalesce(p.invoice_registration_number, p.japan_invoice_registration_number, p.australia_abn, p.abn),
  coalesce(p.company_country, p.country, p.market, 'JP'),
  coalesce(p.document_market, p.default_document_market, p.market, 'JP'),
  coalesce(p.default_currency, p.currency, 'JPY'),
  'Criado automaticamente pelo vinculo OKH WorkLedger.'
from public.contractor_relationships cr
join public.profiles p on p.id = cr.client_company_id
where cr.status = 'active'
  and not exists (
    select 1
    from public.clients c
    where c.user_id = cr.worker_user_id
      and c.client_company_id = cr.client_company_id
  );

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.client_company_users enable row level security;
alter table public.contractor_relationships enable row level security;
alter table public.issued_documents enable row level security;
alter table public.document_reviews enable row level security;
alter table public.client_adjustments enable row level security;
alter table public.activity_logs enable row level security;
alter table public.entry_templates enable row level security;

drop policy if exists profiles_select_portal_scope on public.profiles;
create policy profiles_select_portal_scope
on public.profiles for select
to authenticated
using (
  auth.uid() = id
  or public.is_admin()
  or exists (
    select 1 from public.contractor_relationships cr
    where cr.status in ('pending', 'active', 'suspended', 'ended')
      and (
        (cr.worker_user_id = auth.uid() and cr.client_company_id = profiles.id)
        or (public.is_client_company_member(cr.client_company_id) and cr.worker_user_id = profiles.id)
      )
  )
);

drop policy if exists profiles_update_own_or_admin on public.profiles;
create policy profiles_update_own_or_admin
on public.profiles for update
to authenticated
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

drop policy if exists contractor_relationships_select_scope on public.contractor_relationships;
create policy contractor_relationships_select_scope
on public.contractor_relationships for select
to authenticated
using (
  public.is_admin()
  or worker_user_id = auth.uid()
  or public.is_client_company_member(client_company_id)
);

drop policy if exists contractor_relationships_insert_worker on public.contractor_relationships;
create policy contractor_relationships_insert_worker
on public.contractor_relationships for insert
to authenticated
with check (public.is_admin() or worker_user_id = auth.uid());

drop policy if exists contractor_relationships_update_client_or_admin on public.contractor_relationships;
create policy contractor_relationships_update_client_or_admin
on public.contractor_relationships for update
to authenticated
using (public.is_admin() or public.is_client_company_member(client_company_id))
with check (public.is_admin() or public.is_client_company_member(client_company_id));

drop policy if exists clients_select_worker_client_company_admin on public.clients;
create policy clients_select_worker_client_company_admin
on public.clients for select
to authenticated
using (
  public.is_admin()
  or user_id = auth.uid()
  or (
    client_company_id is not null
    and public.is_client_company_member(client_company_id)
    and exists (
      select 1 from public.contractor_relationships cr
      where cr.worker_user_id = clients.user_id
        and cr.client_company_id = clients.client_company_id
        and cr.status = 'active'
    )
  )
);

drop policy if exists clients_update_worker_or_admin on public.clients;
create policy clients_update_worker_or_admin
on public.clients for update
to authenticated
using (public.is_admin() or user_id = auth.uid())
with check (public.is_admin() or user_id = auth.uid());

drop policy if exists clients_insert_worker_or_admin on public.clients;
create policy clients_insert_worker_or_admin
on public.clients for insert
to authenticated
with check (public.is_admin() or user_id = auth.uid());

drop policy if exists issued_documents_select_scope on public.issued_documents;
create policy issued_documents_select_scope
on public.issued_documents for select
to authenticated
using (
  public.is_admin()
  or worker_user_id = auth.uid()
  or (client_company_id is not null and public.is_client_company_member(client_company_id))
);

drop policy if exists issued_documents_insert_worker on public.issued_documents;
create policy issued_documents_insert_worker
on public.issued_documents for insert
to authenticated
with check (public.is_admin() or worker_user_id = auth.uid());

drop policy if exists issued_documents_update_worker_or_admin on public.issued_documents;
create policy issued_documents_update_worker_or_admin
on public.issued_documents for update
to authenticated
using (public.is_admin() or worker_user_id = auth.uid())
with check (public.is_admin() or worker_user_id = auth.uid());

drop policy if exists document_reviews_select_scope on public.document_reviews;
create policy document_reviews_select_scope
on public.document_reviews for select
to authenticated
using (
  public.is_admin()
  or worker_user_id = auth.uid()
  or public.is_client_company_member(client_company_id)
);

drop policy if exists document_reviews_insert_client on public.document_reviews;
create policy document_reviews_insert_client
on public.document_reviews for insert
to authenticated
with check (public.is_admin() or public.is_client_company_member(client_company_id));

drop policy if exists document_reviews_update_client on public.document_reviews;
create policy document_reviews_update_client
on public.document_reviews for update
to authenticated
using (public.is_admin() or public.is_client_company_member(client_company_id))
with check (public.is_admin() or public.is_client_company_member(client_company_id));

drop policy if exists client_adjustments_select_scope on public.client_adjustments;
create policy client_adjustments_select_scope
on public.client_adjustments for select
to authenticated
using (
  public.is_admin()
  or worker_user_id = auth.uid()
  or public.is_client_company_member(client_company_id)
);

drop policy if exists client_adjustments_insert_client on public.client_adjustments;
create policy client_adjustments_insert_client
on public.client_adjustments for insert
to authenticated
with check (public.is_admin() or public.is_client_company_member(client_company_id));

drop policy if exists client_adjustments_update_client on public.client_adjustments;
create policy client_adjustments_update_client
on public.client_adjustments for update
to authenticated
using (public.is_admin() or public.is_client_company_member(client_company_id))
with check (public.is_admin() or public.is_client_company_member(client_company_id));

drop policy if exists client_company_users_select_scope on public.client_company_users;
create policy client_company_users_select_scope
on public.client_company_users for select
to authenticated
using (public.is_admin() or user_id = auth.uid() or public.is_client_company_member(company_id));

drop policy if exists activity_logs_select_scope on public.activity_logs;
create policy activity_logs_select_scope
on public.activity_logs for select
to authenticated
using (public.is_admin() or actor_user_id = auth.uid() or target_user_id = auth.uid());

drop policy if exists activity_logs_insert_authenticated on public.activity_logs;
create policy activity_logs_insert_authenticated
on public.activity_logs for insert
to authenticated
with check (actor_user_id = auth.uid() or public.is_admin());

drop policy if exists entry_templates_select_own_or_admin on public.entry_templates;
create policy entry_templates_select_own_or_admin
on public.entry_templates for select
to authenticated
using (public.is_admin() or user_id = auth.uid());

drop policy if exists entry_templates_insert_own_or_admin on public.entry_templates;
create policy entry_templates_insert_own_or_admin
on public.entry_templates for insert
to authenticated
with check (public.is_admin() or user_id = auth.uid());

drop policy if exists entry_templates_update_own_or_admin on public.entry_templates;
create policy entry_templates_update_own_or_admin
on public.entry_templates for update
to authenticated
using (public.is_admin() or user_id = auth.uid())
with check (public.is_admin() or user_id = auth.uid());

drop policy if exists entry_templates_delete_own_or_admin on public.entry_templates;
create policy entry_templates_delete_own_or_admin
on public.entry_templates for delete
to authenticated
using (public.is_admin() or user_id = auth.uid());

do $$
begin
  if to_regclass('public.work_entries') is not null then
    execute 'alter table public.work_entries enable row level security';
    execute 'drop policy if exists work_entries_select_client_portal on public.work_entries';
    execute 'create policy work_entries_select_client_portal on public.work_entries for select to authenticated using (public.is_admin() or user_id = auth.uid() or (visibility_to_client = true and client_company_id is not null and public.is_client_company_member(client_company_id) and exists (select 1 from public.contractor_relationships cr where cr.worker_user_id = work_entries.user_id and cr.client_company_id = work_entries.client_company_id and cr.status = ''active'')))';
    execute 'drop policy if exists work_entries_insert_own_or_admin on public.work_entries';
    execute 'create policy work_entries_insert_own_or_admin on public.work_entries for insert to authenticated with check (public.is_admin() or user_id = auth.uid())';
    execute 'drop policy if exists work_entries_update_own_or_admin on public.work_entries';
    execute 'create policy work_entries_update_own_or_admin on public.work_entries for update to authenticated using (public.is_admin() or user_id = auth.uid()) with check (public.is_admin() or user_id = auth.uid())';
    execute 'drop policy if exists work_entries_delete_own_or_admin on public.work_entries';
    execute 'create policy work_entries_delete_own_or_admin on public.work_entries for delete to authenticated using (public.is_admin() or user_id = auth.uid())';
  end if;

  if to_regclass('public.time_entries') is not null then
    execute 'alter table public.time_entries enable row level security';
    execute 'drop policy if exists time_entries_select_client_portal on public.time_entries';
    execute 'create policy time_entries_select_client_portal on public.time_entries for select to authenticated using (public.is_admin() or user_id = auth.uid() or exists (select 1 from public.clients c join public.contractor_relationships cr on cr.worker_user_id = c.user_id and cr.client_company_id = c.client_company_id and cr.status = ''active'' where c.id = time_entries.client_id and public.is_client_company_member(c.client_company_id)))';
    execute 'drop policy if exists time_entries_insert_own_or_admin on public.time_entries';
    execute 'create policy time_entries_insert_own_or_admin on public.time_entries for insert to authenticated with check (public.is_admin() or user_id = auth.uid())';
    execute 'drop policy if exists time_entries_update_own_or_admin on public.time_entries';
    execute 'create policy time_entries_update_own_or_admin on public.time_entries for update to authenticated using (public.is_admin() or user_id = auth.uid()) with check (public.is_admin() or user_id = auth.uid())';
    execute 'drop policy if exists time_entries_delete_own_or_admin on public.time_entries';
    execute 'create policy time_entries_delete_own_or_admin on public.time_entries for delete to authenticated using (public.is_admin() or user_id = auth.uid())';
  end if;
end $$;

create index if not exists profiles_user_type_idx on public.profiles(user_type);
create index if not exists profiles_client_company_search_idx on public.profiles(client_company_code, phone_normalized);
create index if not exists clients_client_company_id_idx on public.clients(client_company_id);
create index if not exists work_entries_user_date_idx on public.work_entries(user_id, date desc);
create index if not exists work_entries_client_date_idx on public.work_entries(client_id, date desc);
create index if not exists work_entries_client_company_sent_idx on public.work_entries(client_company_id, visibility_to_client, date desc);
create index if not exists entry_templates_user_idx on public.entry_templates(user_id, updated_at desc);
create index if not exists contractor_relationships_worker_idx on public.contractor_relationships(worker_user_id, status);
create index if not exists contractor_relationships_company_idx on public.contractor_relationships(client_company_id, status);
create index if not exists issued_documents_worker_idx on public.issued_documents(worker_user_id, period_year desc, period_month desc);
create index if not exists issued_documents_company_idx on public.issued_documents(client_company_id, period_year desc, period_month desc);
create index if not exists document_reviews_document_idx on public.document_reviews(document_id, status);
create index if not exists client_adjustments_document_idx on public.client_adjustments(document_id);
create index if not exists activity_logs_actor_idx on public.activity_logs(actor_user_id, created_at desc);
