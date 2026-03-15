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
  Plus,
  Trash2,
  Pencil,
  X,
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

const STATUS_ORDER = ["not_started", "in_progress", "complete", "needs_review"];

// ─── Shared form input class ──────────────────────────────────

const INPUT_CLASS =
  "bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-navy/30 w-full";

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

// ─── Shared Components ────────────────────────────────────────

function TabLoading() {
  return (
    <div className="flex items-center justify-center py-12 text-muted-foreground">
      <Loader2 className="w-5 h-5 animate-spin mr-2" />
      <span className="text-sm">Loading...</span>
    </div>
  );
}

function DeleteButton({ onDelete }: { onDelete: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-coral/10"
      title="Delete"
    >
      <Trash2 className="w-4 h-4 text-coral" />
    </button>
  );
}

function AddButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-navy rounded-lg hover:bg-navy/90 transition-colors"
    >
      <Plus className="w-4 h-4" />
      {label}
    </button>
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

// ─── 1. Contacts Tab ──────────────────────────────────────────

function ContactsTab() {
  const { data: contacts, loading, update, insert, remove, setData } = useContacts();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState({
    role: "",
    section: "professional",
    name: "",
    phone: "",
    email: "",
    organization: "",
  });

  const sections = ["professional", "medical", "emergency_family"];

  function updateField(
    id: string,
    field: keyof Contact,
    value: string | null
  ) {
    setData((prev: Contact[]) =>
      prev.map((c: Contact) => (c.id === id ? { ...c, [field]: value || null } : c))
    );
    update(id, { [field]: value || null } as Partial<Contact>).catch(console.error);
  }

  async function handleAdd() {
    if (!newContact.name.trim()) return;
    try {
      await insert({
        role: newContact.role || null,
        section: newContact.section,
        name: newContact.name,
        phone: newContact.phone || null,
        email: newContact.email || null,
        organization: newContact.organization || null,
        notes: null,
        sort_order: contacts.length,
      } as Partial<Contact>);
      setNewContact({ role: "", section: "professional", name: "", phone: "", email: "", organization: "" });
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to add contact:", err);
    }
  }

  async function handleDelete(id: string) {
    try {
      await remove(id);
    } catch (err) {
      console.error("Failed to delete contact:", err);
    }
  }

  if (loading) return <TabLoading />;

  return (
    <div className="space-y-8">
      {/* Add button */}
      <div className="flex justify-end">
        <AddButton label="Add Contact" onClick={() => setShowAddForm(true)} />
      </div>

      {/* Add form */}
      {showAddForm && (
        <Card className="p-4 border-navy/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">New Contact</h3>
            <button onClick={() => setShowAddForm(false)} className="p-1 hover:bg-surface-hover rounded">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Role (e.g., Attorney, Doctor)"
              value={newContact.role}
              onChange={(e) => setNewContact((p) => ({ ...p, role: e.target.value }))}
              className={INPUT_CLASS}
            />
            <select
              value={newContact.section}
              onChange={(e) => setNewContact((p) => ({ ...p, section: e.target.value }))}
              className={INPUT_CLASS}
            >
              {sections.map((s) => (
                <option key={s} value={s}>
                  {CONTACT_SECTION_LABELS[s]}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Name *"
              value={newContact.name}
              onChange={(e) => setNewContact((p) => ({ ...p, name: e.target.value }))}
              className={INPUT_CLASS}
            />
            <input
              type="text"
              placeholder="Phone"
              value={newContact.phone}
              onChange={(e) => setNewContact((p) => ({ ...p, phone: e.target.value }))}
              className={INPUT_CLASS}
            />
            <input
              type="text"
              placeholder="Email"
              value={newContact.email}
              onChange={(e) => setNewContact((p) => ({ ...p, email: e.target.value }))}
              className={INPUT_CLASS}
            />
            <input
              type="text"
              placeholder="Organization"
              value={newContact.organization}
              onChange={(e) => setNewContact((p) => ({ ...p, organization: e.target.value }))}
              className={INPUT_CLASS}
            />
          </div>
          <div className="flex justify-end mt-3">
            <button
              onClick={handleAdd}
              disabled={!newContact.name.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-navy rounded-lg hover:bg-navy/90 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </Card>
      )}

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
                <Card key={contact.id} className="p-4 group">
                  <div className="flex flex-col gap-3">
                    {/* Role label + delete */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-navy dark:text-blue-400">
                        {contact.role}
                      </p>
                      <DeleteButton onDelete={() => handleDelete(contact.id)} />
                    </div>

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
              {sectionContacts.length === 0 && (
                <p className="text-sm text-muted-foreground italic py-4">No contacts in this section.</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── 2. Legal Documents Tab ───────────────────────────────────

function LegalTab() {
  const { data: docs, loading, update, insert, remove } = useLegalDocuments();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<LegalDocument>>({});
  const [newDoc, setNewDoc] = useState({
    doc_type: "",
    status: "not_started",
    storage_location: "",
    expiration_date: "",
    notes: "",
  });

  async function handleAdd() {
    if (!newDoc.doc_type.trim()) return;
    try {
      await insert({
        doc_type: newDoc.doc_type,
        status: newDoc.status,
        storage_location: newDoc.storage_location || null,
        expiration_date: newDoc.expiration_date || null,
        notes: newDoc.notes || null,
        file_url: null,
      } as Partial<LegalDocument>);
      setNewDoc({ doc_type: "", status: "not_started", storage_location: "", expiration_date: "", notes: "" });
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to add document:", err);
    }
  }

  async function handleDelete(id: string) {
    try {
      await remove(id);
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  }

  function cycleStatus(doc: LegalDocument) {
    const currentIdx = STATUS_ORDER.indexOf(doc.status);
    const nextStatus = STATUS_ORDER[(currentIdx + 1) % STATUS_ORDER.length];
    update(doc.id, { status: nextStatus } as Partial<LegalDocument>).catch(console.error);
  }

  function startEdit(doc: LegalDocument) {
    setEditingId(doc.id);
    setEditValues({
      doc_type: doc.doc_type,
      storage_location: doc.storage_location,
      expiration_date: doc.expiration_date,
      notes: doc.notes,
    });
  }

  async function saveEdit(id: string) {
    try {
      await update(id, {
        doc_type: editValues.doc_type,
        storage_location: editValues.storage_location || null,
        expiration_date: editValues.expiration_date || null,
        notes: editValues.notes || null,
      } as Partial<LegalDocument>);
      setEditingId(null);
      setEditValues({});
    } catch (err) {
      console.error("Failed to update document:", err);
    }
  }

  if (loading) return <TabLoading />;

  const completed = docs.filter((d) => d.status === "complete").length;
  const total = docs.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Overall progress */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <CardTitle>Document Completion</CardTitle>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-foreground">
              {completed} / {total} complete
            </span>
            <AddButton label="Add Document" onClick={() => setShowAddForm(true)} />
          </div>
        </div>
        <ProgressBar value={pct} showLabel size="lg" />
      </Card>

      {/* Add form */}
      {showAddForm && (
        <Card className="p-4 border-navy/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">New Document</h3>
            <button onClick={() => setShowAddForm(false)} className="p-1 hover:bg-surface-hover rounded">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Document type (e.g., Will, Power of Attorney) *"
              value={newDoc.doc_type}
              onChange={(e) => setNewDoc((p) => ({ ...p, doc_type: e.target.value }))}
              className={INPUT_CLASS}
            />
            <select
              value={newDoc.status}
              onChange={(e) => setNewDoc((p) => ({ ...p, status: e.target.value }))}
              className={INPUT_CLASS}
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_BADGE[s].label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Storage location"
              value={newDoc.storage_location}
              onChange={(e) => setNewDoc((p) => ({ ...p, storage_location: e.target.value }))}
              className={INPUT_CLASS}
            />
            <input
              type="date"
              placeholder="Expiration date"
              value={newDoc.expiration_date}
              onChange={(e) => setNewDoc((p) => ({ ...p, expiration_date: e.target.value }))}
              className={INPUT_CLASS}
            />
            <input
              type="text"
              placeholder="Notes"
              value={newDoc.notes}
              onChange={(e) => setNewDoc((p) => ({ ...p, notes: e.target.value }))}
              className={INPUT_CLASS}
            />
          </div>
          <div className="flex justify-end mt-3">
            <button
              onClick={handleAdd}
              disabled={!newDoc.doc_type.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-navy rounded-lg hover:bg-navy/90 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </Card>
      )}

      {/* Document checklist */}
      <div className="space-y-2">
        {docs.map((doc) => {
          const badge = STATUS_BADGE[doc.status];
          const isEditing = editingId === doc.id;

          if (isEditing) {
            return (
              <Card key={doc.id} className="p-4 border-navy/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Document type *"
                    value={editValues.doc_type || ""}
                    onChange={(e) => setEditValues((p) => ({ ...p, doc_type: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                  <input
                    type="text"
                    placeholder="Storage location"
                    value={editValues.storage_location || ""}
                    onChange={(e) => setEditValues((p) => ({ ...p, storage_location: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                  <input
                    type="date"
                    value={editValues.expiration_date || ""}
                    onChange={(e) => setEditValues((p) => ({ ...p, expiration_date: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                  <input
                    type="text"
                    placeholder="Notes"
                    value={editValues.notes || ""}
                    onChange={(e) => setEditValues((p) => ({ ...p, notes: e.target.value }))}
                    className={cn(INPUT_CLASS, "sm:col-span-2")}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => { setEditingId(null); setEditValues({}); }}
                    className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => saveEdit(doc.id)}
                    className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-navy rounded-lg hover:bg-navy/90 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save
                  </button>
                </div>
              </Card>
            );
          }

          return (
            <Card key={doc.id} className="p-4 group">
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

                {/* Status badge - clickable to cycle */}
                <button
                  onClick={() => cycleStatus(doc)}
                  className={cn(
                    "text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 cursor-pointer hover:ring-2 hover:ring-navy/20 transition-all",
                    badge.className
                  )}
                  title="Click to change status"
                >
                  {badge.label}
                </button>

                {/* Edit button */}
                <button
                  onClick={() => startEdit(doc)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-surface-hover"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>

                {/* Delete button */}
                <DeleteButton onDelete={() => handleDelete(doc.id)} />
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
  const { data: accounts, loading, update, insert, remove } = useFinancialAccounts();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<FinancialAccount>>({});
  const [newAccount, setNewAccount] = useState({
    institution: "",
    account_type: "checking",
    last_four: "",
    owner: "",
    beneficiary: "",
    approximate_balance: "",
    login_reference: "",
    notes: "",
  });

  async function handleAdd() {
    if (!newAccount.institution.trim()) return;
    try {
      await insert({
        institution: newAccount.institution,
        account_type: newAccount.account_type,
        last_four: newAccount.last_four || null,
        owner: newAccount.owner || null,
        beneficiary: newAccount.beneficiary || null,
        approximate_balance: newAccount.approximate_balance ? parseFloat(newAccount.approximate_balance) : null,
        login_reference: newAccount.login_reference || null,
        notes: newAccount.notes || null,
        last_reviewed: new Date().toISOString().split("T")[0],
      } as Partial<FinancialAccount>);
      setNewAccount({ institution: "", account_type: "checking", last_four: "", owner: "", beneficiary: "", approximate_balance: "", login_reference: "", notes: "" });
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to add account:", err);
    }
  }

  async function handleDelete(id: string) {
    try {
      await remove(id);
    } catch (err) {
      console.error("Failed to delete account:", err);
    }
  }

  function startEdit(acct: FinancialAccount) {
    setEditingId(acct.id);
    setEditValues({
      institution: acct.institution,
      account_type: acct.account_type,
      last_four: acct.last_four,
      owner: acct.owner,
      beneficiary: acct.beneficiary,
      approximate_balance: acct.approximate_balance,
      login_reference: acct.login_reference,
      notes: acct.notes,
    });
  }

  async function saveEdit(id: string) {
    try {
      await update(id, {
        institution: editValues.institution,
        account_type: editValues.account_type,
        last_four: editValues.last_four || null,
        owner: editValues.owner || null,
        beneficiary: editValues.beneficiary || null,
        approximate_balance: editValues.approximate_balance,
        login_reference: editValues.login_reference || null,
        notes: editValues.notes || null,
      } as Partial<FinancialAccount>);
      setEditingId(null);
      setEditValues({});
    } catch (err) {
      console.error("Failed to update account:", err);
    }
  }

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
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-foreground">
              {formatCurrency(totalBalance)}
            </span>
            <AddButton label="Add Account" onClick={() => setShowAddForm(true)} />
          </div>
        </div>
      </Card>

      {/* Add form */}
      {showAddForm && (
        <Card className="p-4 border-navy/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">New Financial Account</h3>
            <button onClick={() => setShowAddForm(false)} className="p-1 hover:bg-surface-hover rounded">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Institution *"
              value={newAccount.institution}
              onChange={(e) => setNewAccount((p) => ({ ...p, institution: e.target.value }))}
              className={INPUT_CLASS}
            />
            <select
              value={newAccount.account_type}
              onChange={(e) => setNewAccount((p) => ({ ...p, account_type: e.target.value }))}
              className={INPUT_CLASS}
            >
              {Object.entries(ACCOUNT_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Last 4 digits"
              maxLength={4}
              value={newAccount.last_four}
              onChange={(e) => setNewAccount((p) => ({ ...p, last_four: e.target.value }))}
              className={INPUT_CLASS}
            />
            <input
              type="text"
              placeholder="Owner"
              value={newAccount.owner}
              onChange={(e) => setNewAccount((p) => ({ ...p, owner: e.target.value }))}
              className={INPUT_CLASS}
            />
            <input
              type="text"
              placeholder="Beneficiary"
              value={newAccount.beneficiary}
              onChange={(e) => setNewAccount((p) => ({ ...p, beneficiary: e.target.value }))}
              className={INPUT_CLASS}
            />
            <input
              type="number"
              placeholder="Approximate balance"
              value={newAccount.approximate_balance}
              onChange={(e) => setNewAccount((p) => ({ ...p, approximate_balance: e.target.value }))}
              className={INPUT_CLASS}
            />
            <input
              type="text"
              placeholder="Login reference"
              value={newAccount.login_reference}
              onChange={(e) => setNewAccount((p) => ({ ...p, login_reference: e.target.value }))}
              className={INPUT_CLASS}
            />
            <input
              type="text"
              placeholder="Notes"
              value={newAccount.notes}
              onChange={(e) => setNewAccount((p) => ({ ...p, notes: e.target.value }))}
              className={cn(INPUT_CLASS, "sm:col-span-2")}
            />
          </div>
          <div className="flex justify-end mt-3">
            <button
              onClick={handleAdd}
              disabled={!newAccount.institution.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-navy rounded-lg hover:bg-navy/90 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </Card>
      )}

      {/* Groups */}
      {Object.entries(groups).map(([type, accts]) => (
        <div key={type}>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {ACCOUNT_TYPE_LABELS[type] || type.replace(/_/g, " ")}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {accts.map((acct) => {
              const stale = isStale(acct.last_reviewed);
              const isEditing = editingId === acct.id;

              if (isEditing) {
                return (
                  <Card key={acct.id} className="p-4 border-navy/30">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Institution *"
                        value={editValues.institution || ""}
                        onChange={(e) => setEditValues((p) => ({ ...p, institution: e.target.value }))}
                        className={INPUT_CLASS}
                      />
                      <select
                        value={editValues.account_type || "checking"}
                        onChange={(e) => setEditValues((p) => ({ ...p, account_type: e.target.value }))}
                        className={INPUT_CLASS}
                      >
                        {Object.entries(ACCOUNT_TYPE_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Last 4"
                        maxLength={4}
                        value={editValues.last_four || ""}
                        onChange={(e) => setEditValues((p) => ({ ...p, last_four: e.target.value }))}
                        className={INPUT_CLASS}
                      />
                      <input
                        type="text"
                        placeholder="Owner"
                        value={editValues.owner || ""}
                        onChange={(e) => setEditValues((p) => ({ ...p, owner: e.target.value }))}
                        className={INPUT_CLASS}
                      />
                      <input
                        type="text"
                        placeholder="Beneficiary"
                        value={editValues.beneficiary || ""}
                        onChange={(e) => setEditValues((p) => ({ ...p, beneficiary: e.target.value }))}
                        className={INPUT_CLASS}
                      />
                      <input
                        type="number"
                        placeholder="Approximate balance"
                        value={editValues.approximate_balance ?? ""}
                        onChange={(e) => setEditValues((p) => ({ ...p, approximate_balance: e.target.value ? parseFloat(e.target.value) : null }))}
                        className={INPUT_CLASS}
                      />
                      <input
                        type="text"
                        placeholder="Login reference"
                        value={editValues.login_reference || ""}
                        onChange={(e) => setEditValues((p) => ({ ...p, login_reference: e.target.value }))}
                        className={INPUT_CLASS}
                      />
                      <input
                        type="text"
                        placeholder="Notes"
                        value={editValues.notes || ""}
                        onChange={(e) => setEditValues((p) => ({ ...p, notes: e.target.value }))}
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={() => { setEditingId(null); setEditValues({}); }}
                        className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEdit(acct.id)}
                        className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-navy rounded-lg hover:bg-navy/90 transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save
                      </button>
                    </div>
                  </Card>
                );
              }

              return (
                <Card key={acct.id} className="p-4 group">
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
                    <div className="flex items-center gap-1">
                      {acct.approximate_balance !== null && (
                        <span className="text-sm font-semibold text-foreground mr-2">
                          {formatCurrency(acct.approximate_balance)}
                        </span>
                      )}
                      <button
                        onClick={() => startEdit(acct)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-surface-hover"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <DeleteButton onDelete={() => handleDelete(acct.id)} />
                    </div>
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
  const { data: policies, loading, update, insert, remove } = useInsurancePolicies();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<InsurancePolicy>>({});
  const [newPolicy, setNewPolicy] = useState({
    policy_type: "",
    carrier: "",
    policy_number: "",
    coverage_amount: "",
    beneficiary: "",
    monthly_premium: "",
    agent_name: "",
    agent_phone: "",
    agent_email: "",
    renewal_date: "",
    notes: "",
  });

  async function handleAdd() {
    if (!newPolicy.policy_type.trim()) return;
    try {
      await insert({
        policy_type: newPolicy.policy_type,
        carrier: newPolicy.carrier || null,
        policy_number: newPolicy.policy_number || null,
        coverage_amount: newPolicy.coverage_amount ? parseFloat(newPolicy.coverage_amount) : null,
        beneficiary: newPolicy.beneficiary || null,
        monthly_premium: newPolicy.monthly_premium ? parseFloat(newPolicy.monthly_premium) : null,
        agent_name: newPolicy.agent_name || null,
        agent_phone: newPolicy.agent_phone || null,
        agent_email: newPolicy.agent_email || null,
        renewal_date: newPolicy.renewal_date || null,
        notes: newPolicy.notes || null,
      } as Partial<InsurancePolicy>);
      setNewPolicy({ policy_type: "", carrier: "", policy_number: "", coverage_amount: "", beneficiary: "", monthly_premium: "", agent_name: "", agent_phone: "", agent_email: "", renewal_date: "", notes: "" });
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to add policy:", err);
    }
  }

  async function handleDelete(id: string) {
    try {
      await remove(id);
    } catch (err) {
      console.error("Failed to delete policy:", err);
    }
  }

  function startEdit(policy: InsurancePolicy) {
    setEditingId(policy.id);
    setEditValues({
      policy_type: policy.policy_type,
      carrier: policy.carrier,
      policy_number: policy.policy_number,
      coverage_amount: policy.coverage_amount,
      beneficiary: policy.beneficiary,
      monthly_premium: policy.monthly_premium,
      agent_name: policy.agent_name,
      agent_phone: policy.agent_phone,
      agent_email: policy.agent_email,
      renewal_date: policy.renewal_date,
      notes: policy.notes,
    });
  }

  async function saveEdit(id: string) {
    try {
      await update(id, {
        policy_type: editValues.policy_type,
        carrier: editValues.carrier || null,
        policy_number: editValues.policy_number || null,
        coverage_amount: editValues.coverage_amount,
        beneficiary: editValues.beneficiary || null,
        monthly_premium: editValues.monthly_premium,
        agent_name: editValues.agent_name || null,
        agent_phone: editValues.agent_phone || null,
        agent_email: editValues.agent_email || null,
        renewal_date: editValues.renewal_date || null,
        notes: editValues.notes || null,
      } as Partial<InsurancePolicy>);
      setEditingId(null);
      setEditValues({});
    } catch (err) {
      console.error("Failed to update policy:", err);
    }
  }

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
      {/* Add button row */}
      <div className="flex justify-end">
        <AddButton label="Add Policy" onClick={() => setShowAddForm(true)} />
      </div>

      {/* Add form */}
      {showAddForm && (
        <Card className="p-4 border-navy/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">New Insurance Policy</h3>
            <button onClick={() => setShowAddForm(false)} className="p-1 hover:bg-surface-hover rounded">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Policy type (e.g., Term Life, Auto) *"
              value={newPolicy.policy_type}
              onChange={(e) => setNewPolicy((p) => ({ ...p, policy_type: e.target.value }))}
              className={INPUT_CLASS}
            />
            <input
              type="text"
              placeholder="Carrier"
              value={newPolicy.carrier}
              onChange={(e) => setNewPolicy((p) => ({ ...p, carrier: e.target.value }))}
              className={INPUT_CLASS}
            />
            <input
              type="text"
              placeholder="Policy number"
              value={newPolicy.policy_number}
              onChange={(e) => setNewPolicy((p) => ({ ...p, policy_number: e.target.value }))}
              className={INPUT_CLASS}
            />
            <input
              type="number"
              placeholder="Coverage amount"
              value={newPolicy.coverage_amount}
              onChange={(e) => setNewPolicy((p) => ({ ...p, coverage_amount: e.target.value }))}
              className={INPUT_CLASS}
            />
            <input
              type="text"
              placeholder="Beneficiary"
              value={newPolicy.beneficiary}
              onChange={(e) => setNewPolicy((p) => ({ ...p, beneficiary: e.target.value }))}
              className={INPUT_CLASS}
            />
            <input
              type="number"
              placeholder="Monthly premium"
              value={newPolicy.monthly_premium}
              onChange={(e) => setNewPolicy((p) => ({ ...p, monthly_premium: e.target.value }))}
              className={INPUT_CLASS}
            />
            <input
              type="text"
              placeholder="Agent name"
              value={newPolicy.agent_name}
              onChange={(e) => setNewPolicy((p) => ({ ...p, agent_name: e.target.value }))}
              className={INPUT_CLASS}
            />
            <input
              type="text"
              placeholder="Agent phone"
              value={newPolicy.agent_phone}
              onChange={(e) => setNewPolicy((p) => ({ ...p, agent_phone: e.target.value }))}
              className={INPUT_CLASS}
            />
            <input
              type="text"
              placeholder="Agent email"
              value={newPolicy.agent_email}
              onChange={(e) => setNewPolicy((p) => ({ ...p, agent_email: e.target.value }))}
              className={INPUT_CLASS}
            />
            <input
              type="date"
              placeholder="Renewal date"
              value={newPolicy.renewal_date}
              onChange={(e) => setNewPolicy((p) => ({ ...p, renewal_date: e.target.value }))}
              className={INPUT_CLASS}
            />
            <input
              type="text"
              placeholder="Notes"
              value={newPolicy.notes}
              onChange={(e) => setNewPolicy((p) => ({ ...p, notes: e.target.value }))}
              className={cn(INPUT_CLASS, "sm:col-span-2")}
            />
          </div>
          <div className="flex justify-end mt-3">
            <button
              onClick={handleAdd}
              disabled={!newPolicy.policy_type.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-navy rounded-lg hover:bg-navy/90 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </Card>
      )}

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
        {policies.map((policy) => {
          const isEditing = editingId === policy.id;

          if (isEditing) {
            return (
              <Card key={policy.id} className="p-4 border-navy/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Policy type *"
                    value={editValues.policy_type || ""}
                    onChange={(e) => setEditValues((p) => ({ ...p, policy_type: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                  <input
                    type="text"
                    placeholder="Carrier"
                    value={editValues.carrier || ""}
                    onChange={(e) => setEditValues((p) => ({ ...p, carrier: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                  <input
                    type="text"
                    placeholder="Policy number"
                    value={editValues.policy_number || ""}
                    onChange={(e) => setEditValues((p) => ({ ...p, policy_number: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                  <input
                    type="number"
                    placeholder="Coverage amount"
                    value={editValues.coverage_amount ?? ""}
                    onChange={(e) => setEditValues((p) => ({ ...p, coverage_amount: e.target.value ? parseFloat(e.target.value) : null }))}
                    className={INPUT_CLASS}
                  />
                  <input
                    type="text"
                    placeholder="Beneficiary"
                    value={editValues.beneficiary || ""}
                    onChange={(e) => setEditValues((p) => ({ ...p, beneficiary: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                  <input
                    type="number"
                    placeholder="Monthly premium"
                    value={editValues.monthly_premium ?? ""}
                    onChange={(e) => setEditValues((p) => ({ ...p, monthly_premium: e.target.value ? parseFloat(e.target.value) : null }))}
                    className={INPUT_CLASS}
                  />
                  <input
                    type="text"
                    placeholder="Agent name"
                    value={editValues.agent_name || ""}
                    onChange={(e) => setEditValues((p) => ({ ...p, agent_name: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                  <input
                    type="text"
                    placeholder="Agent phone"
                    value={editValues.agent_phone || ""}
                    onChange={(e) => setEditValues((p) => ({ ...p, agent_phone: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                  <input
                    type="text"
                    placeholder="Agent email"
                    value={editValues.agent_email || ""}
                    onChange={(e) => setEditValues((p) => ({ ...p, agent_email: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                  <input
                    type="date"
                    value={editValues.renewal_date || ""}
                    onChange={(e) => setEditValues((p) => ({ ...p, renewal_date: e.target.value }))}
                    className={INPUT_CLASS}
                  />
                  <input
                    type="text"
                    placeholder="Notes"
                    value={editValues.notes || ""}
                    onChange={(e) => setEditValues((p) => ({ ...p, notes: e.target.value }))}
                    className={cn(INPUT_CLASS, "sm:col-span-2")}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => { setEditingId(null); setEditValues({}); }}
                    className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => saveEdit(policy.id)}
                    className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-navy rounded-lg hover:bg-navy/90 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save
                  </button>
                </div>
              </Card>
            );
          }

          return (
            <Card key={policy.id} className="p-4 group">
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
                  <div className="flex items-center gap-1">
                    {policy.coverage_amount !== null &&
                      policy.coverage_amount > 0 && (
                        <span className="text-sm font-semibold text-teal mr-2">
                          {formatCurrency(policy.coverage_amount)}
                        </span>
                      )}
                    <button
                      onClick={() => startEdit(policy)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-surface-hover"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <DeleteButton onDelete={() => handleDelete(policy.id)} />
                  </div>
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
          );
        })}
      </div>
    </div>
  );
}

// ─── 5. Monthly Bills Tab ─────────────────────────────────────

function BillsTab() {
  const { data: bills, loading, update, insert, remove } = useMonthlyBills();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<MonthlyBill>>({});
  const [newBill, setNewBill] = useState({
    name: "",
    amount: "",
    due_date: "",
    payment_method: "",
    is_autopay: false,
    notes: "",
  });

  async function handleAdd() {
    if (!newBill.name.trim()) return;
    try {
      await insert({
        name: newBill.name,
        amount: newBill.amount ? parseFloat(newBill.amount) : null,
        due_date: newBill.due_date ? parseInt(newBill.due_date) : null,
        payment_method: newBill.payment_method || null,
        is_autopay: newBill.is_autopay,
        notes: newBill.notes || null,
      } as Partial<MonthlyBill>);
      setNewBill({ name: "", amount: "", due_date: "", payment_method: "", is_autopay: false, notes: "" });
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to add bill:", err);
    }
  }

  async function handleDelete(id: string) {
    try {
      await remove(id);
    } catch (err) {
      console.error("Failed to delete bill:", err);
    }
  }

  function startEdit(bill: MonthlyBill) {
    setEditingId(bill.id);
    setEditValues({
      name: bill.name,
      amount: bill.amount,
      due_date: bill.due_date,
      payment_method: bill.payment_method,
      is_autopay: bill.is_autopay,
      notes: bill.notes,
    });
  }

  async function saveEdit(id: string) {
    try {
      await update(id, {
        name: editValues.name,
        amount: editValues.amount,
        due_date: editValues.due_date,
        payment_method: editValues.payment_method || null,
        is_autopay: editValues.is_autopay,
        notes: editValues.notes || null,
      } as Partial<MonthlyBill>);
      setEditingId(null);
      setEditValues({});
    } catch (err) {
      console.error("Failed to update bill:", err);
    }
  }

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
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-foreground">
              {formatCurrency(totalMonthly)}
            </span>
            <AddButton label="Add Bill" onClick={() => setShowAddForm(true)} />
          </div>
        </div>
      </Card>

      {/* Add form */}
      {showAddForm && (
        <Card className="p-4 border-navy/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">New Bill</h3>
            <button onClick={() => setShowAddForm(false)} className="p-1 hover:bg-surface-hover rounded">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Bill name *"
              value={newBill.name}
              onChange={(e) => setNewBill((p) => ({ ...p, name: e.target.value }))}
              className={INPUT_CLASS}
            />
            <input
              type="number"
              placeholder="Amount"
              value={newBill.amount}
              onChange={(e) => setNewBill((p) => ({ ...p, amount: e.target.value }))}
              className={INPUT_CLASS}
            />
            <input
              type="number"
              placeholder="Due date (1-31)"
              min={1}
              max={31}
              value={newBill.due_date}
              onChange={(e) => setNewBill((p) => ({ ...p, due_date: e.target.value }))}
              className={INPUT_CLASS}
            />
            <input
              type="text"
              placeholder="Payment method"
              value={newBill.payment_method}
              onChange={(e) => setNewBill((p) => ({ ...p, payment_method: e.target.value }))}
              className={INPUT_CLASS}
            />
            <label className="flex items-center gap-2 px-3 py-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={newBill.is_autopay}
                onChange={(e) => setNewBill((p) => ({ ...p, is_autopay: e.target.checked }))}
                className="rounded border-border"
              />
              Autopay
            </label>
            <input
              type="text"
              placeholder="Notes"
              value={newBill.notes}
              onChange={(e) => setNewBill((p) => ({ ...p, notes: e.target.value }))}
              className={INPUT_CLASS}
            />
          </div>
          <div className="flex justify-end mt-3">
            <button
              onClick={handleAdd}
              disabled={!newBill.name.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-navy rounded-lg hover:bg-navy/90 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </Card>
      )}

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
          .map((bill) => {
            const isEditing = editingId === bill.id;

            if (isEditing) {
              return (
                <Card key={bill.id} className="p-4 border-navy/30">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Bill name *"
                      value={editValues.name || ""}
                      onChange={(e) => setEditValues((p) => ({ ...p, name: e.target.value }))}
                      className={INPUT_CLASS}
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={editValues.amount ?? ""}
                      onChange={(e) => setEditValues((p) => ({ ...p, amount: e.target.value ? parseFloat(e.target.value) : null }))}
                      className={INPUT_CLASS}
                    />
                    <input
                      type="number"
                      placeholder="Due date (1-31)"
                      min={1}
                      max={31}
                      value={editValues.due_date ?? ""}
                      onChange={(e) => setEditValues((p) => ({ ...p, due_date: e.target.value ? parseInt(e.target.value) : null }))}
                      className={INPUT_CLASS}
                    />
                    <input
                      type="text"
                      placeholder="Payment method"
                      value={editValues.payment_method || ""}
                      onChange={(e) => setEditValues((p) => ({ ...p, payment_method: e.target.value }))}
                      className={INPUT_CLASS}
                    />
                    <label className="flex items-center gap-2 px-3 py-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={editValues.is_autopay ?? false}
                        onChange={(e) => setEditValues((p) => ({ ...p, is_autopay: e.target.checked }))}
                        className="rounded border-border"
                      />
                      Autopay
                    </label>
                    <input
                      type="text"
                      placeholder="Notes"
                      value={editValues.notes || ""}
                      onChange={(e) => setEditValues((p) => ({ ...p, notes: e.target.value }))}
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={() => { setEditingId(null); setEditValues({}); }}
                      className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveEdit(bill.id)}
                      className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-navy rounded-lg hover:bg-navy/90 transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save
                    </button>
                  </div>
                </Card>
              );
            }

            return (
              <Card key={bill.id} className="p-4 group">
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

                  {/* Edit button */}
                  <button
                    onClick={() => startEdit(bill)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-surface-hover"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </button>

                  {/* Delete button */}
                  <DeleteButton onDelete={() => handleDelete(bill.id)} />
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );
}

// ─── 6. Digital Access Tab ────────────────────────────────────

function DigitalTab() {
  const { data: items, loading, update, insert, remove } = useDigitalAccess();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<DigitalAccess>>({});
  const [newItem, setNewItem] = useState({
    item_type: "account",
    name: "",
    details: "",
    status: "not_setup",
  });

  async function handleAdd() {
    if (!newItem.name.trim()) return;
    try {
      await insert({
        item_type: newItem.item_type,
        name: newItem.name,
        details: newItem.details || null,
        status: newItem.status,
      } as Partial<DigitalAccess>);
      setNewItem({ item_type: "account", name: "", details: "", status: "not_setup" });
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to add digital item:", err);
    }
  }

  async function handleDelete(id: string) {
    try {
      await remove(id);
    } catch (err) {
      console.error("Failed to delete digital item:", err);
    }
  }

  function startEdit(item: DigitalAccess) {
    setEditingId(item.id);
    setEditValues({
      item_type: item.item_type,
      name: item.name,
      details: item.details,
      status: item.status,
    });
  }

  async function saveEdit(id: string) {
    try {
      await update(id, {
        item_type: editValues.item_type,
        name: editValues.name,
        details: editValues.details || null,
        status: editValues.status,
      } as Partial<DigitalAccess>);
      setEditingId(null);
      setEditValues({});
    } catch (err) {
      console.error("Failed to update digital item:", err);
    }
  }

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
      {/* Add button */}
      <div className="flex justify-end">
        <AddButton label="Add Item" onClick={() => setShowAddForm(true)} />
      </div>

      {/* Add form */}
      {showAddForm && (
        <Card className="p-4 border-navy/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">New Digital Item</h3>
            <button onClick={() => setShowAddForm(false)} className="p-1 hover:bg-surface-hover rounded">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={newItem.item_type}
              onChange={(e) => setNewItem((p) => ({ ...p, item_type: e.target.value }))}
              className={INPUT_CLASS}
            >
              {Object.entries(DIGITAL_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Name *"
              value={newItem.name}
              onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
              className={INPUT_CLASS}
            />
            <input
              type="text"
              placeholder="Details"
              value={newItem.details}
              onChange={(e) => setNewItem((p) => ({ ...p, details: e.target.value }))}
              className={INPUT_CLASS}
            />
            <select
              value={newItem.status}
              onChange={(e) => setNewItem((p) => ({ ...p, status: e.target.value }))}
              className={INPUT_CLASS}
            >
              <option value="not_setup">Not Set Up</option>
              <option value="complete">Complete</option>
              <option value="configured">Configured</option>
            </select>
          </div>
          <div className="flex justify-end mt-3">
            <button
              onClick={handleAdd}
              disabled={!newItem.name.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-navy rounded-lg hover:bg-navy/90 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </Card>
      )}

      {typeOrder.map((type) => {
        const typeItems = groups[type];
        if (!typeItems) return null;

        return (
          <div key={type}>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {DIGITAL_TYPE_LABELS[type] || type}
            </h2>
            <div className="space-y-2">
              {typeItems.map((item) => {
                const isEditing = editingId === item.id;

                if (isEditing) {
                  return (
                    <Card key={item.id} className="p-4 border-navy/30">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <select
                          value={editValues.item_type || "account"}
                          onChange={(e) => setEditValues((p) => ({ ...p, item_type: e.target.value }))}
                          className={INPUT_CLASS}
                        >
                          {Object.entries(DIGITAL_TYPE_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Name *"
                          value={editValues.name || ""}
                          onChange={(e) => setEditValues((p) => ({ ...p, name: e.target.value }))}
                          className={INPUT_CLASS}
                        />
                        <input
                          type="text"
                          placeholder="Details"
                          value={editValues.details || ""}
                          onChange={(e) => setEditValues((p) => ({ ...p, details: e.target.value }))}
                          className={INPUT_CLASS}
                        />
                        <select
                          value={editValues.status || "not_setup"}
                          onChange={(e) => setEditValues((p) => ({ ...p, status: e.target.value }))}
                          className={INPUT_CLASS}
                        >
                          <option value="not_setup">Not Set Up</option>
                          <option value="complete">Complete</option>
                          <option value="configured">Configured</option>
                        </select>
                      </div>
                      <div className="flex justify-end gap-2 mt-3">
                        <button
                          onClick={() => { setEditingId(null); setEditValues({}); }}
                          className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(item.id)}
                          className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-navy rounded-lg hover:bg-navy/90 transition-colors"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Save
                        </button>
                      </div>
                    </Card>
                  );
                }

                return (
                  <Card key={item.id} className="p-4 group">
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
                      <button
                        onClick={() => startEdit(item)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-surface-hover"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <DeleteButton onDelete={() => handleDelete(item.id)} />
                    </div>
                  </Card>
                );
              })}
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
