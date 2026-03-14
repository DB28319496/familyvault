import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = user.id;

    // Helper to strip demo IDs and add user_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prep = (items: any[]) =>
      items.map(({ id, user_id, created_at, ...rest }) => ({
        ...rest,
        user_id: userId,
      }));

    // Seed all tables in parallel
    const results = await Promise.allSettled([
      supabase.from("debts").insert(prep(demoDebts)),
      supabase.from("net_worth_snapshots").insert(prep(demoNetWorthSnapshots)),
      supabase.from("budget_categories").insert(prep(demoBudgetCategories)),
      supabase.from("contacts").insert(prep(demoContacts)),
      supabase.from("legal_documents").insert(prep(demoLegalDocuments)),
      supabase.from("financial_accounts").insert(prep(demoFinancialAccounts)),
      supabase.from("insurance_policies").insert(prep(demoInsurancePolicies)),
      supabase.from("monthly_bills").insert(prep(demoMonthlyBills)),
      supabase.from("digital_access").insert(prep(demoDigitalAccess)),
      supabase.from("action_items").insert(prep(demoActionItems)),
      supabase.from("letter_of_intent").insert({
        user_id: userId,
        content: "",
        last_updated: new Date().toISOString(),
      }),
    ]);

    // Seed expenses separately (need real category IDs)
    // For now, seed without category_id foreign key
    const expenseData = demoExpenses.map(
      ({ id, user_id, created_at, category_id, ...rest }) => ({
        ...rest,
        user_id: userId,
        category_id: null, // Will need to be mapped after categories are created
      })
    );
    await supabase.from("expenses").insert(expenseData);

    const errors = results
      .filter((r) => r.status === "rejected")
      .map((r) => (r as PromiseRejectedResult).reason);

    if (errors.length > 0) {
      return NextResponse.json(
        { message: "Seeded with some errors", errors },
        { status: 207 }
      );
    }

    return NextResponse.json({ message: "Database seeded successfully!" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    );
  }
}
