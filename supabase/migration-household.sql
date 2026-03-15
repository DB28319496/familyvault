-- ============================================
-- Migration: Add household support
-- ============================================

-- 1. Create households table
create table if not exists households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'My Family',
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- 2. Add household_id to profiles
alter table profiles add column if not exists household_id uuid references households(id);

-- 3. Add household_id to ALL data tables
alter table debts add column if not exists household_id uuid references households(id);
alter table debt_payments add column if not exists household_id uuid references households(id);
alter table net_worth_snapshots add column if not exists household_id uuid references households(id);
alter table budget_categories add column if not exists household_id uuid references households(id);
alter table expenses add column if not exists household_id uuid references households(id);
alter table contacts add column if not exists household_id uuid references households(id);
alter table legal_documents add column if not exists household_id uuid references households(id);
alter table financial_accounts add column if not exists household_id uuid references households(id);
alter table insurance_policies add column if not exists household_id uuid references households(id);
alter table monthly_bills add column if not exists household_id uuid references households(id);
alter table digital_access add column if not exists household_id uuid references households(id);
alter table letter_of_intent add column if not exists household_id uuid references households(id);
alter table action_items add column if not exists household_id uuid references households(id);

-- 4. Enable RLS on households
alter table households enable row level security;

-- 5. Household RLS: members can view their own household
create policy "Users can view own household" on households
  for select using (
    id in (select household_id from profiles where id = auth.uid())
  );

create policy "Users can update own household" on households
  for update using (
    id in (select household_id from profiles where id = auth.uid())
  );

create policy "Users can create household" on households
  for insert with check (created_by = auth.uid());

-- 6. Drop old user-based RLS policies and replace with household-based ones

-- Helper function: get current user's household_id
create or replace function get_my_household_id()
returns uuid as $$
  select household_id from profiles where id = auth.uid()
$$ language sql security definer stable;

-- Debts
drop policy if exists "Users can view own debts" on debts;
drop policy if exists "Users can insert own debts" on debts;
drop policy if exists "Users can update own debts" on debts;
drop policy if exists "Users can delete own debts" on debts;
create policy "Household can view debts" on debts for select using (household_id = get_my_household_id());
create policy "Household can insert debts" on debts for insert with check (household_id = get_my_household_id());
create policy "Household can update debts" on debts for update using (household_id = get_my_household_id());
create policy "Household can delete debts" on debts for delete using (household_id = get_my_household_id());

-- Debt payments
drop policy if exists "Users can view own debt_payments" on debt_payments;
drop policy if exists "Users can insert own debt_payments" on debt_payments;
drop policy if exists "Users can update own debt_payments" on debt_payments;
drop policy if exists "Users can delete own debt_payments" on debt_payments;
create policy "Household can view debt_payments" on debt_payments for select using (household_id = get_my_household_id());
create policy "Household can insert debt_payments" on debt_payments for insert with check (household_id = get_my_household_id());
create policy "Household can update debt_payments" on debt_payments for update using (household_id = get_my_household_id());
create policy "Household can delete debt_payments" on debt_payments for delete using (household_id = get_my_household_id());

-- Net worth snapshots
drop policy if exists "Users can view own net_worth_snapshots" on net_worth_snapshots;
drop policy if exists "Users can insert own net_worth_snapshots" on net_worth_snapshots;
drop policy if exists "Users can update own net_worth_snapshots" on net_worth_snapshots;
drop policy if exists "Users can delete own net_worth_snapshots" on net_worth_snapshots;
create policy "Household can view net_worth_snapshots" on net_worth_snapshots for select using (household_id = get_my_household_id());
create policy "Household can insert net_worth_snapshots" on net_worth_snapshots for insert with check (household_id = get_my_household_id());
create policy "Household can update net_worth_snapshots" on net_worth_snapshots for update using (household_id = get_my_household_id());
create policy "Household can delete net_worth_snapshots" on net_worth_snapshots for delete using (household_id = get_my_household_id());

-- Budget categories
drop policy if exists "Users can view own budget_categories" on budget_categories;
drop policy if exists "Users can insert own budget_categories" on budget_categories;
drop policy if exists "Users can update own budget_categories" on budget_categories;
drop policy if exists "Users can delete own budget_categories" on budget_categories;
create policy "Household can view budget_categories" on budget_categories for select using (household_id = get_my_household_id());
create policy "Household can insert budget_categories" on budget_categories for insert with check (household_id = get_my_household_id());
create policy "Household can update budget_categories" on budget_categories for update using (household_id = get_my_household_id());
create policy "Household can delete budget_categories" on budget_categories for delete using (household_id = get_my_household_id());

