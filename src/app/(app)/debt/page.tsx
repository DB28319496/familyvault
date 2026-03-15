"use client";

import { useState, useMemo, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CreditCard, TrendingDown, DollarSign, Calendar, PartyPopper, Plus, Trash2, Pencil, X, Check } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatCurrency, formatCurrencyExact } from "@/lib/utils";
import { useDebts } from "@/lib/hooks/use-data";
import { calculateAvalanchePayoff } from "@/lib/calculations";
import type { Debt } from "@/lib/types";

const CARD_COLORS = ["#E24B4A", "#EF9F27", "#2C5282", "#1D9E75"];

const inputClass =
  "bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-navy/30 w-full";

interface NewDebtForm {
  card_name: string;
  balance: string;
  apr: string;
  min_payment: string;
}

const emptyForm: NewDebtForm = { card_name: "", balance: "", apr: "", min_payment: "" };

export default function DebtPage() {
  const { data: hookDebts, loading, update: updateDebt, insert, remove } = useDebts();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [monthlyExtra, setMonthlyExtra] = useState(1425);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<NewDebtForm>(emptyForm);
  const [addLoading, setAddLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<NewDebtForm>(emptyForm);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Sync local state with hook data
  useEffect(() => {
    if (!loading) {
      setDebts(hookDebts);
    }
  }, [hookDebts, loading]);

  const totalMinPayments = debts.reduce((s, d) => s + d.min_payment, 0);
  const totalMonthlyPayment = totalMinPayments + monthlyExtra;
  const totalDebt = debts.reduce((s, d) => s + (d.is_paid_off ? 0 : d.balance), 0);

  const avalanche = useMemo(
    () => calculateAvalanchePayoff(debts, monthlyExtra),
    [debts, monthlyExtra]
  );

  // Chart data — every other month to keep chart readable
  const chartData = avalanche.projections
    .filter((_, i) => i % 2 === 0 || i === avalanche.projections.length - 1)
    .map((p) => {
      const row: Record<string, string | number> = { month: p.month };
      debts.forEach((d) => {
        row[d.card_name] = Math.round(p.balances[d.id] || 0);
      });
      row["Total"] = Math.round(p.totalBalance);
      return row;
    });

  if (loading || debts.length === 0) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Debt Payoff Tracker</h1>
            <p className="text-muted-foreground text-sm mt-1">Avalanche method — highest APR first</p>
          </div>
          {!loading && debts.length === 0 && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Debt
            </button>
          )}
        </div>
        {!loading && debts.length === 0 && showAddForm && (
          <AddDebtCard
            form={addForm}
            setForm={setAddForm}
            loading={addLoading}
            onCancel={() => { setShowAddForm(false); setAddForm(emptyForm); }}
            onSubmit={handleAdd}
          />
        )}
        {loading && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <div className="animate-pulse space-y-3">
                    <div className="h-3 bg-surface-hover rounded w-24" />
                    <div className="h-7 bg-surface-hover rounded w-32" />
                    <div className="h-2 bg-surface-hover rounded w-20" />
                  </div>
                </Card>
              ))}
            </div>
            <Card>
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-surface-hover rounded w-40" />
                <div className="h-8 bg-surface-hover rounded w-full" />
              </div>
            </Card>
            <Card>
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-surface-hover rounded w-40" />
                <div className="h-64 bg-surface-hover rounded w-full" />
              </div>
            </Card>
          </>
        )}
        {!loading && debts.length === 0 && !showAddForm && (
          <Card>
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No debts tracked yet. Add one to get started!</p>
            </div>
          </Card>
        )}
      </div>
    );
  }

  async function handleAdd() {
    if (!addForm.card_name.trim() || !addForm.balance || !addForm.apr || !addForm.min_payment) return;
    setAddLoading(true);
    try {
      await insert({
        card_name: addForm.card_name.trim(),
        balance: parseFloat(addForm.balance),
        apr: parseFloat(addForm.apr),
        min_payment: parseFloat(addForm.min_payment),
        is_paid_off: false,
        paid_off_date: null,
      } as Partial<Debt>);
      setAddForm(emptyForm);
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to add debt:", err);
    } finally {
      setAddLoading(false);
    }
  }

  function startEdit(debt: Debt) {
    setEditingId(debt.id);
    setEditForm({
      card_name: debt.card_name,
      balance: String(debt.balance),
      apr: String(debt.apr),
      min_payment: String(debt.min_payment),
    });
  }

  async function saveEdit(id: string) {
    if (!editForm.card_name.trim() || !editForm.balance || !editForm.apr || !editForm.min_payment) return;
    try {
      await updateDebt(id, {
        card_name: editForm.card_name.trim(),
        balance: parseFloat(editForm.balance),
        apr: parseFloat(editForm.apr),
        min_payment: parseFloat(editForm.min_payment),
      } as Partial<Debt>);
      setEditingId(null);
    } catch (err) {
      console.error("Failed to update debt:", err);
    }
  }

  async function handleDelete(id: string) {
    try {
      await remove(id);
    } catch (err) {
      console.error("Failed to delete debt:", err);
    }
  }

  async function togglePaidOff(debt: Debt) {
    const nowPaidOff = !debt.is_paid_off;
    try {
      await updateDebt(debt.id, {
        is_paid_off: nowPaidOff,
        paid_off_date: nowPaidOff ? new Date().toISOString() : null,
      } as Partial<Debt>);
    } catch (err) {
      console.error("Failed to toggle paid off:", err);
    }
  }

  // Avalanche order for display
  const sortedDebts = [...debts].sort((a, b) => b.apr - a.apr);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Debt Payoff Tracker</h1>
          <p className="text-muted-foreground text-sm mt-1">Avalanche method — highest APR first</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy/90 transition-colors"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? "Cancel" : "Add Debt"}
        </button>
      </div>

      {/* Add Debt Form */}
      {showAddForm && (
        <AddDebtCard
          form={addForm}
          setForm={setAddForm}
          loading={addLoading}
          onCancel={() => { setShowAddForm(false); setAddForm(emptyForm); }}
          onSubmit={handleAdd}
        />
      )}

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardTitle>Total Debt</CardTitle>
          <p className="text-2xl font-bold text-coral mt-2">{formatCurrency(totalDebt)}</p>
        </Card>
        <Card>
          <CardTitle>Debt-Free Date</CardTitle>
          <p className="text-2xl font-bold text-teal mt-2">
            {avalanche.debtFreeDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{avalanche.monthsToPayoff} months away</p>
        </Card>
        <Card>
          <CardTitle>Interest Saved</CardTitle>
          <p className="text-2xl font-bold text-teal mt-2">{formatCurrency(avalanche.interestSaved)}</p>
          <p className="text-xs text-muted-foreground mt-1">vs. minimum payments only</p>
        </Card>
        <Card>
          <CardTitle>Monthly Payment</CardTitle>
          <p className="text-2xl font-bold text-foreground mt-2">{formatCurrency(totalMonthlyPayment)}</p>
          <p className="text-xs text-muted-foreground mt-1">{formatCurrency(totalMinPayments)} min + {formatCurrency(monthlyExtra)} extra</p>
        </Card>
      </div>

      {/* Extra Payment Slider */}
      <Card>
        <CardTitle>Monthly Extra Payment</CardTitle>
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Beyond minimums ({formatCurrency(totalMinPayments)}/mo)</span>
            <span className="text-lg font-bold text-navy">{formatCurrency(monthlyExtra)}/mo</span>
          </div>
          <input
            type="range"
            min={0}
            max={3000}
            step={25}
            value={monthlyExtra}
            onChange={(e) => setMonthlyExtra(Number(e.target.value))}
            className="w-full accent-navy h-2 rounded-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>$0</span>
            <span>$3,000</span>
          </div>
        </div>
      </Card>

      {/* Payoff Chart */}
      <Card>
        <CardTitle>Payoff Projection</CardTitle>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-fg)" />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} stroke="var(--muted-fg)" />
              <Tooltip
                formatter={(value) => formatCurrencyExact(Number(value))}
                contentStyle={{
                  backgroundColor: "var(--card-bg)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
              />
              <Legend />
              {debts.map((d, idx) => (
                <Line
                  key={d.id}
                  type="monotone"
                  dataKey={d.card_name}
                  stroke={CARD_COLORS[idx % CARD_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
              <Line
                type="monotone"
                dataKey="Total"
                stroke="#1A365D"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Avalanche Order */}
      <Card>
        <CardTitle>Payoff Order (Avalanche Method)</CardTitle>
        <p className="text-xs text-muted-foreground mt-1 mb-4">Paying highest interest rate first saves the most money</p>
        <div className="space-y-4">
          {sortedDebts.map((debt, idx) => {
            const paidOff = debt.is_paid_off || debt.balance <= 0;
            const progress = paidOff ? 100 : 0;
            const isEditing = editingId === debt.id;
            const isHovered = hoveredId === debt.id;

            return (
              <div
                key={debt.id}
                className="group relative flex items-start gap-4"
                onMouseEnter={() => setHoveredId(debt.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-hover shrink-0 text-sm font-bold text-muted-foreground">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    // Edit mode
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <input
                          type="text"
                          value={editForm.card_name}
                          onChange={(e) => setEditForm({ ...editForm, card_name: e.target.value })}
                          placeholder="Card name"
                          className={inputClass}
                          onKeyDown={(e) => e.key === "Enter" && saveEdit(debt.id)}
                          autoFocus
                        />
                        <input
                          type="number"
                          value={editForm.balance}
                          onChange={(e) => setEditForm({ ...editForm, balance: e.target.value })}
                          placeholder="Balance"
                          className={inputClass}
                          onKeyDown={(e) => e.key === "Enter" && saveEdit(debt.id)}
                          step="0.01"
                        />
                        <input
                          type="number"
                          value={editForm.apr}
                          onChange={(e) => setEditForm({ ...editForm, apr: e.target.value })}
                          placeholder="APR %"
                          className={inputClass}
                          onKeyDown={(e) => e.key === "Enter" && saveEdit(debt.id)}
                          step="0.01"
                        />
                        <input
                          type="number"
                          value={editForm.min_payment}
                          onChange={(e) => setEditForm({ ...editForm, min_payment: e.target.value })}
                          placeholder="Min payment"
                          className={inputClass}
                          onKeyDown={(e) => e.key === "Enter" && saveEdit(debt.id)}
                          step="0.01"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => saveEdit(debt.id)}
                          className="inline-flex items-center gap-1.5 bg-teal text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-teal/90 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="inline-flex items-center gap-1.5 bg-surface-hover text-muted-foreground px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-surface-hover/80 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Display mode
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${paidOff ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {debt.card_name}
                          </span>
                          {paidOff && <PartyPopper className="w-4 h-4 text-teal" />}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{formatCurrency(debt.balance)}</span>
                          {/* Action buttons — visible on hover */}
                          <div className={`flex items-center gap-1 transition-opacity ${isHovered ? "opacity-100" : "opacity-0"}`}>
                            <button
                              onClick={() => togglePaidOff(debt)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                paidOff
                                  ? "text-teal bg-teal/10 hover:bg-teal/20"
                                  : "text-muted-foreground hover:text-teal hover:bg-teal/10"
                              }`}
                              title={paidOff ? "Mark as unpaid" : "Mark as paid off"}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => startEdit(debt)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-navy hover:bg-navy/10 transition-colors"
                              title="Edit debt"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(debt.id)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-coral hover:bg-coral/10 transition-colors"
                              title="Delete debt"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-coral font-medium">{debt.apr}% APR</span>
                        <span className="text-xs text-muted-foreground">Min: {formatCurrency(debt.min_payment)}/mo</span>
                      </div>
                      <ProgressBar
                        value={progress}
                        color={CARD_COLORS[idx % CARD_COLORS.length]}
                        className="mt-2"
                        size="sm"
                      />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Interest Comparison */}
      <Card>
        <CardTitle>Interest Cost Comparison</CardTitle>
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <div className="bg-surface-hover rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Minimum Payments Only</p>
            <p className="text-xl font-bold text-coral mt-1">{formatCurrency(avalanche.totalInterestMinOnly)}</p>
            <p className="text-xs text-muted-foreground mt-1">in total interest</p>
          </div>
          <div className="bg-teal/10 rounded-lg p-4 border border-teal/20">
            <p className="text-sm text-teal">Your Avalanche Strategy</p>
            <p className="text-xl font-bold text-teal mt-1">{formatCurrency(avalanche.totalInterestPaid)}</p>
            <p className="text-xs text-teal/80 mt-1">
              Saving {formatCurrency(avalanche.interestSaved)} in interest!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ── Add Debt Card Component ── */
function AddDebtCard({
  form,
  setForm,
  loading: addLoading,
  onCancel,
  onSubmit,
}: {
  form: NewDebtForm;
  setForm: (f: NewDebtForm) => void;
  loading: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <Card>
      <CardTitle>New Debt</CardTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Card / Loan Name</label>
          <input
            type="text"
            value={form.card_name}
            onChange={(e) => setForm({ ...form, card_name: e.target.value })}
            placeholder="e.g. Chase Sapphire"
            className={inputClass}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            autoFocus
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Balance ($)</label>
          <input
            type="number"
            value={form.balance}
            onChange={(e) => setForm({ ...form, balance: e.target.value })}
            placeholder="5000"
            className={inputClass}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            step="0.01"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">APR (%)</label>
          <input
            type="number"
            value={form.apr}
            onChange={(e) => setForm({ ...form, apr: e.target.value })}
            placeholder="24.99"
            className={inputClass}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            step="0.01"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Min Payment ($/mo)</label>
          <input
            type="number"
            value={form.min_payment}
            onChange={(e) => setForm({ ...form, min_payment: e.target.value })}
            placeholder="100"
            className={inputClass}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            step="0.01"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={onSubmit}
          disabled={addLoading || !form.card_name.trim() || !form.balance || !form.apr || !form.min_payment}
          className="inline-flex items-center gap-2 bg-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          {addLoading ? "Adding..." : "Add Debt"}
        </button>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 bg-surface-hover text-muted-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-hover/80 transition-colors"
        >
          Cancel
        </button>
      </div>
    </Card>
  );
}
