"use client";

import { useMemo } from "react";
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
  Legend,
} from "recharts";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { useBudgetCategories, useExpenses, useProfile } from "@/lib/hooks/use-data";

const SAVINGS_RATE_TARGET = 20;

const GROUP_ORDER = [
  "housing",
  "essentials",
  "baby",
  "debt",
  "savings",
  "investments",
  "flex",
] as const;

const GROUP_LABELS: Record<string, string> = {
  housing: "Housing",
  essentials: "Essentials",
  baby: "Baby",
  debt: "Debt Payoff",
  savings: "Savings",
  investments: "Investments",
  flex: "Flexible",
};

const GROUP_COLORS: Record<string, string> = {
  housing: "#1A365D",
  essentials: "#2C5282",
  baby: "#E24B4A",
  debt: "#EF9F27",
  savings: "#1D9E75",
  investments: "#2DD4A0",
  flex: "#94A3B8",
};

const CATEGORY_COLORS = [
  "#1A365D",
  "#2C5282",
  "#1D9E75",
  "#2DD4A0",
  "#E24B4A",
  "#EF9F27",
  "#FCD34D",
  "#F87171",
  "#94A3B8",
  "#64748B",
  "#475569",
  "#334155",
];

export default function BudgetPage() {
  const { data: categories, loading: categoriesLoading } = useBudgetCategories();
  const { data: expenses, loading: expensesLoading } = useExpenses();
  const { monthlyIncome: MONTHLY_INCOME, loading: profileLoading } = useProfile();

  const loading = categoriesLoading || expensesLoading || profileLoading;

  // Calculate actual spending per category
  const actualByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const exp of expenses) {
      map[exp.category_id] = (map[exp.category_id] ?? 0) + exp.amount;
    }
    return map;
  }, [expenses]);

  // Build enriched category data
  const enrichedCategories = useMemo(() => {
    return categories.map((cat) => {
      const actual = actualByCategory[cat.id] ?? 0;
      const target = cat.target_amount ?? 0;
      const pct = target > 0 ? (actual / target) * 100 : 0;
      const overBudget = actual > target && target > 0;
      return { ...cat, actual, target, pct, overBudget };
    });
  }, [categories, actualByCategory]);

  const totalBudget = enrichedCategories.reduce((s, c) => s + c.target, 0);
  const totalSpent = enrichedCategories.reduce((s, c) => s + c.actual, 0);
  const totalRemaining = totalBudget - totalSpent;

  // Savings rate: savings + investments categories as % of income
  const savingsInvestCategories = enrichedCategories.filter(
    (c) => c.category_group === "savings" || c.category_group === "investments"
  );
  const totalSavingsTarget = savingsInvestCategories.reduce(
    (s, c) => s + c.target,
    0
  );
  const savingsRate = (totalSavingsTarget / MONTHLY_INCOME) * 100;
  const savingsOnTrack = savingsRate >= SAVINGS_RATE_TARGET;

  // Group-level data for donut chart
  const groupData = useMemo(() => {
    return GROUP_ORDER.map((group) => {
      const cats = enrichedCategories.filter(
        (c) => c.category_group === group
      );
      const target = cats.reduce((s, c) => s + c.target, 0);
      const actual = cats.reduce((s, c) => s + c.actual, 0);
      return {
        name: GROUP_LABELS[group],
        group,
        target,
        actual,
        color: GROUP_COLORS[group],
      };
    }).filter((g) => g.target > 0);
  }, [enrichedCategories]);

  // Bar chart data: per category budget vs actual
  const barData = useMemo(() => {
    return enrichedCategories.map((c) => ({
      name: c.name.length > 14 ? c.name.slice(0, 12) + "..." : c.name,
      fullName: c.name,
      Budget: c.target,
      Actual: c.actual,
    }));
  }, [enrichedCategories]);

  // Unallocated income
  const unallocated = MONTHLY_INCOME - totalBudget;

  // Donut data for budget allocation
  const donutData = useMemo(() => {
    const data = groupData.map((g) => ({
      name: g.name,
      value: g.target,
      color: g.color,
    }));
    if (unallocated > 0) {
      data.push({
        name: "Unallocated",
        value: unallocated,
        color: "#E2E8F0",
      });
    }
    return data;
  }, [groupData, unallocated]);

  const overBudgetCount = enrichedCategories.filter((c) => c.overBudget).length;

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Monthly Budget</h1>
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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Monthly Budget</h1>
        <p className="text-muted-foreground text-sm mt-1">
          March 2026 &middot; Track spending against your plan
        </p>
      </div>

      {/* Top summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardTitle>Monthly Income</CardTitle>
          <p className="text-2xl font-bold text-teal mt-2">
            {formatCurrency(MONTHLY_INCOME)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Take-home pay
          </p>
        </Card>

        <Card>
          <CardTitle>Total Budgeted</CardTitle>
          <p className="text-2xl font-bold text-foreground mt-2">
            {formatCurrency(totalBudget)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(unallocated)} unallocated
          </p>
        </Card>

        <Card>
          <CardTitle>Spent So Far</CardTitle>
          <p className="text-2xl font-bold text-foreground mt-2">
            {formatCurrency(totalSpent)}
          </p>
          <ProgressBar
            value={(totalSpent / totalBudget) * 100}
            color={
              totalSpent > totalBudget ? "bg-coral" : "bg-navy"
            }
            className="mt-2"
            size="sm"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(totalRemaining)} remaining
          </p>
        </Card>

        <Card
          className={
            savingsOnTrack
              ? "border-teal/30 bg-teal/5"
              : "border-amber/30 bg-amber/5"
          }
        >
          <CardTitle>Savings Rate</CardTitle>
          <div className="flex items-center gap-2 mt-2">
            <PiggyBank
              className={`w-6 h-6 ${savingsOnTrack ? "text-teal" : "text-amber"}`}
            />
            <p
              className={`text-2xl font-bold ${savingsOnTrack ? "text-teal" : "text-amber"}`}
            >
              {formatPercent(savingsRate)}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Target: {SAVINGS_RATE_TARGET}%+
            {savingsOnTrack ? (
              <CheckCircle2 className="inline w-3.5 h-3.5 text-teal ml-1 -mt-0.5" />
            ) : (
              <AlertTriangle className="inline w-3.5 h-3.5 text-amber ml-1 -mt-0.5" />
            )}
          </p>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Donut — Budget Allocation */}
        <Card>
          <CardTitle>Budget Allocation</CardTitle>
          <div className="mt-4 h-72 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {donutData.map((entry, i) => (
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
          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
            {donutData.map((entry) => (
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
        </Card>

        {/* Stacked bar — Budget vs Actual */}
        <Card>
          <CardTitle>Budget vs Actual</CardTitle>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
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
                    v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                  }
                  tick={{ fontSize: 11 }}
                  stroke="var(--muted-fg)"
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
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
                <Legend />
                <Bar dataKey="Budget" fill="#2C5282" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Actual" fill="#1D9E75" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Category breakdown by group */}
      <div className="space-y-6">
        {GROUP_ORDER.map((group) => {
          const cats = enrichedCategories.filter(
            (c) => c.category_group === group
          );
          if (cats.length === 0) return null;
          const groupTarget = cats.reduce((s, c) => s + c.target, 0);
          const groupActual = cats.reduce((s, c) => s + c.actual, 0);

          return (
            <Card key={group}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: GROUP_COLORS[group] }}
                  />
                  <CardTitle className="mb-0">
                    {GROUP_LABELS[group]}
                  </CardTitle>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(groupActual)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {" "}
                    / {formatCurrency(groupTarget)}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {cats.map((cat, idx) => (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground">
                        {cat.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            cat.overBudget ? "text-coral" : "text-foreground"
                          }`}
                        >
                          {formatCurrency(cat.actual)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          / {formatCurrency(cat.target)}
                        </span>
                        {cat.overBudget && (
                          <AlertTriangle className="w-3.5 h-3.5 text-coral" />
                        )}
                        {cat.actual > 0 && !cat.overBudget && cat.pct >= 100 && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal" />
                        )}
                      </div>
                    </div>
                    <ProgressBar
                      value={cat.pct}
                      color={
                        cat.overBudget
                          ? "bg-coral"
                          : `bg-[${GROUP_COLORS[group]}]`
                      }
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Monthly cash flow summary */}
      <Card>
        <CardTitle>Cash Flow Summary</CardTitle>
        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal" />
              <span className="text-sm text-foreground">Income</span>
            </div>
            <span className="text-sm font-semibold text-teal">
              {formatCurrency(MONTHLY_INCOME)}
            </span>
          </div>

          {GROUP_ORDER.map((group) => {
            const cats = enrichedCategories.filter(
              (c) => c.category_group === group
            );
            if (cats.length === 0) return null;
            const groupTarget = cats.reduce((s, c) => s + c.target, 0);
            return (
              <div key={group} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: GROUP_COLORS[group] }}
                  />
                  <span className="text-sm text-foreground">
                    {GROUP_LABELS[group]}
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  -{formatCurrency(groupTarget)}
                </span>
              </div>
            );
          })}

          <div className="border-t border-border pt-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              {unallocated >= 0 ? (
                <Wallet className="w-4 h-4 text-teal" />
              ) : (
                <TrendingDown className="w-4 h-4 text-coral" />
              )}
              <span className="text-sm font-semibold text-foreground">
                {unallocated >= 0 ? "Unallocated" : "Over Budget"}
              </span>
            </div>
            <span
              className={`text-sm font-bold ${
                unallocated >= 0 ? "text-teal" : "text-coral"
              }`}
            >
              {formatCurrency(Math.abs(unallocated))}
            </span>
          </div>
        </div>
      </Card>

      {/* Over-budget alerts */}
      {overBudgetCount > 0 && (
        <div className="flex items-start gap-3 bg-coral/10 border border-coral/20 rounded-lg p-4">
          <AlertTriangle className="w-5 h-5 text-coral shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-coral">
              {overBudgetCount} categor{overBudgetCount === 1 ? "y" : "ies"}{" "}
              over budget
            </p>
            <p className="text-xs text-coral/80 mt-0.5">
              {enrichedCategories
                .filter((c) => c.overBudget)
                .map(
                  (c) =>
                    `${c.name} (+${formatCurrency(c.actual - c.target)})`
                )
                .join(", ")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
