// Database types matching Supabase schema

export interface Profile {
  id: string;
  display_name: string | null;
  household_income: number | null;
  monthly_take_home: number | null;
  created_at: string;
}

export interface Debt {
  id: string;
  user_id: string;
  card_name: string;
  balance: number;
  apr: number;
  min_payment: number;
  is_paid_off: boolean;
  paid_off_date: string | null;
  created_at: string;
}

export interface DebtPayment {
  id: string;
  debt_id: string;
  user_id: string;
  amount: number;
  date: string;
  created_at: string;
}

export interface NetWorthSnapshot {
  id: string;
  user_id: string;
  snapshot_date: string;
  assets: AssetBreakdown;
  liabilities: LiabilityBreakdown;
  total_assets: number;
  total_liabilities: number;
  net_worth: number;
  created_at: string;
}

export interface AssetBreakdown {
  cash: Record<string, number>;
  retirement: Record<string, number>;
  investments: Record<string, number>;
  education: Record<string, number>;
  other: Record<string, number>;
}

export interface LiabilityBreakdown {
  credit_cards: Record<string, number>;
  loans: Record<string, number>;
}

export interface BudgetCategory {
  id: string;
  user_id: string;
  name: string;
  target_amount: number | null;
  category_group: string;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  description: string | null;
  date: string;
  is_baby_expense: boolean;
  baby_category: string | null;
  created_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  role: string;
  section: string;
  name: string | null;
  organization: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  sort_order: number | null;
  created_at: string;
}

export interface LegalDocument {
  id: string;
  user_id: string;
  doc_type: string;
  status: "not_started" | "in_progress" | "complete" | "needs_review";
  storage_location: string | null;
  file_url: string | null;
  expiration_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface FinancialAccount {
  id: string;
  user_id: string;
  institution: string;
  account_type: string;
  last_four: string | null;
  owner: string | null;
  beneficiary: string | null;
  login_reference: string | null;
  approximate_balance: number | null;
  last_reviewed: string | null;
  notes: string | null;
  created_at: string;
}

export interface InsurancePolicy {
  id: string;
  user_id: string;
  policy_type: string;
  carrier: string | null;
  policy_number: string | null;
  coverage_amount: number | null;
  beneficiary: string | null;
  monthly_premium: number | null;
  agent_name: string | null;
  agent_phone: string | null;
  agent_email: string | null;
  renewal_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface MonthlyBill {
  id: string;
  user_id: string;
  name: string;
  amount: number | null;
  due_date: number | null;
  payment_method: string | null;
  is_autopay: boolean;
  notes: string | null;
  created_at: string;
}

export interface DigitalAccess {
  id: string;
  user_id: string;
  item_type: string;
  name: string;
  details: string | null;
  status: string | null;
  created_at: string;
}

export interface LetterOfIntent {
  id: string;
  user_id: string;
  content: string | null;
  last_updated: string;
}

export interface ActionItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  phase: number;
  status: "not_started" | "in_progress" | "complete";
  target_date: string | null;
  completed_date: string | null;
  notes: string | null;
  sort_order: number | null;
  created_at: string;
}
