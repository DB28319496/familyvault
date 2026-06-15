import type Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";

// Tools the Vault Assistant can call to ground its answers in the family's own
// data. Every query runs through the request's RLS-scoped Supabase client, so
// the assistant can only ever read/write the signed-in household's rows.

export const assistantTools: Anthropic.Tool[] = [
  {
    name: "get_financial_overview",
    description:
      "Get the household's financial snapshot: latest net worth, financial accounts (institution, type, owner, beneficiary, approximate balance), and outstanding debts. Call this for questions about money, net worth, assets, accounts, or debt.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_insurance_policies",
    description:
      "List the household's insurance policies: type, carrier, coverage amount, beneficiary, monthly premium, renewal date, and agent contact. Call this for questions about insurance coverage or gaps.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_legal_documents",
    description:
      "List the household's legal/estate documents (will, trust, power of attorney, etc.) with their status and where they're stored. Call this for questions about estate planning, wills, or document readiness.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_contacts",
    description:
      "List the family's key contacts (attorneys, financial advisors, executors, emergency contacts) with role and contact info.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_monthly_bills",
    description:
      "List the household's recurring monthly bills: name, amount, due date, payment method, and whether autopay is on.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_digital_access",
    description:
      "List the household's documented digital accounts and where access information is stored (references only — no raw passwords). Useful for digital-legacy and access-continuity questions.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_action_items",
    description:
      "List the household's preparedness action plan items with status and phase. Call this to see what's already planned before suggesting new tasks.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_letter_of_intent",
    description:
      "Get the current letter of intent content for the household, if one exists.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "create_action_item",
    description:
      "Add a new task to the household's preparedness action plan. Use this when the user asks you to add a to-do, or after agreeing on a concrete next step. Always confirm with the user before creating.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Short, actionable task title." },
        description: {
          type: "string",
          description: "Optional one or two sentences of detail.",
        },
        phase: {
          type: "integer",
          description: "Plan phase (1 = now/urgent, 2 = soon, 3 = later). Default 1.",
        },
      },
      required: ["title"],
    },
  },
];

type ToolResult = Record<string, unknown> | { error: string };

export async function runAssistantTool(
  supabase: SupabaseClient,
  userId: string,
  householdId: string | null,
  name: string,
  input: Record<string, unknown>
): Promise<ToolResult> {
  switch (name) {
    case "get_financial_overview": {
      const [{ data: netWorth }, { data: accounts }, { data: debts }] =
        await Promise.all([
          supabase
            .from("net_worth_snapshots")
            .select("snapshot_date, total_assets, total_liabilities, net_worth")
            .order("snapshot_date", { ascending: false })
            .limit(1),
          supabase
            .from("financial_accounts")
            .select(
              "institution, account_type, owner, beneficiary, approximate_balance, last_reviewed"
            ),
          supabase
            .from("debts")
            .select("card_name, balance, apr, min_payment, is_paid_off"),
        ]);
      return {
        latest_net_worth: netWorth?.[0] ?? null,
        accounts: accounts ?? [],
        debts: debts ?? [],
      };
    }
    case "get_insurance_policies": {
      const { data } = await supabase
        .from("insurance_policies")
        .select(
          "policy_type, carrier, coverage_amount, beneficiary, monthly_premium, renewal_date, agent_name, agent_phone"
        );
      return { policies: data ?? [] };
    }
    case "get_legal_documents": {
      const { data } = await supabase
        .from("legal_documents")
        .select("doc_type, status, storage_location, expiration_date, notes");
      return { documents: data ?? [] };
    }
    case "get_contacts": {
      const { data } = await supabase
        .from("contacts")
        .select("role, section, name, organization, phone, email, notes");
      return { contacts: data ?? [] };
    }
    case "get_monthly_bills": {
      const { data } = await supabase
        .from("monthly_bills")
        .select("name, amount, due_date, payment_method, is_autopay");
      return { bills: data ?? [] };
    }
    case "get_digital_access": {
      const { data } = await supabase
        .from("digital_access")
        .select("item_type, name, details, status");
      return { digital_access: data ?? [] };
    }
    case "get_action_items": {
      const { data } = await supabase
        .from("action_items")
        .select("title, description, phase, status, target_date")
        .order("sort_order", { ascending: true });
      return { action_items: data ?? [] };
    }
    case "get_letter_of_intent": {
      const { data } = await supabase
        .from("letter_of_intent")
        .select("content, last_updated")
        .maybeSingle();
      return { letter_of_intent: data ?? null };
    }
    case "create_action_item": {
      const title = String(input.title ?? "").trim();
      if (!title) return { error: "title is required" };
      const { data, error } = await supabase
        .from("action_items")
        .insert({
          user_id: userId,
          household_id: householdId,
          title,
          description: input.description ? String(input.description) : null,
          phase: typeof input.phase === "number" ? input.phase : 1,
          status: "not_started",
        })
        .select("id, title, phase")
        .single();
      if (error) return { error: error.message };
      return { created: data };
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
