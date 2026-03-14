"use client";

import { useState, useEffect } from "react";
import {
  Users,
  FileText,
  Landmark,
  ShieldCheck,
  Receipt,
  KeyRound,
  PenLine,
  Phone,
  Mail,
  Building2,
  StickyNote,
  MapPin,
  AlertTriangle,
  Check,
  Clock,
  CircleDot,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Calendar,
  Zap,
  Save,
  Info,
  Loader2,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  useContacts,
  useLegalDocuments,
  useFinancialAccounts,
  useInsurancePolicies,
  useMonthlyBills,
  useDigitalAccess,
  useLetterOfIntent,
} from "@/lib/hooks/use-data";
import type {
  Contact,
  LegalDocument,
  FinancialAccount,
  InsurancePolicy,
  MonthlyBill,
  DigitalAccess,
} from "@/lib/types";

// ─── Tab definitions ───────────────────────────────────────────

const TABS = [
  { id: "contacts", label: "Contacts", icon: Users },
  { id: "legal", label: "Legal Docs", icon: FileText },
  { id: "financial", label: "Financial", icon: Landmark },
  { id: "insurance", label: "Insurance", icon: ShieldCheck },
  { id: "bills", label: "Bills", icon: Receipt },
  { id: "digital", label: "Digital Access", icon: KeyRound },
  { id: "letter", label: "Letter of Intent", icon: PenLine },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ─── Section labels ────────────────────────────────────────────

const CONTACT_SECTION_LABELS: Record<string, string> = {
  professional: "Professional Advisors",
  medical: "Medical Providers",
  emergency_family: "Emergency / Family",
};

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  checking: "Checking",
  savings: "Savings",
  retirement_401k: "401(k)",
  roth_ira: "Roth IRA",
  brokerage: "Brokerage",
  credit_card: "Credit Card",
  hsa: "HSA",
  education_529: "529 Plan",
};

const DIGITAL_TYPE_LABELS: Record<string, string> = {
  password_manager: "Password Manager",
  device: "Devices",
  account: "Key Accounts",
  legacy_setting: "Legacy / Inactive Account Settings",
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  not_started: {
    label: "Not Started",
    className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-amber/10 text-amber",
  },
  complete: {
    label: "Complete",
    className: "bg-teal/10 text-teal",
  },
  needs_review: {
    label: "Needs Review",
    className: "bg-coral/10 text-coral",
  },
};

// ─── Letter prompts ────────────────────────────────────────────

const LETTER_PROMPTS = [
  {
    title: "Guardian Wishes",
    hint: "Who should care for your children? What values and parenting style are important to you?",
  },
  {
    title: "Financial Instructions",
    hint: "How should assets be managed? Any specific instructions for accounts, investments, or property?",
  },
  {
    title: "Personal Messages",
    hint: "Messages to your spouse, children, parents, or close friends.",
  },
  {
    title: "Care Instructions",
    hint: "Pets, special medical needs, ongoing obligations, subscriptions to cancel.",
  },
  {
    title: "Funeral / Memorial Wishes",
    hint: "Burial vs. cremation, service preferences, music, readings, charitable donations in lieu of flowers.",
  },
  {
    title: "Digital Life",
    hint: "Social media accounts -- keep, memorialize, or delete? Email archives? Photo libraries?",
  },
];

// ─── Main component ────────────────────────────────────────────

export default function BinderPage() {
  const [activeTab, setActiveTab] = useState<TabId>("contacts");

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Emergency Binder
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Everything your family needs to know -- in one place.
        </p>
      </div>

      {/* Tab navigation */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-1 min-w-max border-b border-border pb-px">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-navy text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "contacts" && <ContactsTab />}
        {activeTab === "legal" && <LegalTab />}
        {activeTab === "financial" && <FinancialTab />}
        {activeTab === "insurance" && <InsuranceTab />}
        {activeTab === "bills" && <BillsTab />}
        {activeTab === "digital" && <DigitalTab />}
        {activeTab === "letter" && <LetterTab />}
      </div>
    </div>
  );
}

// ─── 1. Contacts Tab ──────────────────────────────────────────

function TabLoading() {
  return (
    <div className="flex items-center justify-center py-12 text-muted-foreground">
      <Loader2 className="w-5 h-5 animate-spin mr-2" />
      <span className="text-sm">Loading...</span>
    </div>
  );
}

