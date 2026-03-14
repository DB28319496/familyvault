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
} from "@/lib/types";
import {
  demoDebts,
  demoNetWorthSnapshots,
  demoBudgetCategories,
  demoExpenses,
  demoContacts,
  demoLegalDocuments,
  demoFinancialAccounts,
  demoInsurancePolicies,
  demoMonthlyBills,
  demoDigitalAccess,
  demoActionItems,
} from "@/lib/demo-data";

function isDemoMode(): boolean {
  if (typeof window === "undefined") return true;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes("placeholder")) return true;
  return localStorage.getItem("fv-demo-mode") === "true";
}

// Generic hook for any table
function useSupabaseTable<T>(
  table: string,
  demoData: T[],
  orderBy?: { column: string; ascending?: boolean }
) {
  const [data, setData] = useState<T[]>(demoData);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (isDemoMode()) {
      setData(demoData);
      setLoading(false);
      return;
    }

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
      setData(demoData); // Fallback to demo data
    } finally {
      setLoading(false);
    }
  }, [table, demoData, orderBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const insert = async (item: Partial<T>) => {
    if (isDemoMode()) {
      const newItem = { ...item, id: crypto.randomUUID(), created_at: new Date().toISOString() } as T;
      setData((prev) => [...prev, newItem]);
      return newItem;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: row, error } = await supabase
      .from(table)
      .insert({ ...item, user_id: user?.id })
      .select()
      .single();
    if (error) throw error;
    setData((prev) => [...prev, row as T]);
    return row as T;
  };

  const update = async (id: string, updates: Partial<T>) => {
    if (isDemoMode()) {
      setData((prev) =>
        prev.map((item) => ((item as Record<string, unknown>).id === id ? { ...item, ...updates } : item))
      );
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from(table).update(updates).eq("id", id);
    if (error) throw error;
    setData((prev) =>
      prev.map((item) => ((item as Record<string, unknown>).id === id ? { ...item, ...updates } : item))
    );
  };

  const remove = async (id: string) => {
    if (isDemoMode()) {
      setData((prev) => prev.filter((item) => (item as Record<string, unknown>).id !== id));
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) throw error;
    setData((prev) => prev.filter((item) => (item as Record<string, unknown>).id !== id));
  };

  return { data, loading, refetch: fetchData, insert, update, remove, setData };
}

// Specific hooks for each data type
export function useDebts() {
  return useSupabaseTable<Debt>("debts", demoDebts, { column: "apr", ascending: false });
}

export function useNetWorthSnapshots() {
  return useSupabaseTable<NetWorthSnapshot>("net_worth_snapshots", demoNetWorthSnapshots, {
    column: "snapshot_date",
    ascending: true,
  });
}

export function useBudgetCategories() {
  return useSupabaseTable<BudgetCategory>("budget_categories", demoBudgetCategories, {
    column: "category_group",
  });
}

export function useExpenses() {
  return useSupabaseTable<Expense>("expenses", demoExpenses, {
    column: "date",
    ascending: false,
  });
}

export function useContacts() {
  return useSupabaseTable<Contact>("contacts", demoContacts, {
    column: "sort_order",
    ascending: true,
  });
}

export function useLegalDocuments() {
  return useSupabaseTable<LegalDocument>("legal_documents", demoLegalDocuments);
}

export function useFinancialAccounts() {
  return useSupabaseTable<FinancialAccount>("financial_accounts", demoFinancialAccounts, {
    column: "account_type",
  });
}

export function useInsurancePolicies() {
  return useSupabaseTable<InsurancePolicy>("insurance_policies", demoInsurancePolicies);
}

export function useMonthlyBills() {
  return useSupabaseTable<MonthlyBill>("monthly_bills", demoMonthlyBills, {
    column: "due_date",
    ascending: true,
  });
}

export function useDigitalAccess() {
  return useSupabaseTable<DigitalAccess>("digital_access", demoDigitalAccess, {
    column: "item_type",
  });
}

export function useLetterOfIntent() {
  const [data, setData] = useState<LetterOfIntent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (isDemoMode()) {
        setData({
          id: "demo-loi",
          user_id: "demo-user",
          content: "",
          last_updated: new Date().toISOString(),
        });
        setLoading(false);
        return;
      }

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
    if (isDemoMode()) {
      setData((prev) => prev ? { ...prev, content, last_updated: now } : {
        id: "demo-loi",
        user_id: "demo-user",
        content,
        last_updated: now,
      });
      return;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (data?.id) {
      await supabase
        .from("letter_of_intent")
        .update({ content, last_updated: now })
        .eq("id", data.id);
    } else {
      const { data: row } = await supabase
        .from("letter_of_intent")
        .insert({ user_id: user?.id, content, last_updated: now })
        .select()
        .single();
      setData(row as LetterOfIntent);
    }
    setData((prev) => prev ? { ...prev, content, last_updated: now } : null);
  };

  return { data, loading, save };
}

export function useActionItems() {
  return useSupabaseTable<ActionItem>("action_items", demoActionItems, {
    column: "sort_order",
    ascending: true,
  });
}

// Profile hook
export function useProfile() {
  const [monthlyIncome, setMonthlyIncome] = useState(10000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      if (isDemoMode()) {
        setLoading(false);
        return;
      }
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
