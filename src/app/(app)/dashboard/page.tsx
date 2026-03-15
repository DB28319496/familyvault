"use client";

import Link from "next/link";
import {
  Shield,
  FolderLock,
  ListChecks,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Users,
  KeyRound,
  Receipt,
  BookOpen,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatCurrency, getPhaseColor, getPhaseLabel } from "@/lib/utils";
import {
  useActionItems,
  useLegalDocuments,
  useInsurancePolicies,
  useContacts,
  useFinancialAccounts,
  useMonthlyBills,
  useDigitalAccess,
} from "@/lib/hooks/use-data";

export default function DashboardPage() {
  const { data: actionItems, loading: actionsLoading } = useActionItems();
  const { data: legalDocs, loading: docsLoading } = useLegalDocuments();
  const { data: insurancePolicies, loading: insuranceLoading } = useInsurancePolicies();
  const { data: contacts, loading: contactsLoading } = useContacts();
  const { data: accounts, loading: accountsLoading } = useFinancialAccounts();
  const { data: bills, loading: billsLoading } = useMonthlyBills();
  const { data: digitalAccess, loading: digitalLoading } = useDigitalAccess();

  const isLoading = actionsLoading || docsLoading || insuranceLoading || contactsLoading || accountsLoading || billsLoading || digitalLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Your family&apos;s protection at a glance</p>
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
      </div>
    );
  }

  // Binder completion metrics
  const completedDocs = legalDocs.filter((d) => d.status === "complete").length;
  const totalDocs = legalDocs.length;
  const docsPercent = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0;

  const filledContacts = contacts.filter((c) => c.name && c.name.trim() !== "").length;
  const totalContacts = contacts.length;

  const totalAccounts = accounts.length;
  const totalBills = bills.length;
  const digitalItems = digitalAccess.length;

  // Insurance coverage
  const lifeCoverage = insurancePolicies
    .filter((p) => p.policy_type.toLowerCase().includes("life"))
    .reduce((s, p) => s + (p.coverage_amount ?? 0), 0);
  const recommendedCoverage = 2750000;
  const coveragePercent = Math.min(100, Math.round((lifeCoverage / recommendedCoverage) * 100));
  const hasAdequateInsurance = coveragePercent >= 80;

  // Action plan progress
  const completedActions = actionItems.filter((a) => a.status === "complete").length;
  const totalActions = actionItems.length;
  const actionsPercent = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  // Overall readiness score (weighted)
  const readinessScore = Math.round(
    (docsPercent * 0.3) +
    (coveragePercent * 0.3) +
    ((filledContacts / Math.max(totalContacts, 1)) * 100 * 0.2) +
    (actionsPercent * 0.2)
  );

  const quickLinks = [
    { href: "/binder", label: "Emergency Binder", icon: FolderLock, color: "text-navy" },
    { href: "/action-plan", label: "Action Plan", icon: ListChecks, color: "text-teal" },
    { href: "/529", label: "529 Calculator", icon: GraduationCap, color: "text-navy-light" },
    { href: "/insurance", label: "Insurance Gap", icon: ShieldCheck, color: "text-coral" },
    { href: "/guide", label: "How It Works", icon: BookOpen, color: "text-amber" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Your family&apos;s protection at a glance</p>
      </div>

      {/* Readiness Score */}
      <Card className="border-l-4" style={{ borderLeftColor: readinessScore >= 70 ? "#1D9E75" : readinessScore >= 40 ? "#EF9F27" : "#E24B4A" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Family Protection Readiness
            </p>
            <div className="flex items-center gap-3 mt-1">
              <Shield className={`w-8 h-8 ${readinessScore >= 70 ? "text-teal" : readinessScore >= 40 ? "text-amber" : "text-coral"}`} />
              <p className={`text-3xl font-bold ${readinessScore >= 70 ? "text-teal" : readinessScore >= 40 ? "text-amber" : "text-coral"}`}>
                {readinessScore}%
              </p>
            </div>
          </div>
          <Link href="/action-plan" className="text-sm text-navy hover:underline flex items-center gap-1">
            View Plan <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <ProgressBar
          value={readinessScore}
          color={readinessScore >= 70 ? "bg-teal" : readinessScore >= 40 ? "bg-amber" : "bg-coral"}
          className="mt-3"
          size="lg"
        />
      </Card>

      {/* Top metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardTitle>Legal Documents</CardTitle>
          <p className="text-2xl font-bold text-foreground mt-2">{completedDocs}/{totalDocs}</p>
          <ProgressBar value={docsPercent} color={docsPercent >= 80 ? "bg-teal" : "bg-amber"} className="mt-2" size="sm" />
          <p className="text-xs text-muted-foreground mt-1">
            {docsPercent >= 100 ? "All complete" : `${docsPercent}% complete`}
          </p>
        </Card>

        <Card>
          <CardTitle>Insurance Coverage</CardTitle>
          <p className={`text-2xl font-bold mt-2 ${hasAdequateInsurance ? "text-teal" : "text-coral"}`}>
            {coveragePercent}%
          </p>
          <ProgressBar value={coveragePercent} color={hasAdequateInsurance ? "bg-teal" : "bg-coral"} className="mt-2" size="sm" />
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(lifeCoverage)} of {formatCurrency(recommendedCoverage)}
          </p>
        </Card>

        <Card>
          <CardTitle>Emergency Contacts</CardTitle>
          <p className="text-2xl font-bold text-foreground mt-2">{filledContacts}/{totalContacts}</p>
          <ProgressBar
            value={totalContacts > 0 ? (filledContacts / totalContacts) * 100 : 0}
            color="bg-navy"
            className="mt-2"
            size="sm"
          />
          <p className="text-xs text-muted-foreground mt-1">contacts filled in</p>
        </Card>

        <Card>
          <CardTitle>Action Plan</CardTitle>
          <p className="text-2xl font-bold text-foreground mt-2">{completedActions}/{totalActions}</p>
          <ProgressBar value={actionsPercent} color="bg-teal" className="mt-2" size="sm" />
          <p className="text-xs text-muted-foreground mt-1">{actionsPercent}% complete</p>
        </Card>
      </div>

      {/* Alerts */}
      <div className="space-y-3">
        {!hasAdequateInsurance && (
          <div className="flex items-start gap-3 bg-coral/10 border border-coral/20 rounded-lg p-4">
            <AlertTriangle className="w-5 h-5 text-coral shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-coral">
                Life Insurance Gap: {formatCurrency(recommendedCoverage - lifeCoverage)}
              </p>
              <p className="text-xs text-coral/80 mt-0.5">
                Current: {formatCurrency(lifeCoverage)}. Recommended: {formatCurrency(recommendedCoverage)}.
              </p>
              <Link href="/insurance" className="text-xs text-coral font-medium hover:underline mt-1 inline-block">
                View Insurance Analysis →
              </Link>
            </div>
          </div>
        )}

        {docsPercent < 50 && (
          <div className="flex items-start gap-3 bg-amber/10 border border-amber/20 rounded-lg p-4">
            <AlertTriangle className="w-5 h-5 text-amber shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber">Estate Plan Incomplete</p>
              <p className="text-xs text-amber/80 mt-0.5">
                {completedDocs}/{totalDocs} documents complete. Will, trust, and POA still needed.
              </p>
              <Link href="/binder" className="text-xs text-amber font-medium hover:underline mt-1 inline-block">
                Open Emergency Binder →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Binder Summary + Next Steps */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Binder Summary */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Emergency Binder Status</CardTitle>
            <Link href="/binder" className="text-xs text-navy hover:underline">
              Open Binder
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Contacts</span>
              </div>
              <span className="text-sm font-medium text-foreground">{filledContacts} filled</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Legal Documents</span>
              </div>
              <span className={`text-sm font-medium ${docsPercent >= 80 ? "text-teal" : "text-amber"}`}>
                {completedDocs}/{totalDocs} complete
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Insurance Policies</span>
              </div>
              <span className="text-sm font-medium text-foreground">{insurancePolicies.length} tracked</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Monthly Bills</span>
              </div>
              <span className="text-sm font-medium text-foreground">{totalBills} tracked</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Digital Access</span>
              </div>
              <span className="text-sm font-medium text-foreground">{digitalItems} items</span>
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
            {actionItems.filter((a) => a.status !== "complete").length === 0 && (
              <div className="flex items-center gap-2 py-4 text-teal">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">All tasks complete!</span>
              </div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal" />
              <span className="text-xs text-muted-foreground">
                {completedActions}/{totalActions} actions complete
              </span>
            </div>
            <ProgressBar
              value={actionsPercent}
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