function ContactsTab() {
  const { data: contacts, loading, update, setData } = useContacts();

  const sections = ["professional", "medical", "emergency_family"];

  function updateField(
    id: string,
    field: keyof Contact,
    value: string | null
  ) {
    // Optimistic update via setData
    setData((prev: Contact[]) =>
      prev.map((c: Contact) => (c.id === id ? { ...c, [field]: value || null } : c))
    );
    // Persist
    update(id, { [field]: value || null } as Partial<Contact>).catch(console.error);
  }

  if (loading) return <TabLoading />;

  return (
    <div className="space-y-8">
      {sections.map((section) => {
        const sectionContacts = contacts
          .filter((c) => c.section === section)
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

        return (
          <div key={section}>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {CONTACT_SECTION_LABELS[section] || section}
            </h2>
            <div className="space-y-3">
              {sectionContacts.map((contact) => (
                <Card key={contact.id} className="p-4">
                  <div className="flex flex-col gap-3">
                    {/* Role label */}
                    <p className="text-sm font-semibold text-navy dark:text-blue-400">
                      {contact.role}
                    </p>

                    {/* Editable fields grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <EditableField
                        icon={<Users className="w-3.5 h-3.5" />}
                        label="Name"
                        value={contact.name}
                        onChange={(v) => updateField(contact.id, "name", v)}
                      />
                      <EditableField
                        icon={<Building2 className="w-3.5 h-3.5" />}
                        label="Organization"
                        value={contact.organization}
                        onChange={(v) =>
                          updateField(contact.id, "organization", v)
                        }
                      />
                      <EditableField
                        icon={<Phone className="w-3.5 h-3.5" />}
                        label="Phone"
                        value={contact.phone}
                        onChange={(v) => updateField(contact.id, "phone", v)}
                      />
                      <EditableField
                        icon={<Mail className="w-3.5 h-3.5" />}
                        label="Email"
                        value={contact.email}
                        onChange={(v) => updateField(contact.id, "email", v)}
                      />
                    </div>

                    {/* Notes */}
                    {contact.notes && (
                      <div className="flex items-start gap-2 text-xs text-muted-foreground">
                        <StickyNote className="w-3 h-3 mt-0.5 shrink-0" />
                        <input
                          type="text"
                          value={contact.notes}
                          onChange={(e) =>
                            updateField(contact.id, "notes", e.target.value)
                          }
                          className="bg-transparent border-none outline-none w-full text-xs text-muted-foreground"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EditableField({
  icon,
  label,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <input
        type="text"
        placeholder={label}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "text-sm bg-transparent border-b border-border outline-none w-full py-1 transition-colors",
          "focus:border-navy dark:focus:border-blue-400",
          value ? "text-foreground" : "text-muted-foreground"
        )}
      />
    </div>
  );
}

// ─── 2. Legal Documents Tab ───────────────────────────────────

function LegalTab() {
  const { data: docs, loading } = useLegalDocuments();

  if (loading) return <TabLoading />;

  const completed = docs.filter((d) => d.status === "complete").length;
  const total = docs.length;
  const pct = Math.round((completed / total) * 100);

  return (
    <div className="space-y-6">
      {/* Overall progress */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <CardTitle>Document Completion</CardTitle>
          <span className="text-sm font-semibold text-foreground">
            {completed} / {total} complete
          </span>
        </div>
        <ProgressBar value={pct} showLabel size="lg" />
      </Card>

      {/* Document checklist */}
      <div className="space-y-2">
        {docs.map((doc) => {
          const badge = STATUS_BADGE[doc.status];
          return (
            <Card key={doc.id} className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Status icon */}
                <div className="shrink-0">
                  {doc.status === "complete" ? (
                    <Check className="w-5 h-5 text-teal" />
                  ) : doc.status === "in_progress" ? (
                    <Clock className="w-5 h-5 text-amber" />
                  ) : doc.status === "needs_review" ? (
                    <AlertTriangle className="w-5 h-5 text-coral" />
                  ) : (
                    <CircleDot className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                {/* Document name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {doc.doc_type}
                  </p>
                  {doc.notes && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {doc.notes}
                    </p>
                  )}
                </div>

                {/* Storage location */}
                {doc.storage_location && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <MapPin className="w-3 h-3" />
                    {doc.storage_location}
                  </div>
                )}

                {/* Expiration */}
                {doc.expiration_date && (
                  <div className="text-xs text-muted-foreground shrink-0">
                    Exp: {formatDate(doc.expiration_date)}
                  </div>
                )}

                {/* Status badge */}
                <span
                  className={cn(
                    "text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap shrink-0",
                    badge.className
                  )}
                >
                  {badge.label}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── 3. Financial Accounts Tab ────────────────────────────────

function FinancialTab() {
  const { data: accounts, loading } = useFinancialAccounts();

  if (loading) return <TabLoading />;


  // Group by account_type
  const groups: Record<string, FinancialAccount[]> = {};
  for (const acct of accounts) {
    const key = acct.account_type;
    if (!groups[key]) groups[key] = [];
    groups[key].push(acct);
  }

  const totalBalance = accounts.reduce(
    (s, a) => s + (a.approximate_balance ?? 0),
    0
  );

  function isStale(lastReviewed: string | null): boolean {
    if (!lastReviewed) return true;
    const diff =
      new Date().getTime() - new Date(lastReviewed).getTime();
    const months = diff / (1000 * 60 * 60 * 24 * 30);
    return months >= 12;
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <div className="flex items-center justify-between">
          <CardTitle>Total Tracked Balance</CardTitle>
          <span className="text-xl font-bold text-foreground">
            {formatCurrency(totalBalance)}
          </span>
        </div>
      </Card>

      {/* Groups */}
      {Object.entries(groups).map(([type, accts]) => (
        <div key={type}>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {ACCOUNT_TYPE_LABELS[type] || type.replace(/_/g, " ")}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {accts.map((acct) => {
              const stale = isStale(acct.last_reviewed);
              return (
                <Card key={acct.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {acct.institution}
                      </p>
                      {acct.last_four && (
                        <p className="text-xs text-muted-foreground">
                          ****{acct.last_four}
                        </p>
                      )}
                    </div>
                    {acct.approximate_balance !== null && (
                      <span className="text-sm font-semibold text-foreground">
                        {formatCurrency(acct.approximate_balance)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {acct.owner && (
                      <div>
                        <span className="font-medium">Owner:</span>{" "}
                        {acct.owner}
                      </div>
                    )}
                    {acct.beneficiary && (
                      <div>
                        <span className="font-medium">Beneficiary:</span>{" "}
                        {acct.beneficiary}
                      </div>
                    )}
                    {acct.login_reference && (
                      <div>
                        <span className="font-medium">Login:</span>{" "}
                        {acct.login_reference}
                      </div>
                    )}
                    {acct.last_reviewed && (
                      <div
                        className={cn(
                          stale && "text-coral font-medium"
                        )}
                      >
                        <span className="font-medium">Reviewed:</span>{" "}
                        {formatDate(acct.last_reviewed)}
                        {stale && " (stale)"}
                      </div>
                    )}
                  </div>

                  {acct.notes && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      {acct.notes}
                    </p>
                  )}

                  {stale && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-coral font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Not reviewed in 12+ months
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── 4. Insurance Tab ─────────────────────────────────────────

function InsuranceTab() {
  const { data: policies, loading } = useInsurancePolicies();

  if (loading) return <TabLoading />;


  // Coverage gap analysis
  const currentLifeCoverage = policies
    .filter((p) => p.policy_type.toLowerCase().includes("life"))
    .reduce((s, p) => s + (p.coverage_amount ?? 0), 0);
  const recommendedCoverage = 2750000;
  const gapPct = Math.min(
    100,
    Math.round((currentLifeCoverage / recommendedCoverage) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Coverage gap */}
      <Card className="border-coral/30 bg-coral/5">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-coral shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Life Insurance Coverage Gap
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Current: {formatCurrency(currentLifeCoverage)} | Recommended:{" "}
              {formatCurrency(recommendedCoverage)}
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="w-full h-6 bg-surface-hover rounded-full overflow-hidden">
            <div
              className="h-full bg-coral rounded-full transition-all duration-500 flex items-center justify-end pr-2"
              style={{ width: `${gapPct}%` }}
            >
              <span className="text-[10px] font-bold text-white">
                {formatCurrency(currentLifeCoverage)}
              </span>
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>$0</span>
            <span>{formatCurrency(recommendedCoverage)}</span>
          </div>
        </div>
        <p className="text-xs text-coral font-medium mt-2">
          Gap: {formatCurrency(recommendedCoverage - currentLifeCoverage)} --
          only {gapPct}% of recommended coverage
        </p>
      </Card>

      {/* Policies */}
      <div className="space-y-3">
        {policies.map((policy) => (
          <Card key={policy.id} className="p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {policy.policy_type}
                  </p>
                  {policy.carrier && (
                    <p className="text-xs text-muted-foreground">
                      {policy.carrier}
                    </p>
                  )}
                </div>
                {policy.coverage_amount !== null &&
                  policy.coverage_amount > 0 && (
                    <span className="text-sm font-semibold text-teal">
                      {formatCurrency(policy.coverage_amount)}
                    </span>
                  )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {policy.policy_number && (
                  <div>
                    <span className="font-medium">Policy #:</span>{" "}
                    {policy.policy_number}
                  </div>
                )}
                {policy.beneficiary && (
                  <div>
                    <span className="font-medium">Beneficiary:</span>{" "}
                    {policy.beneficiary}
                  </div>
                )}
                {policy.monthly_premium !== null && (
                  <div>
                    <span className="font-medium">Premium:</span>{" "}
                    {policy.monthly_premium === 0
                      ? "Employer-paid"
                      : `${formatCurrency(policy.monthly_premium)}/mo`}
                  </div>
                )}
                {policy.agent_name && (
                  <div>
                    <span className="font-medium">Agent:</span>{" "}
                    {policy.agent_name}
                  </div>
                )}
                {policy.agent_phone && (
                  <div>
                    <span className="font-medium">Agent Phone:</span>{" "}
                    {policy.agent_phone}
                  </div>
                )}
                {policy.agent_email && (
                  <div>
                    <span className="font-medium">Agent Email:</span>{" "}
                    {policy.agent_email}
                  </div>
                )}
                {policy.renewal_date && (
                  <div>
                    <span className="font-medium">Renewal:</span>{" "}
                    {formatDate(policy.renewal_date)}
                  </div>
                )}
              </div>

              {policy.notes && (
                <p className="text-xs text-muted-foreground italic mt-1">
                  {policy.notes}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── 5. Monthly Bills Tab ─────────────────────────────────────

function BillsTab() {
  const { data: bills, loading } = useMonthlyBills();

  if (loading) return <TabLoading />;

  const totalMonthly = bills.reduce((s, b) => s + (b.amount ?? 0), 0);

  // Calendar: group bills by due date
  const billsByDay: Record<number, MonthlyBill[]> = {};
  for (const bill of bills) {
    if (bill.due_date) {
      if (!billsByDay[bill.due_date]) billsByDay[bill.due_date] = [];
      billsByDay[bill.due_date].push(bill);
    }
  }

  return (
    <div className="space-y-6">
      {/* Total */}
      <Card>
        <div className="flex items-center justify-between">
          <CardTitle>Total Monthly Obligations</CardTitle>
          <span className="text-xl font-bold text-foreground">
            {formatCurrency(totalMonthly)}
          </span>
        </div>
      </Card>

      {/* Calendar visualization */}
      <Card>
        <CardTitle className="mb-4">Bill Due Date Calendar</CardTitle>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
            const dayBills = billsByDay[day];
            const hasBills = !!dayBills;
            return (
              <div
                key={day}
                className={cn(
                  "relative aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-colors",
                  hasBills
                    ? "bg-navy/10 dark:bg-navy/30 font-semibold text-navy dark:text-blue-300"
                    : "bg-surface-hover/50 text-muted-foreground"
                )}
                title={
                  hasBills
                    ? dayBills.map((b) => b.name).join(", ")
                    : undefined
                }
              >
                <span>{day}</span>
                {hasBills && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayBills.map((b) => (
                      <div
                        key={b.id}
                        className="w-1.5 h-1.5 rounded-full bg-navy dark:bg-blue-400"
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Bill list */}
      <div className="space-y-2">
        {bills
          .sort((a, b) => (a.due_date ?? 0) - (b.due_date ?? 0))
          .map((bill) => (
            <Card key={bill.id} className="p-4">
              <div className="flex items-center gap-4">
                {/* Due date */}
                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-surface-hover shrink-0">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm font-bold text-foreground">
                    {bill.due_date ?? "--"}
                  </span>
                </div>

                {/* Bill info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {bill.name}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    {bill.payment_method && (
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        {bill.payment_method}
                      </span>
                    )}
                    {bill.notes && <span>{bill.notes}</span>}
                  </div>
                </div>

                {/* Autopay badge */}
                {bill.is_autopay && (
                  <span className="flex items-center gap-1 text-xs font-medium text-teal bg-teal/10 px-2 py-1 rounded-full shrink-0">
                    <Zap className="w-3 h-3" />
                    Autopay
                  </span>
                )}

                {/* Amount */}
                <span className="text-sm font-semibold text-foreground shrink-0">
                  {bill.amount ? formatCurrency(bill.amount) : "--"}
                </span>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}

// ─── 6. Digital Access Tab ────────────────────────────────────

function DigitalTab() {
  const { data: items, loading } = useDigitalAccess();

  if (loading) return <TabLoading />;


  const groups: Record<string, DigitalAccess[]> = {};
  for (const item of items) {
    const key = item.item_type;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }

  const typeOrder = ["password_manager", "device", "account", "legacy_setting"];

  function statusDisplay(item: DigitalAccess) {
    if (item.item_type === "legacy_setting") {
      return item.status === "not_setup" ? (
        <span className="text-xs font-medium text-coral bg-coral/10 px-2 py-1 rounded-full">
          Not Set Up
        </span>
      ) : (
        <span className="text-xs font-medium text-teal bg-teal/10 px-2 py-1 rounded-full">
          Configured
        </span>
      );
    }
    if (item.status === "complete") {
      return (
        <span className="text-xs font-medium text-teal bg-teal/10 px-2 py-1 rounded-full">
          Complete
        </span>
      );
    }
    if (item.status === "not_setup") {
      return (
        <span className="text-xs font-medium text-amber bg-amber/10 px-2 py-1 rounded-full">
          Needs Setup
        </span>
      );
    }
    return null;
  }

  return (
    <div className="space-y-8">
      {typeOrder.map((type) => {
        const typeItems = groups[type];
        if (!typeItems) return null;

        return (
          <div key={type}>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {DIGITAL_TYPE_LABELS[type] || type}
            </h2>
            <div className="space-y-2">
              {typeItems.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <KeyRound className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {item.name}
                      </p>
                      {item.details && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.details}
                        </p>
                      )}
                    </div>
                    {statusDisplay(item)}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── 7. Letter of Intent Tab ──────────────────────────────────

function LetterTab() {
  const { data: letterData, loading, save } = useLetterOfIntent();

  const defaultContent = `To my beloved family,

If you're reading this, it means I'm no longer able to be with you. I want you to know that every decision I've made has been with your well-being in mind. This letter is my way of making sure you have the guidance and information you need.

[Continue writing your letter of intent here...]`;

  const [content, setContent] = useState(defaultContent);
  const [expandedPrompts, setExpandedPrompts] = useState<
    Record<number, boolean>
  >({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Sync content from hook data once loaded
  useEffect(() => {
    if (letterData) {
      setContent(letterData.content || defaultContent);
      if (letterData.last_updated) {
        setLastSaved(new Date(letterData.last_updated));
      }
    }
  }, [letterData]);

  function togglePrompt(idx: number) {
    setExpandedPrompts((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }

  function handleSave() {
    save(content).catch(console.error);
    setLastSaved(new Date());
  }

  if (loading) return <TabLoading />;

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <Card className="border-navy/20 bg-navy/5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-navy dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">
              About the Letter of Intent
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              This is NOT a legal document. It is a personal letter that
              provides guidance to your family about your wishes, values, and
              instructions. It supplements your legal documents (will, trust,
              POA) with the personal context they cannot capture.
            </p>
          </div>
        </div>
      </Card>

      {/* Writing prompts */}
      <Card>
        <CardTitle className="mb-3">Guided Writing Prompts</CardTitle>
        <div className="space-y-1">
          {LETTER_PROMPTS.map((prompt, idx) => (
            <div key={idx} className="border border-border rounded-lg">
              <button
                onClick={() => togglePrompt(idx)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface-hover rounded-lg transition-colors text-left"
              >
                {expandedPrompts[idx] ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
                {prompt.title}
              </button>
              {expandedPrompts[idx] && (
                <div className="px-3 pb-3">
                  <p className="text-xs text-muted-foreground italic ml-6">
                    {prompt.hint}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Editor */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <CardTitle>Your Letter</CardTitle>
          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className="text-xs text-muted-foreground">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-navy rounded-lg hover:bg-navy/90 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={20}
          className="w-full bg-surface-hover/50 border border-border rounded-lg p-4 text-sm text-foreground leading-relaxed resize-y outline-none focus:border-navy dark:focus:border-blue-400 transition-colors"
          placeholder="Begin writing your letter of intent..."
        />
        <p className="text-xs text-muted-foreground mt-2 text-right">
          {content.length} characters
        </p>
      </Card>
    </div>
  );
}
