"use client";

import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  Shield,
  Wallet,
  Baby,
  FolderLock,
  ListChecks,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatCurrency, getPhaseColor, getPhaseLabel } from "@/lib/utils";
import {
  useDebts,
  useNetWorthSnapshots,
  useActionItems,
  useLegalDocuments,
  useInsurancePolicies,
} from "@/lib/hooks/use-data";
import {
  calculateAvalanchePayoff,
  calculateFinancialHealthScore,
  getCurrentPhase,
} from "@/lib/calculations";

export default function DashboardPage() {
  const { data: debts, loading: debtsLoading } = useDebts();
  const { data: snapshots, loading: snapshotsLoading } = useNetWorthSnapshots();
  const { data: actionItems, loading: actionsLoading } = useActionItems();
  const { data: legalDocs, loading: docsLoading } = useLegalDocuments();
  const { data: insurancePolicies, loading: insuranceLoading } = useInsurancePolicies();

  const isLoading = debtsLoading || snapshotsLoading || actionsLoading || docsLoading || insuranceLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Your family&apos;s financial overview</p>
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
        <div className="grid lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-surface-hover rounded w-40" />
                <div className="h-3 bg-surface-hover rounded w-full" />
                <div className="h-3 bg-surface-hover rounded w-3/4" />
                <div className="h-3 bg-surface-hover rounded w-full" />
                <div className="h-3 bg-surface-hover rounded w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const latestSnapshot = snapshots[snapshots.length - 1];
  const prevSnapshot = snapshots[snapshots.length - 2];

  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
  const monthlyExtra = 1800 - debts.reduce((s, d) => s + d.min_payment, 0);
  const avalanche = calculateAvalanchePayoff(debts, Math.max(0, monthlyExtra));

  const emergencyFund = 10000;
  const emergencyFundTarget = 60000;
  const efPercent = (emergencyFund / emergencyFundTarget) * 100;

  const monthlyIncome = 10000;
  const monthlySavings = 750 + 1167; // EF + Roths (simplified)
  const savingsRate = monthlySavings / monthlyIncome;

  const netWorthChange = latestSnapshot && prevSnapshot
    ? latestSnapshot.net_worth - prevSnapshot.net_worth
    : 0;

  const completedDocs = legalDocs.filter((d) => d.status === "complete").length;
  const estateCompletion = completedDocs / legalDocs.length;

  const hasSupplementalLife = insurancePolicies.some(
    (p) => p.policy_type.includes("Supplemental") && p.carrier
  );

  const currentPhase = getCurrentPhase({
    hasLifeInsurance: hasSupplementalLife,
    hasPasswordManager: true,
    hasEstateDocuments: estateCompletion > 0.5,
    debtBalance: totalDebt,
    emergencyFund,
    emergencyFundTarget,
  });

  const healthScore = calculateFinancialHealthScore({
    debtRatio: totalDebt / 150000,
    savingsRate,
    emergencyFundRatio: emergencyFund / emergencyFundTarget,
    insuranceCoverage: 150000 / 2750000,
    estatePlanComplete: estateCompletion,
  });

  const completedActions = actionItems.filter((a) => a.status === "complete").length;
  const totalActions = actionItems.length;

  const quickLinks = [
    { href: "/debt", label: "Debt Tracker", icon: CreditCard, color: "text-coral" },
    { href: "/net-worth", label: "Net Worth", icon: TrendingUp, color: "text-teal" },
    { href: "/budget", label: "Budget", icon: Wallet, color: "text-amber" },
    { href: "/baby", label: "Baby Expenses", icon: Baby, color: "text-navy-light" },
    { href: "/binder", label: "Emergency Binder", icon: FolderLock, color: "text-navy" },
    { href: "/action-plan", label: "Action Plan", icon: ListChecks, color: "text-teal" },
    { href: "/529", label: "529 Calculator", icon: GraduationCap, color: "text-navy-light" },
    { href: "/insurance", label: "Insurance Gap", icon: ShieldCheck, color: "text-coral" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Your family&apos;s financial overview</p>
      </div>

      {/* Phase indicator */}
      <Card className="border-l-4" style={{ borderLeftColor: getPhaseColor(currentPhase) }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: getPhaseColor(currentPhase) }}>
              Phase {currentPhase}
            </p>
            <p className="text-lg font-bold text-foreground">{getPhaseLabel(currentPhase)}</p>
          </div>
          <Link href="/action-plan" className="text-sm text-navy hover:underline flex items-center gap-1">
            View Plan <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Card>

      {/* Top metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Worth */}
        <Card>
          <CardTitle>Net Worth</CardTitle>
          <p className="text-2xl font-bold text-foreground mt-2">
            {formatCurrency(latestSnapshot?.net_worth ?? 0)}
          </p>
          <div className="flex items-center gap-1 mt-1">
            {netWorthChange >= 0 ? (
              <TrendingUp className="w-4 h-4 text-teal" />
            ) : (
              <TrendingDown className="w-4 h-4 text-coral" />
            )}
            <span className={`text-sm font-medium ${netWorthChange >= 0 ? "text-teal" : "text-coral"}`}>
              {netWorthChange >= 0 ? "+" : ""}{formatCurrency(netWorthChange)}
            </span>
            <span className="text-xs text-muted-foreground">this month</span>
          </div>
        </Card>

        {/* Debt */}
        <Card>
          <CardTitle>Total Debt</CardTitle>
          <p className="text-2xl font-bold text-coral mt-2">{formatCurrency(totalDebt)}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Free by {avalanche.debtFreeDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </p>
        </Card>

        {/* Emergency Fund */}
        <Card>
          <CardTitle>Emergency Fund</CardTitle>
          <p className="text-2xl font-bold text-foreground mt-2">{formatCurrency(emergencyFund)}</p>
          <ProgressBar value={efPercent} color="bg-amber" className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round(efPercent)}% of {formatCurrency(emergencyFundTarget)}
          </p>
        </Card>

        {/* Health Score */}
        <Card>
          <CardTitle>Health Score</CardTitle>
          <p className={`text-2xl font-bold mt-2 ${healthScore >= 60 ? "text-teal" : healthScore >= 40 ? "text-amber" : "text-coral"}`}>
            {healthScore}/100
          </p>
          <ProgressBar
            value={healthScore}
            color={healthScore >= 60 ? "bg-teal" : healthScore >= 40 ? "bg-amber" : "bg-coral"}
            className="mt-2"
          />
        </Card>
      </div>

      {/* Alerts */}
      <div className="space-y-3">
        {!hasSupplementalLife && (
          <div className="flex items-start gap-3 bg-coral/10 border border-coral/20 rounded-lg p-4">
            <AlertTriangle className="w-5 h-5 text-coral shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-coral">Life Insurance Gap: {formatCurrency(2600000)}</p>
              <p className="text-xs text-coral/80 mt-0.5">
                Current coverage: {formatCurrency(150000)} (Tesla employer only). Recommended: ~{formatCurrency(2750000)}.
              </p>
              <Link href="/insurance" className="text-xs text-coral font-medium hover:underline mt-1 inline-block">
                View Insurance Analysis →
              </Link>
            </div>
          </div>
        )}

        {estateCompletion < 0.5 && (
          <div className="flex items-start gap-3 bg-amber/10 border border-amber/20 rounded-lg p-4">
            <AlertTriangle className="w-5 h-5 text-amber shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber">Estate Plan Incomplete</p>
              <p className="text-xs text-amber/80 mt-0.5">
                {completedDocs}/{legalDocs.length} documents complete. Will, trust, and POA still needed.
              </p>
              <Link href="/binder" className="text-xs text-amber font-medium hover:underline mt-1 inline-block">
                Open Emergency Binder →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Cash Flow Summary + Action Items */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cash Flow */}
        <Card>
          <CardTitle>Monthly Cash Flow</CardTitle>
          <div className="space-y-3 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground">Take-home Income</span>
              <span className="text-sm font-semibold text-teal">{formatCurrency(monthlyIncome)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground">Fixed Expenses</span>
              <span className="text-sm font-semibold text-foreground">-{formatCurrency(5610)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground">Debt Payoff</span>
              <span className="text-sm font-semibold text-coral">-{formatCurrency(1800)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground">Savings & Investing</span>
              <span className="text-sm font-semibold text-teal">-{formatCurrency(1917)}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between items-center">
              <span className="text-sm font-semibold text-foreground">Remaining</span>
              <span className="text-sm font-bold text-foreground">{formatCurrency(673)}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">Savings Rate:</span>
              <span className="text-xs font-bold text-teal">{(savingsRate * 100).toFixed(1)}%</span>
            </div>
          </div>
        </Card>

        {/* Upcoming Action Items */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Next Steps</CardTitle>
            <Link href="/action-plan" className="text-xs text-navy hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {actionItems
              .filter((a) => a.status !== "complete")
              .slice(0, 5)
              .map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div
                    className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                    style={{ backgroundColor: getPhaseColor(item.phase) }}
                  />
                  <div>
                    <p className="text-sm text-foreground">{item.title}</p>
                    {item.target_date && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Target: {new Date(item.target_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal" />
              <span className="text-xs text-muted-foreground">
                {completedActions}/{totalActions} actions complete
              </span>
            </div>
            <ProgressBar
              value={(completedActions / totalActions) * 100}
              color="bg-teal"
              size="sm"
              className="mt-2"
            />
          </div>
        </Card>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:bg-surface-hover transition group"
            >
              <link.icon className={`w-5 h-5 ${link.color}`} />
              <span className="text-sm font-medium text-foreground group-hover:text-navy transition">
                {link.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
