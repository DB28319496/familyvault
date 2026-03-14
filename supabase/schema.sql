-- FamilyVault Database Schema
-- Run this in Supabase SQL Editor to set up all tables

-- User profiles
create table if not exists profiles (
  id uuid references auth.users primary key,
  display_name text,
  household_income numeric,
  monthly_take_home numeric,
  created_at timestamptz default now()
);

-- Debt tracking
create table if not exists debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  card_name text not null,
  balance numeric not null,
  apr numeric not null,
  min_payment numeric not null,
  is_paid_off boolean default false,
  paid_off_date date,
  created_at timestamptz default now()
);

-- Debt payments
create table if not exists debt_payments (
  id uuid primary key default gen_random_uuid(),
  debt_id uuid references debts(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  amount numeric not null,
  date date not null,
  created_at timestamptz default now()
);

-- Net worth snapshots
create table if not exists net_worth_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  snapshot_date date not null,
  assets jsonb not null default '{}',
  liabilities jsonb not null default '{}',
  total_assets numeric,
  total_liabilities numeric,
  net_worth numeric,
  created_at timestamptz default now()
);

-- Budget categories
create table if not exists budget_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  target_amount numeric,
  category_group text,
  created_at timestamptz default now()
);

-- Expenses
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  category_id uuid references budget_categories(id) on delete set null,
  amount numeric not null,
  description text,
  date date not null,
  is_baby_expense boolean default false,
  baby_category text,
  created_at timestamptz default now()
);

-- Emergency binder: contacts
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  role text not null,
  section text not null,
  name text,
  organization text,
  phone text,
  email text,
  notes text,
  sort_order integer,
  created_at timestamptz default now()
);

-- Emergency binder: legal documents
create table if not exists legal_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  doc_type text not null,
  status text default 'not_started',
  storage_location text,
  file_url text,
  expiration_date date,
  notes text,
  created_at timestamptz default now()
);

-- Emergency binder: financial accounts
create table if not exists financial_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  institution text not null,
  account_type text not null,
  last_four text,
  owner text,
  beneficiary text,
  login_reference text,
  approximate_balance numeric,
  last_reviewed date,
  notes text,
  created_at timestamptz default now()
);

-- Emergency binder: insurance policies
create table if not exists insurance_policies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  policy_type text not null,
  carrier text,
  policy_number text,
  coverage_amount numeric,
  beneficiary text,
  monthly_premium numeric,
  agent_name text,
  agent_phone text,
  agent_email text,
  renewal_date date,
  notes text,
  created_at timestamptz default now()
);

-- Emergency binder: monthly bills
create table if not exists monthly_bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  amount numeric,
  due_date integer,
  payment_method text,
  is_autopay boolean default false,
  notes text,
  created_at timestamptz default now()
);

-- Emergency binder: digital access
create table if not exists digital_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  item_type text not null,
  name text not null,
  details text,
  status text,
  created_at timestamptz default now()
);

-- Letter of intent
create table if not exists letter_of_intent (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  content text,
  last_updated timestamptz default now()
);

-- Action items
create table if not exists action_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  phase integer not null,
  status text default 'not_started',
  target_date date,
  completed_date date,
  notes text,
  sort_order integer,
  created_at timestamptz default now()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

alter table profiles enable row level security;
alter table debts enable row level security;
alter table debt_payments enable row level security;
alter table net_worth_snapshots enable row level security;
alter table budget_categories enable row level security;
alter table expenses enable row level security;
alter table contacts enable row level security;
alter table legal_documents enable row level security;
alter table financial_accounts enable row level security;
alter table insurance_policies enable row level security;
alter table monthly_bills enable row level security;
alter table digital_access enable row level security;
alter table letter_of_intent enable row level security;
alter table action_items enable row level security;

-- Profiles: users can only access their own profile
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Macro for all other tables: user_id = auth.uid()
-- Debts
create policy "Users can view own debts" on debts for select using (auth.uid() = user_id);
create policy "Users can insert own debts" on debts for insert with check (auth.uid() = user_id);
create policy "Users can update own debts" on debts for update using (auth.uid() = user_id);
create policy "Users can delete own debts" on debts for delete using (auth.uid() = user_id);

-- Debt payments
create policy "Users can view own debt_payments" on debt_payments for select using (auth.uid() = user_id);
create policy "Users can insert own debt_payments" on debt_payments for insert with check (auth.uid() = user_id);
create policy "Users can update own debt_payments" on debt_payments for update using (auth.uid() = user_id);
create policy "Users can delete own debt_payments" on debt_payments for delete using (auth.uid() = user_id);