-- Expenses
drop policy if exists "Users can view own expenses" on expenses;
drop policy if exists "Users can insert own expenses" on expenses;
drop policy if exists "Users can update own expenses" on expenses;
drop policy if exists "Users can delete own expenses" on expenses;
create policy "Household can view expenses" on expenses for select using (household_id = get_my_household_id());
create policy "Household can insert expenses" on expenses for insert with check (household_id = get_my_household_id());
create policy "Household can update expenses" on expenses for update using (household_id = get_my_household_id());
create policy "Household can delete expenses" on expenses for delete using (household_id = get_my_household_id());

-- Contacts
drop policy if exists "Users can view own contacts" on contacts;
drop policy if exists "Users can insert own contacts" on contacts;
drop policy if exists "Users can update own contacts" on contacts;
drop policy if exists "Users can delete own contacts" on contacts;
create policy "Household can view contacts" on contacts for select using (household_id = get_my_household_id());
create policy "Household can insert contacts" on contacts for insert with check (household_id = get_my_household_id());
create policy "Household can update contacts" on contacts for update using (household_id = get_my_household_id());
create policy "Household can delete contacts" on contacts for delete using (household_id = get_my_household_id());

-- Legal documents
drop policy if exists "Users can view own legal_documents" on legal_documents;
drop policy if exists "Users can insert own legal_documents" on legal_documents;
drop policy if exists "Users can update own legal_documents" on legal_documents;
drop policy if exists "Users can delete own legal_documents" on legal_documents;
create policy "Household can view legal_documents" on legal_documents for select using (household_id = get_my_household_id());
create policy "Household can insert legal_documents" on legal_documents for insert with check (household_id = get_my_household_id());
create policy "Household can update legal_documents" on legal_documents for update using (household_id = get_my_household_id());
create policy "Household can delete legal_documents" on legal_documents for delete using (household_id = get_my_household_id());

-- Financial accounts
drop policy if exists "Users can view own financial_accounts" on financial_accounts;
drop policy if exists "Users can insert own financial_accounts" on financial_accounts;
drop policy if exists "Users can update own financial_accounts" on financial_accounts;
drop policy if exists "Users can delete own financial_accounts" on financial_accounts;
create policy "Household can view financial_accounts" on financial_accounts for select using (household_id = get_my_household_id());
create policy "Household can insert financial_accounts" on financial_accounts for insert with check (household_id = get_my_household_id());
create policy "Household can update financial_accounts" on financial_accounts for update using (household_id = get_my_household_id());
create policy "Household can delete financial_accounts" on financial_accounts for delete using (household_id = get_my_household_id());

-- Insurance policies
drop policy if exists "Users can view own insurance_policies" on insurance_policies;
drop policy if exists "Users can insert own insurance_policies" on insurance_policies;
drop policy if exists "Users can update own insurance_policies" on insurance_policies;
drop policy if exists "Users can delete own insurance_policies" on insurance_policies;
create policy "Household can view insurance_policies" on insurance_policies for select using (household_id = get_my_household_id());
create policy "Household can insert insurance_policies" on insurance_policies for insert with check (household_id = get_my_household_id());
create policy "Household can update insurance_policies" on insurance_policies for update using (household_id = get_my_household_id());
create policy "Household can delete insurance_policies" on insurance_policies for delete using (household_id = get_my_household_id());

-- Monthly bills
drop policy if exists "Users can view own monthly_bills" on monthly_bills;
drop policy if exists "Users can insert own monthly_bills" on monthly_bills;
drop policy if exists "Users can update own monthly_bills" on monthly_bills;
drop policy if exists "Users can delete own monthly_bills" on monthly_bills;
create policy "Household can view monthly_bills" on monthly_bills for select using (household_id = get_my_household_id());
create policy "Household can insert monthly_bills" on monthly_bills for insert with check (household_id = get_my_household_id());
create policy "Household can update monthly_bills" on monthly_bills for update using (household_id = get_my_household_id());
create policy "Household can delete monthly_bills" on monthly_bills for delete using (household_id = get_my_household_id());

