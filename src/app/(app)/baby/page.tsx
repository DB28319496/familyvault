"use client";

import { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Baby,
  Plus,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { useExpenses } from "@/lib/hooks/use-data";

const BABY_CATEGORIES = [
  "diapers",
  "feeding",
  "clothing",
  "gear",
  "medical",
  "childcare",
  "toys",
  "other",
] as const;

type BabyCategory = (typeof BABY_CATEGORIES)[number];

const CATEGORY_LABELS: Record<BabyCategory, string> = {
  diapers: "Diapers & Wipes",
  feeding: "Feeding & Formula",
  clothing: "Clothing",
  gear: "Gear & Equipment",
  medical: "Medical & Health",
  childcare: "Childcare",
  toys: "Toys & Books",
  other: "Other",
};

const CATEGORY_COLORS: Record<BabyCategory, string> = {
  diapers: "#1A365D",
  feeding: "#2C5282",
  clothing: "#1D9E75",
  gear: "#E24B4A",
  medical: "#EF9F27",
  childcare: "#2DD4A0",
  toys: "#FCD34D",
  other: "#94A3B8",
};

// National average: ~$15,000 for the first year
const NATIONAL_AVG_YEARLY = 15_000;
const NATIONAL_AVG_MONTHLY = NATIONAL_AVG_YEARLY / 12;

// National average breakdown (approximate percentages)
const NATIONAL_AVG_BY_CATEGORY: Record<BabyCategory, number> = {
  diapers: 900,
  feeding: 1800,
  clothing: 1500,
  gear: 2400,
  medical: 1200,
  childcare: 5400,
  toys: 600,
  other: 1200,
};

interface BabyExpenseEntry {
  id: string;
  amount: number;
  category: BabyCategory;
  description: string;
  date: string;
}

export default function BabyPage() {
  const { data: allExpenses, loading, insert: insertExpense, remove: removeExpense } = useExpenses();

  const expenses: BabyExpenseEntry[] = useMemo(() => {
    return allExpenses
      .filter((e) => e.is_baby_expense && e.baby_category)
      .map((e) => ({
        id: e.id,
        amount: e.amount,
        category: e.baby_category as BabyCategory,
        description: e.description ?? "",
        date: e.date,
      }));
  }, [allExpenses]);

  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formAmount, setFormAmount] = useState("");
  const [formCategory, setFormCategory] = useState<BabyCategory>("diapers");
  const [formDescription, setFormDescription] = useState("");
  const [formDate, setFormDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  // Add expense
  async function handleAdd() {
    const amount = parseFloat(formAmount);
    if (!amount || amount <= 0) return;

    await insertExpense({
      amount,
      category_id: "baby",
      baby_category: formCategory,
      is_baby_expense: true,
      description: formDescription,
      date: formDate,
    });
    setFormAmount("");
    setFormDescription("");
    setFormDate(new Date().toISOString().slice(0, 10));
    setShowForm(false);
  }

  // Delete expense
  async function handleDelete(id: string) {
    await removeExpense(id);
  }

  // Totals
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);

  // Monthly totals
  const monthlyTotals = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of expenses) {
      const key = e.date.slice(0, 7); // YYYY-MM
      map[key] = (map[key] ?? 0) + e.amount;
    }
    return map;
  }, [expenses]);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthTotal = monthlyTotals[currentMonth] ?? 0;

  // First-year projection based on current month spending
  const projectedYearly = currentMonthTotal * 12;
  const projectedVsAvg = projectedYearly - NATIONAL_AVG_YEARLY;

  // By-category breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Record<BabyCategory, number> = {} as Record<BabyCategory, number>;
    for (const cat of BABY_CATEGORIES) {
      map[cat] = 0;
    }
    for (const e of expenses) {
      map[e.category] = (map[e.category] ?? 0) + e.amount;
    }
    return map;
  }, [expenses]);

  // Pie chart data
  const pieData = useMemo(() => {
    return BABY_CATEGORIES.filter((cat) => categoryBreakdown[cat] > 0).map(
      (cat) => ({
        name: CATEGORY_LABELS[cat],
        value: categoryBreakdown[cat],
        color: CATEGORY_COLORS[cat],
      })
    );
  }, [categoryBreakdown]);

  // Comparison bar chart data
  const comparisonData = useMemo(() => {
    return BABY_CATEGORIES.map((cat) => ({
      name:
        CATEGORY_LABELS[cat].length > 12
          ? CATEGORY_LABELS[cat].slice(0, 10) + "..."
          : CATEGORY_LABELS[cat],
      fullName: CATEGORY_LABELS[cat],
      Yours: categoryBreakdown[cat],
      "Nat'l Avg": Math.round(NATIONAL_AVG_BY_CATEGORY[cat] / 12), // monthly avg
    }));
  }, [categoryBreakdown]);

  // Sort expenses by date descending
  const sortedExpenses = useMemo(
    () => [...expenses].sort((a, b) => b.date.localeCompare(a.date)),
    [expenses]
  );

  const monthNames: Record<string, string> = {};
  for (const key of Object.keys(monthlyTotals)) {
    const d = new Date(key + "-01");
    monthNames[key] = d.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Baby Expense Tracker</h1>
          <p className="text-muted-foreground text-sm mt-1">Loading...</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <div className="h-20 animate-pulse bg-surface-hover rounded" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Baby Expense Tracker
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track costs leading up to and through baby&apos;s first year
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-light transition"
        >
          <Plus className="w-4 h-4" />
          Log Expense
        </button>
      </div>

      {/* Add expense form */}
      {showForm && (
        <Card className="border-navy/20">
          <CardTitle>New Baby Expense</CardTitle>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-navy/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) =>
                  setFormCategory(e.target.value as BabyCategory)
                }
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-navy/30"
              >
                {BABY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Description
              </label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="e.g. Pampers box"
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-navy/30"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Date
              </label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-navy/30"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!formAmount || parseFloat(formAmount) <= 0}
              className="px-4 py-2 bg-teal text-white rounded-lg text-sm font-medium hover:bg-teal-light transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add Expense
            </button>
          </div>
        </Card>
      )}

      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardTitle>This Month</CardTitle>
          <p className="text-2xl font-bold text-foreground mt-2">
            {formatCurrency(currentMonthTotal)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Nat&apos;l avg: {formatCurrency(NATIONAL_AVG_MONTHLY)}/mo
          </p>
        </Card>

        <Card>
          <CardTitle>Cumulative Total</CardTitle>
          <p className="text-2xl font-bold text-navy mt-2">
            {formatCurrency(totalSpent)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {expenses.length} expense{expenses.length !== 1 ? "s" : ""} logged
          </p>
        </Card>

        <Card>
          <CardTitle>First-Year Projection</CardTitle>
          <p
            className={cn(
              "text-2xl font-bold mt-2",
              projectedVsAvg > 0 ? "text-coral" : "text-teal"
            )}
          >
            {formatCurrency(projectedYearly)}
          </p>
          <div className="flex items-center gap-1 mt-1">
            {projectedVsAvg > 0 ? (
              <AlertTriangle className="w-3.5 h-3.5 text-coral" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-teal" />
            )}
            <span
              className={`text-xs font-medium ${
                projectedVsAvg > 0 ? "text-coral" : "text-teal"
              }`}
            >
              {projectedVsAvg > 0 ? "+" : ""}
              {formatCurrency(projectedVsAvg)} vs avg
            </span>
          </div>
        </Card>

        <Card>
          <CardTitle>vs National Average</CardTitle>
          <p className="text-lg font-bold text-foreground mt-2">
            {formatCurrency(NATIONAL_AVG_YEARLY)}/yr
          </p>
          <ProgressBar
            value={
              NATIONAL_AVG_YEARLY > 0
                ? (projectedYearly / NATIONAL_AVG_YEARLY) * 100
                : 0
            }
            color={projectedVsAvg > 0 ? "bg-coral" : "bg-teal"}
            size="sm"
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Your projection:{" "}
            {formatPercent((projectedYearly / NATIONAL_AVG_YEARLY) * 100)} of
            average
          </p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pie chart — category breakdown */}
        <Card>
          <CardTitle>Spending by Category</CardTitle>
          {pieData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Baby className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">No expenses logged yet</p>
            </div>
          ) : (
            <>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{
                        backgroundColor: "var(--card-bg)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "8px",
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs text-muted-foreground truncate">
                      {entry.name}
                    </span>
                    <span className="text-xs font-medium text-foreground ml-auto">
                      {formatCurrency(entry.value)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* Bar chart — yours vs national avg (monthly) */}
        <Card>
          <CardTitle>Your Spending vs National Average (Monthly)</CardTitle>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonData}
                layout="vertical"
                margin={{ left: 10, right: 20, top: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border-color)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tickFormatter={(v) =>
                    v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`
                  }
                  tick={{ fontSize: 11 }}
                  stroke="var(--muted-fg)"
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  tick={{ fontSize: 11 }}
                  stroke="var(--muted-fg)"
                />
                <Tooltip
                  formatter={(value, name) => [
                    formatCurrency(Number(value)),
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: "var(--card-bg)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="Yours" fill="#1D9E75" radius={[0, 4, 4, 0]} />
                <Bar
                  dataKey="Nat'l Avg"
                  fill="#94A3B8"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Category breakdown cards */}
      <Card>
        <CardTitle>Category Details</CardTitle>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {BABY_CATEGORIES.map((cat) => {
            const spent = categoryBreakdown[cat];
            const avgMonthly = NATIONAL_AVG_BY_CATEGORY[cat] / 12;
            const pctOfAvg = avgMonthly > 0 ? (spent / avgMonthly) * 100 : 0;
            return (
              <div
                key={cat}
                className="bg-surface-hover rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                  />
                  <span className="text-sm font-medium text-foreground">
                    {CATEGORY_LABELS[cat]}
                  </span>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(spent)}
                </p>
                <ProgressBar
                  value={Math.min(pctOfAvg, 100)}
                  color={
                    pctOfAvg > 100
                      ? "bg-coral"
                      : pctOfAvg > 70
                        ? "bg-amber"
                        : "bg-teal"
                  }
                  size="sm"
                />
                <p className="text-xs text-muted-foreground">
                  Avg: {formatCurrency(avgMonthly)}/mo
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Monthly totals */}
      {Object.keys(monthlyTotals).length > 0 && (
        <Card>
          <CardTitle>Monthly Totals</CardTitle>
          <div className="space-y-3 mt-4">
            {Object.entries(monthlyTotals)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([month, total]) => (
                <div
                  key={month}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      {monthNames[month] ?? month}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(total)}
                    </span>
                    {total > NATIONAL_AVG_MONTHLY ? (
                      <span className="text-xs text-coral font-medium">
                        +{formatCurrency(total - NATIONAL_AVG_MONTHLY)} over avg
                      </span>
                    ) : (
                      <span className="text-xs text-teal font-medium">
                        {formatCurrency(NATIONAL_AVG_MONTHLY - total)} under avg
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Expense log */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Expense Log</CardTitle>
          <span className="text-xs text-muted-foreground">
            {expenses.length} entries
          </span>
        </div>

        {sortedExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Baby className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">No baby expenses logged yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-sm text-navy font-medium hover:underline"
            >
              Log your first expense
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedExpenses.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-surface-hover transition group"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: CATEGORY_COLORS[exp.category],
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">
                      {exp.description || CATEGORY_LABELS[exp.category]}
                    </span>
                    <span className="text-xs text-muted-foreground bg-surface-hover px-2 py-0.5 rounded-full shrink-0">
                      {CATEGORY_LABELS[exp.category]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(exp.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className="text-sm font-semibold text-foreground shrink-0">
                  {formatCurrency(exp.amount)}
                </span>
                <button
                  onClick={() => handleDelete(exp.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-coral transition p-1"
                  title="Delete expense"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* First-year projection callout */}
      <Card
        className={cn(
          "border-l-4",
          projectedVsAvg > 0
            ? "border-l-coral bg-coral/5"
            : "border-l-teal bg-teal/5"
        )}
      >
        <div className="flex items-start gap-3">
          <TrendingUp
            className={cn(
              "w-5 h-5 shrink-0 mt-0.5",
              projectedVsAvg > 0 ? "text-coral" : "text-teal"
            )}
          />
          <div>
            <p className="text-sm font-semibold text-foreground">
              First-Year Projection: {formatCurrency(projectedYearly)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Based on this month&apos;s spending of{" "}
              {formatCurrency(currentMonthTotal)}, projected over 12 months. The
              national average for a baby&apos;s first year is{" "}
              {formatCurrency(NATIONAL_AVG_YEARLY)}.
              {projectedVsAvg > 0
                ? ` You're tracking ${formatCurrency(Math.abs(projectedVsAvg))} above average.`
                : ` You're tracking ${formatCurrency(Math.abs(projectedVsAvg))} below average.`}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
