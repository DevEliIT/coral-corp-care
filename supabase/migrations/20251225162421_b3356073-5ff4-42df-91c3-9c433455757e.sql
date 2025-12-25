-- Create role enum
create type public.app_role as enum ('seller', 'manager');

-- Create decision role enum
create type public.decision_role as enum ('decision_maker', 'influencer', 'financial');

-- Create company status enum
create type public.company_status as enum ('lead', 'proposal', 'active', 'lost');

-- Create proposal status enum
create type public.proposal_status as enum ('qualified', 'diagnosis', 'sent', 'negotiation', 'signed', 'lost');

-- Profiles (user roles)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role app_role not null default 'seller',
  full_name text,
  created_at timestamp with time zone default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users can view own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id);

-- Helper function to check if user is manager
create or replace function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'manager'
  );
$$;

-- Companies
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  cnpj text not null unique,
  segment text,
  estimated_lines integer,
  status company_status not null default 'lead',
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on companies
alter table public.companies enable row level security;

-- Companies policies
create policy "Companies - select"
on public.companies for select
using (owner_id = auth.uid() OR public.is_manager());

create policy "Companies - insert"
on public.companies for insert
with check (owner_id = auth.uid());

create policy "Companies - update"
on public.companies for update
using (owner_id = auth.uid() OR public.is_manager());

create policy "Companies - delete"
on public.companies for delete
using (owner_id = auth.uid() OR public.is_manager());

-- Company contacts
create table public.company_contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,
  name text not null,
  role text,
  email text,
  phone text,
  decision_role decision_role,
  created_at timestamp with time zone default now()
);

-- Enable RLS on contacts
alter table public.company_contacts enable row level security;

-- Contacts policies
create policy "Contacts - select"
on public.company_contacts for select
using (
  company_id in (
    select id from public.companies
    where owner_id = auth.uid() OR public.is_manager()
  )
);

create policy "Contacts - insert"
on public.company_contacts for insert
with check (
  company_id in (
    select id from public.companies
    where owner_id = auth.uid() OR public.is_manager()
  )
);

create policy "Contacts - update"
on public.company_contacts for update
using (
  company_id in (
    select id from public.companies
    where owner_id = auth.uid() OR public.is_manager()
  )
);

create policy "Contacts - delete"
on public.company_contacts for delete
using (
  company_id in (
    select id from public.companies
    where owner_id = auth.uid() OR public.is_manager()
  )
);

-- Plans
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  carrier text not null,
  name text not null,
  base_price numeric(10,2) not null,
  notes text,
  active boolean default true,
  created_at timestamp with time zone default now()
);

-- Enable RLS on plans
alter table public.plans enable row level security;

-- Plans are readable by all authenticated users
create policy "Plans - select"
on public.plans for select
to authenticated
using (true);

-- Only managers can manage plans
create policy "Plans - insert"
on public.plans for insert
to authenticated
with check (public.is_manager());

create policy "Plans - update"
on public.plans for update
to authenticated
using (public.is_manager());

-- Proposals
create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,
  plan_id uuid references public.plans(id) on delete set null,
  seller_id uuid references auth.users(id) on delete set null,
  line_quantity integer not null,
  price_per_line numeric(10,2) not null,
  total_monthly numeric(10,2) generated always as (line_quantity * price_per_line) stored,
  status proposal_status not null default 'qualified',
  notes text,
  sent_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on proposals
alter table public.proposals enable row level security;

-- Proposals policies
create policy "Proposals - select"
on public.proposals for select
using (seller_id = auth.uid() OR public.is_manager());

create policy "Proposals - insert"
on public.proposals for insert
with check (seller_id = auth.uid());

create policy "Proposals - update"
on public.proposals for update
using (seller_id = auth.uid() OR public.is_manager());

create policy "Proposals - delete"
on public.proposals for delete
using (seller_id = auth.uid() OR public.is_manager());

-- Proposal status history
create table public.proposal_status_history (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid references public.proposals(id) on delete cascade not null,
  old_status proposal_status,
  new_status proposal_status not null,
  changed_by uuid references auth.users(id) on delete set null,
  changed_at timestamp with time zone default now()
);

-- Enable RLS on status history
alter table public.proposal_status_history enable row level security;

-- Status history policies
create policy "Status history - select"
on public.proposal_status_history for select
using (
  proposal_id in (
    select id from public.proposals
    where seller_id = auth.uid() OR public.is_manager()
  )
);

create policy "Status history - insert"
on public.proposal_status_history for insert
with check (
  proposal_id in (
    select id from public.proposals
    where seller_id = auth.uid() OR public.is_manager()
  )
);

-- Contracts
create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid unique references public.proposals(id) on delete cascade not null,
  start_date date not null,
  end_date date,
  notes text,
  created_at timestamp with time zone default now()
);

-- Enable RLS on contracts
alter table public.contracts enable row level security;

-- Contracts policies
create policy "Contracts - select"
on public.contracts for select
using (
  proposal_id in (
    select id from public.proposals
    where seller_id = auth.uid() OR public.is_manager()
  )
);

create policy "Contracts - insert"
on public.contracts for insert
with check (
  proposal_id in (
    select id from public.proposals
    where seller_id = auth.uid() OR public.is_manager()
  )
);

create policy "Contracts - update"
on public.contracts for update
using (
  proposal_id in (
    select id from public.proposals
    where seller_id = auth.uid() OR public.is_manager()
  )
);

-- Trigger to create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (new.id, 'seller', new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Triggers for updated_at
create trigger update_companies_updated_at
  before update on public.companies
  for each row execute function public.update_updated_at_column();

create trigger update_proposals_updated_at
  before update on public.proposals
  for each row execute function public.update_updated_at_column();