-- Net worth snapshots
create policy "Users can view own net_worth_snapshots" on net_worth_snapshots for select using (auth.uid() = user_id);
create policy "Users can insert own net_worth_snapshots" on net_worth_snapshots for insert with check (auth.uid() = user_id);
create policy "Users can update own net_worth_snapshots" on net_worth_snapshots for update using (auth.uid() = user_id);
create policy "Users can delete own net_worth_snapshots" on net_worth_snapshots for delete using (auth.uid() = user_id);

-- Budget categories
create policy "Users can view own budget_categories" on budget_categories for select using (auth.uid() = user_id);
create policy "Users can insert own budget_categories" on budget_categories for insert with check (auth.uid() = user_id);
create policy "Users can update own budget_categories" on budget_categories for update using (auth.uid() = user_id);
create policy "Users can delete own budget_categories" on budget_categories for delete using (auth.uid() = user_id);

-- Expenses
create policy "Users can view own expenses" on expenses for select using (auth.uid() = user_id);
create policy "Users can insert own expenses" on expenses for insert with check (auth.uid() = user_id);
create policy "Users can update own expenses" on expenses for update using (auth.uid() = user_id);
create policy "Users can delete own expenses" on expenses for delete using (auth.uid() = user_id);

-- Contacts
create policy "Users can view own contacts" on contacts for select using (auth.uid() = user_id);
create policy "Users can insert own contacts" on contacts for insert with check (auth.uid() = user_id);
create policy "Users can update own contacts" on contacts for update using (auth.uid() = user_id);
create policy "Users can delete own contacts" on contacts for delete using (auth.uid() = user_id);

-- Legal documents
create policy "Users can view own legal_documents" on legal_documents for select using (auth.uid() = user_id);
create policy "Users can insert own legal_documents" on legal_documents for insert with check (auth.uid() = user_id);
create policy "Users can update own legal_documents" on legal_documents for update using (auth.uid() = user_id);
create policy "Users can delete own legal_documents" on legal_documents for delete using (auth.uid() = user_id);

-- Financial accounts
create policy "Users can view own financial_accounts" on financial_accounts for select using (auth.uid() = user_id);
create policy "Users can insert own financial_accounts" on financial_accounts for insert with check (auth.uid() = user_id);
create policy "Users can update own financial_accounts" on financial_accounts for update using (auth.uid() = user_id);
create policy "Users can delete own financial_accounts" on financial_accounts for delete using (auth.uid() = user_id);

-- Insurance policies
create policy "Users can view own insurance_policies" on insurance_policies for select using (auth.uid() = user_id);
create policy "Users can insert own insurance_policies" on insurance_policies for insert with check (auth.uid() = user_id);
create policy "Users can update own insurance_policies" on insurance_policies for update using (auth.uid() = user_id);
create policy "Users can delete own insurance_policies" on insurance_policies for delete using (auth.uid() = user_id);

-- Monthly bills
create policy "Users can view own monthly_bills" on monthly_bills for select using (auth.uid() = user_id);
create policy "Users can insert own monthly_bills" on monthly_bills for insert with check (auth.uid() = user_id);
create policy "Users can update own monthly_bills" on monthly_bills for update using (auth.uid() = user_id);
create policy "Users can delete own monthly_bills" on monthly_bills for delete using (auth.uid() = user_id);

-- Digital access
create policy "Users can view own digital_access" on digital_access for select using (auth.uid() = user_id);
create policy "Users can insert own digital_access" on digital_access for insert with check (auth.uid() = user_id);
create policy "Users can update own digital_access" on digital_access for update using (auth.uid() = user_id);
create policy "Users can delete own digital_access" on digital_access for delete using (auth.uid() = user_id);

-- Letter of intent
create policy "Users can view own letter_of_intent" on letter_of_intent for select using (auth.uid() = user_id);
create policy "Users can insert own letter_of_intent" on letter_of_intent for insert with check (auth.uid() = user_id);
create policy "Users can update own letter_of_intent" on letter_of_intent for update using (auth.uid() = user_id);
create policy "Users can delete own letter_of_intent" on letter_of_intent for delete using (auth.uid() = user_id);

-- Action items
create policy "Users can view own action_items" on action_items for select using (auth.uid() = user_id);
create policy "Users can insert own action_items" on action_items for insert with check (auth.uid() = user_id);
create policy "Users can update own action_items" on action_items for update using (auth.uid() = user_id);
create policy "Users can delete own action_items" on action_items for delete using (auth.uid() = user_id);

-- ============================================
-- Auto-create profile on signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