-- Digital access
drop policy if exists "Users can view own digital_access" on digital_access;
drop policy if exists "Users can insert own digital_access" on digital_access;
drop policy if exists "Users can update own digital_access" on digital_access;
drop policy if exists "Users can delete own digital_access" on digital_access;
create policy "Household can view digital_access" on digital_access for select using (household_id = get_my_household_id());
create policy "Household can insert digital_access" on digital_access for insert with check (household_id = get_my_household_id());
create policy "Household can update digital_access" on digital_access for update using (household_id = get_my_household_id());
create policy "Household can delete digital_access" on digital_access for delete using (household_id = get_my_household_id());

-- Letter of intent
drop policy if exists "Users can view own letter_of_intent" on letter_of_intent;
drop policy if exists "Users can insert own letter_of_intent" on letter_of_intent;
drop policy if exists "Users can update own letter_of_intent" on letter_of_intent;
drop policy if exists "Users can delete own letter_of_intent" on letter_of_intent;
create policy "Household can view letter_of_intent" on letter_of_intent for select using (household_id = get_my_household_id());
create policy "Household can insert letter_of_intent" on letter_of_intent for insert with check (household_id = get_my_household_id());
create policy "Household can update letter_of_intent" on letter_of_intent for update using (household_id = get_my_household_id());
create policy "Household can delete letter_of_intent" on letter_of_intent for delete using (household_id = get_my_household_id());

-- Action items
drop policy if exists "Users can view own action_items" on action_items;
drop policy if exists "Users can insert own action_items" on action_items;
drop policy if exists "Users can update own action_items" on action_items;
drop policy if exists "Users can delete own action_items" on action_items;
create policy "Household can view action_items" on action_items for select using (household_id = get_my_household_id());
create policy "Household can insert action_items" on action_items for insert with check (household_id = get_my_household_id());
create policy "Household can update action_items" on action_items for update using (household_id = get_my_household_id());
create policy "Household can delete action_items" on action_items for delete using (household_id = get_my_household_id());

-- 7. Household invites table
create table if not exists household_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  email text not null,
  invited_by uuid references auth.users(id),
  token text not null unique default encode(gen_random_bytes(32), 'hex'),
  accepted_at timestamptz,
  expires_at timestamptz default now() + interval '7 days',
  created_at timestamptz default now()
);

alter table household_invites enable row level security;

create policy "Household members can view invites" on household_invites
  for select using (household_id = get_my_household_id());
create policy "Household members can create invites" on household_invites
  for insert with check (household_id = get_my_household_id());
create policy "Household members can delete invites" on household_invites
  for delete using (household_id = get_my_household_id());

-- 8. Update the handle_new_user trigger to create a household on signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_household_id uuid;
begin
  -- Create a household for the new user
  insert into public.households (name, created_by)
  values (coalesce(new.raw_user_meta_data->>'display_name', 'My Family') || '''s Family', new.id)
  returning id into new_household_id;

  -- Create profile linked to household
  insert into public.profiles (id, display_name, household_id)
  values (new.id, new.raw_user_meta_data->>'display_name', new_household_id);

  return new;
end;
$$ language plpgsql security definer;

-- ============================================
-- 9. Backfill existing data
-- Create household for existing user and update all data
-- ============================================
do $$
declare
  u record;
  hh_id uuid;
begin
  for u in select id, display_name from profiles where household_id is null loop
    -- Create household
    insert into households (name, created_by)
    values (coalesce(u.display_name, 'My Family') || '''s Family', u.id)
    returning id into hh_id;

    -- Update profile
    update profiles set household_id = hh_id where id = u.id;

    -- Update all data tables
    update debts set household_id = hh_id where user_id = u.id;
    update debt_payments set household_id = hh_id where user_id = u.id;
    update net_worth_snapshots set household_id = hh_id where user_id = u.id;
    update budget_categories set household_id = hh_id where user_id = u.id;
    update expenses set household_id = hh_id where user_id = u.id;
    update contacts set household_id = hh_id where user_id = u.id;
    update legal_documents set household_id = hh_id where user_id = u.id;
    update financial_accounts set household_id = hh_id where user_id = u.id;
    update insurance_policies set household_id = hh_id where user_id = u.id;
    update monthly_bills set household_id = hh_id where user_id = u.id;
    update digital_access set household_id = hh_id where user_id = u.id;
    update letter_of_intent set household_id = hh_id where user_id = u.id;
    update action_items set household_id = hh_id where user_id = u.id;
  end loop;
end $$;
