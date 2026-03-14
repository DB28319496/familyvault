"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Wallet, Landmark, BarChart3, PiggyBank } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatCurrency, cn } from "@/lib/utils";
import { useNetWorthSnapshots } from "@/lib/hooks/use-data";

const ASSET_COLORS: Record<string, string> = {
  cash: "#EF9F27",
  retirement: "#1D9E75",
  investments: "#2C5282",
  education: "#4F8FD6",
  other: "#9CA3AF",
};

const ASSET_LABELS: Record<string, string> = {
  cash: "Cash & Savings",
  retirement: "Retirement",
  investments: "Investments",
  education: "Education",
  other: "Other",
};

const ASSET_ICONS: Record<string, typeof Wallet> = {
  cash: PiggyBank,
  retirement: Landmark,
  investments: BarChart3,
  education: Wallet,
  other: Wallet,
};

function sumCategory(obj: Record<string, number>): number {
  return Object.values(obj).reduce((s, v) => s + v, 0);
}

export default function NetWorthPage() {
  const { data: snapshots, loading } = useNetWorthSnapshots();

  const latest = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
  const previous = snapshots.length > 1 ? snapshots[snapshots.length - 2] : null;
  const first = snapshots.length > 0 ? snapshots[0] : null;

  // Asset allocation for pie chart
  const assetBreakdown = useMemo(() => {
    if (!latest) return [];
    const categories = ["cash", "retirement", "investments", "education", "other"] as const;
    return categories
      .map((cat) => ({
        name: ASSET_LABELS[cat],
        value: sumCategory(latest.assets[cat]),
        color: ASSET_COLORS[cat],
        key: cat,
      }))
      .filter((c) => c.value > 0);
  }, [latest]);

  // Asset categories detail
  const assetDetails = useMemo(() => {
    if (!latest) return [];
    const categories = ["cash", "retirement", "investments", "education", "other"] as const;
    return categories
      .map((cat) => ({
        category: cat,
        label: ASSET_LABELS[cat],
        total: sumCategory(latest.assets[cat]),
        accounts: Object.entries(latest.assets[cat]).map(([key, value]) => ({
          name: key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          value,
        })),
      }))
      .filter((c) => c.total > 0);
  }, [latest]);

  // Liability categories detail
  const liabilityDetails = useMemo(() => {
    if (!latest) return [];
    const sections = ["credit_cards", "loans"] as const;
    return sections
      .map((section) => ({
        section,
        label: section
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        total: sumCategory(latest.liabilities[section]),
        items: Object.entries(latest.liabilities[section]).map(([key, value]) => ({
          name: key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
          value,
        })),
      }))
      .filter((s) => s.total > 0);
  }, [latest]);

  if (loading || !latest || !first) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Net Worth</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loading ? "Loading..." : "No snapshots recorded yet"}
          </p>
        </div>
        {loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <div className="h-20 animate-pulse bg-surface-hover rounded" />
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Line chart data
  const lineData = snapshots.map((s) => ({
    date: new Date(s.snapshot_date).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    net_worth: s.net_worth,
    assets: s.total_assets,
    liabilities: s.total_liabilities,
  }));

  // Month-over-month change
  const momChange = previous ? latest.net_worth - previous.net_worth : 0;
  const momPercent = previous && previous.net_worth !== 0 ? (momChange / previous.net_worth) * 100 : 0;

  // First-to-last change
  const totalChange = latest.net_worth - first.net_worth;
  const totalPercent = first.net_worth !== 0 ? (totalChange / first.net_worth) * 100 : 0;

  // Asset allocation percentages for bars
  const totalAssets = latest.total_assets;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Net Worth</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your wealth over time</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardTitle>Net Worth</CardTitle>
          <p className="text-2xl font-bold text-foreground mt-2">{formatCurrency(latest.net_worth)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            as of {new Date(latest.snapshot_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </Card>

        <Card>
          <CardTitle>Total Assets</CardTitle>
          <p className="text-2xl font-bold text-teal mt-2">{formatCurrency(latest.total_assets)}</p>
        </Card>

        <Card>
          <CardTitle>Total Liabilities</CardTitle>
          <p className="text-2xl font-bold text-coral mt-2">{formatCurrency(latest.total_liabilities)}</p>
        </Card>

        <Card>
          <CardTitle>Month-over-Month</CardTitle>
          <div className="flex items-center gap-1 mt-2">
            {momChange >= 0 ? (
              <TrendingUp className="w-5 h-5 text-teal" />
            ) : (
              <TrendingDown className="w-5 h-5 text-coral" />
            )}
            <p className={cn("text-2xl font-bold", momChange >= 0 ? "text-teal" : "text-coral")}>
              {momChange >= 0 ? "+" : ""}
              {formatCurrency(momChange)}
            </p>
          </div>
          <p className={cn("text-xs mt-1", momChange >= 0 ? "text-teal" : "text-coral")}>
            {momPercent >= 0 ? "+" : ""}
            {momPercent.toFixed(1)}% from last month
          </p>
        </Card>
      </div>

      {/* Total change banner */}
      <Card
        className="border-l-4"
        style={{ borderLeftColor: totalChange >= 0 ? "#1D9E75" : "#E24B4A" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Change since {new Date(first.snapshot_date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
            <p className={cn("text-xl font-bold mt-1", totalChange >= 0 ? "text-teal" : "text-coral")}>
              {totalChange >= 0 ? "+" : ""}
              {formatCurrency(totalChange)}
            </p>
          </div>
          <div className={cn("text-right", totalChange >= 0 ? "text-teal" : "text-coral")}>
            <p className="text-2xl font-bold">
              {totalPercent >= 0 ? "+" : ""}
              {totalPercent.toFixed(1)}%
            </p>
            <p className="text-xs">total growth</p>
          </div>
        </div>
      </Card>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Net Worth Line Chart */}
        <Card className="lg:col-span-2">
          <CardTitle>Net Worth Over Time</CardTitle>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-fg)" />
                <YAxis
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11 }}
                  stroke="var(--muted-fg)"
                />
                <Tooltip
                  formatter={(value, name) => [
                    formatCurrency(Number(value)),
                    name === "net_worth"
                      ? "Net Worth"
                      : name === "assets"
                      ? "Assets"
                      : "Liabilities",
                  ]}
                  contentStyle={{
                    backgroundColor: "var(--card-bg)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                />
                <Legend
                  formatter={(value) =>
                    value === "net_worth"
                      ? "Net Worth"
                      : value === "assets"
                      ? "Assets"
                      : "Liabilities"
                  }
                />
                <Line
                  type="monotone"
                  dataKey="net_worth"
                  stroke="#1A365D"
                  strokeWidth={3}
                  dot={{ fill: "#1A365D", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="assets"
                  stroke="#1D9E75"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="liabilities"
                  stroke="#E24B4A"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Asset Allocation Pie */}
        <Card>
          <CardTitle>Asset Allocation</CardTitle>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {assetBreakdown.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
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
          {/* Pie legend */}
          <div className="space-y-2 mt-2">
            {assetBreakdown.map((cat) => (
              <div key={cat.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs text-foreground">{cat.name}</span>
                </div>
                <span className="text-xs font-medium text-foreground">
                  {totalAssets > 0 ? Math.round((cat.value / totalAssets) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Asset & Liability Breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Assets */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Asset Breakdown</CardTitle>
            <span className="text-sm font-bold text-teal">{formatCurrency(latest.total_assets)}</span>
          </div>
          <div className="space-y-5">
            {assetDetails.map((cat) => {
              const Icon = ASSET_ICONS[cat.category];
              const pct = totalAssets > 0 ? (cat.total / totalAssets) * 100 : 0;
              return (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" style={{ color: ASSET_COLORS[cat.category] }} />
                      <span className="text-sm font-medium text-foreground">{cat.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{formatCurrency(cat.total)}</span>
                  </div>
                  <ProgressBar value={pct} size="sm" className="mb-1" />
                  <div className="pl-6 space-y-1">
                    {cat.accounts.map((acct) => (
                      <div key={acct.name} className="flex justify-between text-xs text-muted-foreground">
                        <span>{acct.name}</span>
                        <span>{formatCurrency(acct.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Liabilities */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Liability Breakdown</CardTitle>
            <span className="text-sm font-bold text-coral">{formatCurrency(latest.total_liabilities)}</span>
          </div>
          {liabilityDetails.length > 0 ? (
            <div className="space-y-5">
              {liabilityDetails.map((section) => (
                <div key={section.section}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{section.label}</span>
                    <span className="text-sm font-semibold text-coral">{formatCurrency(section.total)}</span>
                  </div>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <div key={item.name} className="flex justify-between text-xs text-muted-foreground pl-4">
                        <span>{item.name}</span>
                        <span>{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No liabilities recorded.</p>
          )}

          {/* Debt-to-asset ratio */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Debt-to-Asset Ratio</span>
              <span
                className={cn(
                  "text-sm font-bold",
                  latest.total_liabilities / latest.total_assets < 0.2
                    ? "text-teal"
                    : latest.total_liabilities / latest.total_assets < 0.4
                    ? "text-amber"
                    : "text-coral"
                )}
              >
                {((latest.total_liabilities / latest.total_assets) * 100).toFixed(1)}%
              </span>
            </div>
            <ProgressBar
              value={(latest.total_liabilities / latest.total_assets) * 100}
              color={
                latest.total_liabilities / latest.total_assets < 0.2
                  ? "bg-teal"
                  : latest.total_liabilities / latest.total_assets < 0.4
                  ? "bg-amber"
                  : "bg-coral"
              }
              size="sm"
            />
          </div>
        </Card>
      </div>

      {/* Snapshot History */}
      <Card>
        <CardTitle>Snapshot History</CardTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Date</th>
                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Assets</th>
                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Liabilities</th>
                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Net Worth</th>
                <th className="text-right py-2 pl-4 font-medium text-muted-foreground">Change</th>
              </tr>
            </thead>
            <tbody>
              {[...snapshots].reverse().map((s, idx) => {
                const prevIdx = snapshots.length - 1 - idx - 1;
                const prev = prevIdx >= 0 ? snapshots[prevIdx] : null;
                const change = prev ? s.net_worth - prev.net_worth : 0;
                return (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4 text-foreground">
                      {new Date(s.snapshot_date).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 text-right text-teal font-medium">
                      {formatCurrency(s.total_assets)}
                    </td>
                    <td className="py-3 px-4 text-right text-coral font-medium">
                      {formatCurrency(s.total_liabilities)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-foreground">
                      {formatCurrency(s.net_worth)}
                    </td>
                    <td className="py-3 pl-4 text-right">
                      {prev ? (
                        <span className={cn("font-medium", change >= 0 ? "text-teal" : "text-coral")}>
                          {change >= 0 ? "+" : ""}
                          {formatCurrency(change)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
