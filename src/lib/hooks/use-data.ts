"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  Debt,
  NetWorthSnapshot,
  BudgetCategory,
  Expense,
  Contact,
  LegalDocument,
  FinancialAccount,
  InsurancePolicy,
  MonthlyBill,
  DigitalAccess,
  LetterOfIntent,
  ActionItem,
  Household,
  HouseholdInvite,
} from "@/lib/types";

// Generic hook for any table
function useSupabaseTable<T>(
  table: string,
  orderBy?: { column: string; ascending?: boolean }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const supabase = createClient();
      let query = supabase.from(table).select("*");
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }
      const { data: rows, error } = await query;
      if (error) throw error;
      setData((rows as T[]) || []);
    } catch (err) {
      console.error(`Error fetching ${table}:`, err);
    } finally {
      setLoading(false);
    }
  }, [table, orderBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const insert = async (item: Partial<T>) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    // Get household_id from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("household_id")
      .eq("id", user?.id)
      .single();
    const { data: row, error } = await supabase
      .from(table)
      .insert({ ...item, user_id: user?.id, household_id: profile?.household_id })
      .select()
      .single();
    if (error) throw error;
    setData((prev) => [...prev, row as T]);
    return row as T;
  };

  const update = async (id: string, updates: Partial<T>) => {
    const supabase = createClient();
    const { error } = await supabase.from(table).update(updates).eq("id", id);
    if (error) throw error;
    setData((prev) =>
      prev.map((item) => ((item as Record<string, unknown>).id === id ? { ...item, ...updates } : item))
    );
  };

  const remove = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) throw error;
    setData((prev) => prev.filter((item) => (item as Record<string, unknown>).id !== id));
  };

  return { data, loading, refetch: fetchData, insert, update, remove, setData };
}

// Specific hooks for each data type
export function useDebts() {
  return useSupabaseTable<Debt>("debts", { column: "apr", ascending: false });
}

export function useNetWorthSnapshots() {
  return useSupabaseTable<NetWorthSnapshot>("net_worth_snapshots", {
    column: "snapshot_date",
    ascending: true,
  });
}

export function useBudgetCategories() {
  return useSupabaseTable<BudgetCategory>("budget_categories", {
    column: "category_group",
  });
}

export function useExpenses() {
  return useSupabaseTable<Expense>("expenses", {
    column: "date",
    ascending: false,
  });
}

export function useContacts() {
  return useSupabaseTable<Contact>("contacts", {
    column: "sort_order",
    ascending: true,
  });
}

export function useLegalDocuments() {
  return useSupabaseTable<LegalDocument>("legal_documents");
}

export function useFinancialAccounts() {
  return useSupabaseTable<FinancialAccount>("financial_accounts", {
    column: "account_type",
  });
}

export function useInsurancePolicies() {
  return useSupabaseTable<InsurancePolicy>("insurance_policies");
}

export function useMonthlyBills() {
  return useSupabaseTable<MonthlyBill>("monthly_bills", {
    column: "due_date",
    ascending: true,
  });
}

export function useDigitalAccess() {
  return useSupabaseTable<DigitalAccess>("digital_access", {
    column: "item_type",
  });
}

export function useLetterOfIntent() {
  const [data, setData] = useState<LetterOfIntent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const supabase = createClient();
        const { data: row } = await supabase
          .from("letter_of_intent")
          .select("*")
          .single();
        setData(row as LetterOfIntent | null);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  const save = async (content: string) => {
    const now = new Date().toISOString();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (data?.id) {
      await supabase
        .from("letter_of_intent")
        .update({ content, last_updated: now })
        .eq("id", data.id);
    } else {
      const { data: profile } = await supabase
        .from("profiles")
        .select("household_id")
        .eq("id", user?.id)
        .single();
      const { data: row } = await supabase
        .from("letter_of_intent")
        .insert({ user_id: user?.id, household_id: profile?.household_id, content, last_updated: now })
        .select()
        .single();
      setData(row as LetterOfIntent);
    }
    setData((prev) => prev ? { ...prev, content, last_updated: now } : null);
  };

  return { data, loading, save };
}

export function useActionItems() {
  return useSupabaseTable<ActionItem>("action_items", {
    column: "sort_order",
    ascending: true,
  });
}

// Household hook
export function useHousehold() {
  const [household, setHousehold] = useState<Household | null>(null);
  const [invites, setInvites] = useState<HouseholdInvite[]>([]);
  const [members, setMembers] = useState<{ id: string; display_name: string | null; email: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHousehold = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get profile with household_id
      const { data: profile } = await supabase
        .from("profiles")
        .select("household_id")
        .eq("id", user.id)
        .single();

      if (!profile?.household_id) return;

      // Get household
      const { data: hh } = await supabase
        .from("households")
        .select("*")
        .eq("id", profile.household_id)
        .single();
      setHousehold(hh as Household | null);

      // Get household members
      const { data: memberProfiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .eq("household_id", profile.household_id);
      setMembers((memberProfiles || []).map((m) => ({ ...m, email: null })));

      // Get pending invites
      const { data: inv } = await supabase
        .from("household_invites")
        .select("*")
        .eq("household_id", profile.household_id)
        .is("accepted_at", null);
      setInvites((inv as HouseholdInvite[]) || []);
    } catch (err) {
      console.error("Error fetching household:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHousehold();
  }, [fetchHousehold]);

  const sendInvite = async (email: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("household_id")
      .eq("id", user?.id)
      .single();

    const { data: invite, error } = await supabase
      .from("household_invites")
      .insert({
        household_id: profile?.household_id,
        email,
        invited_by: user?.id,
      })
      .select()
      .single();
    if (error) throw error;
    setInvites((prev) => [...prev, invite as HouseholdInvite]);
    return invite as HouseholdInvite;
  };

  const revokeInvite = async (inviteId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("household_invites")
      .delete()
      .eq("id", inviteId);
    if (error) throw error;
    setInvites((prev) => prev.filter((i) => i.id !== inviteId));
  };

  return { household, members, invites, loading, sendInvite, revokeInvite, refetch: fetchHousehold };
}

// Profile hook
export function useProfile() {
  const [monthlyIncome, setMonthlyIncome] = useState(10000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from("profiles").select("*").single();
        if (data?.monthly_take_home) setMonthlyIncome(data.monthly_take_home);
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  return { monthlyIncome, setMonthlyIncome, loading };
}
