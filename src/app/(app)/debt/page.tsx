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
import { CreditCard, TrendingDown, DollarSign, Calendar, PartyPopper } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatCurrency, formatCurrencyExact } from "@/lib/utils";
import { useDebts } from "@/lib/hooks/use-data";
import { calculateAvalanchePayoff } from "@/lib/calculations";
import type { Debt } from "@/lib/types";

const CARD_COLORS = ["#E24B4A", "#EF9F27", "#2C5282", "#1D9E75"];

export default function DebtPage() {
  const { data: hookDebts, loading, update: updateDebt } = useDebts();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [monthlyExtra, setMonthlyExtra] = useState(1425); // $1800 total - $375 minimums

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
        <div>
          <h1 className="text-2xl font-bold text-foreground">Debt Payoff Tracker</h1>
          <p className="text-muted-foreground text-sm mt-1">Avalanche method — highest APR first</p>
        </div>
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
      </div>
    );
  }

  // Avalanche order for display
  const sortedDebts = [...debts].sort((a, b) => b.apr - a.apr);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Debt Payoff Tracker</h1>
        <p className="text-muted-foreground text-sm mt-1">Avalanche method — highest APR first</p>
      </div>

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
            const progress = paidOff ? 100 : 0; // Simplified — would track real progress
            return (
              <div key={debt.id} className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-hover shrink-0 text-sm font-bold text-muted-foreground">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{debt.card_name}</span>
                      {paidOff && <PartyPopper className="w-4 h-4 text-teal" />}
                    </div>
                    <span className="font-semibold text-foreground">{formatCurrency(debt.balance)}</span>
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
