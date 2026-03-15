"use client";

import { useState, useMemo } from "react";
import { ShieldCheck, AlertTriangle, DollarSign, Users, Info, Calculator } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatCurrency, cn } from "@/lib/utils";

export default function InsurancePage() {
  // Input state
  const [annualSalary, setAnnualSalary] = useState(75000);
  const [yearsUntilChildIndependent, setYearsUntilChildIndependent] = useState(22);
  const [numberOfChildren, setNumberOfChildren] = useState(1);
  const [monthlyExpenses, setMonthlyExpenses] = useState(10000);

  // Current coverage
  const [teslaEmployerMultiplier] = useState(2);
  const teslaEmployerCoverage = annualSalary * teslaEmployerMultiplier;
  const [supplementalCoverage, setSupplementalCoverage] = useState(0);
  const [spouseCoverage, setSpouseCoverage] = useState(0);
  const totalCurrentCoverage = teslaEmployerCoverage + supplementalCoverage + spouseCoverage;

  // Calculate recommended coverage
  const recommended = useMemo(() => {
    const incomeReplacement = annualSalary * yearsUntilChildIndependent;
    const debtPayoff = 15000;
    const collegePerChild = 250000;
    const collegeFunding = collegePerChild * numberOfChildren;
    const emergencyFund = monthlyExpenses * 12;
    const funeralCosts = 20000;
    const totalRecommended =
      incomeReplacement + debtPayoff + collegeFunding + emergencyFund + funeralCosts;

    return {
      incomeReplacement,
      debtPayoff,
      collegeFunding,
      emergencyFund,
      funeralCosts,
      total: totalRecommended,
    };
  }, [annualSalary, yearsUntilChildIndependent, numberOfChildren, monthlyExpenses]);

  const gap = recommended.total - totalCurrentCoverage;
  const coveragePercent = Math.min((totalCurrentCoverage / recommended.total) * 100, 100);

  // Breakdown components for the visual
  const breakdownItems = [
    {
      label: "Income Replacement",
      amount: recommended.incomeReplacement,
      description: `${yearsUntilChildIndependent} years x ${formatCurrency(annualSalary)}/yr`,
      color: "#344E6A",
    },
    {
      label: "College Funding",
      amount: recommended.collegeFunding,
      description: `${numberOfChildren} child${numberOfChildren > 1 ? "ren" : ""} x ${formatCurrency(250000)}`,
      color: "#456282",
    },
    {
      label: "Emergency Fund",
      amount: recommended.emergencyFund,
      description: `12 months x ${formatCurrency(monthlyExpenses)}/mo`,
      color: "#3B7D62",
    },
    {
      label: "Debt Payoff",
      amount: recommended.debtPayoff,
      description: "Credit card balances",
      color: "#B8922E",
    },
    {
      label: "Final Expenses",
      amount: recommended.funeralCosts,
      description: "Funeral, burial, and related costs",
      color: "#B85450",
    },
  ];

  // Coverage sources
  const coverageSources = [
    {
      label: "Tesla Employer (2x Salary)",
      amount: teslaEmployerCoverage,
      note: "Not portable if you leave Tesla",
      editable: false,
    },
    {
      label: "Supplemental Term Life",
      amount: supplementalCoverage,
      note: supplementalCoverage === 0 ? "None — get quotes!" : null,
      editable: true,
      setter: setSupplementalCoverage,
    },
    {
      label: "Spouse Coverage",
      amount: spouseCoverage,
      note: spouseCoverage === 0 ? "None — consider $500K-1M" : null,
      editable: true,
      setter: setSpouseCoverage,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Insurance Gap Analyzer</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Make sure your family is fully protected if something happens
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardTitle>Recommended</CardTitle>
          <p className="text-2xl font-bold text-navy mt-2">{formatCurrency(recommended.total)}</p>
          <p className="text-xs text-muted-foreground mt-1">total coverage needed</p>
        </Card>
        <Card>
          <CardTitle>Current Coverage</CardTitle>
          <p className="text-2xl font-bold text-foreground mt-2">{formatCurrency(totalCurrentCoverage)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {coveragePercent.toFixed(0)}% of recommended
          </p>
        </Card>
        <Card>
          <CardTitle>Coverage Gap</CardTitle>
          <p className={cn("text-2xl font-bold mt-2", gap > 0 ? "text-coral" : "text-teal")}>
            {gap > 0 ? formatCurrency(gap) : "Fully Covered"}
          </p>
          {gap > 0 && <p className="text-xs text-coral mt-1">action needed</p>}
        </Card>
        <Card>
          <CardTitle>Est. Monthly Premium</CardTitle>
          <p className="text-2xl font-bold text-foreground mt-2">$50 - $120</p>
          <p className="text-xs text-muted-foreground mt-1">20-year term, healthy adult</p>
        </Card>
      </div>

      {/* Gap Visual Bar */}
      <Card>
        <CardTitle>Coverage Gap Visualization</CardTitle>
        <div className="mt-4">
          {/* Bar showing current vs recommended */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-foreground">Current</span>
              <span className="text-sm text-muted-foreground">{formatCurrency(totalCurrentCoverage)}</span>
            </div>
            <div className="w-full bg-surface-hover rounded-full h-8 overflow-hidden relative">
              <div
                className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{
                  width: `${coveragePercent}%`,
                  backgroundColor: coveragePercent >= 80 ? "#3B7D62" : coveragePercent >= 50 ? "#B8922E" : "#B85450",
                  minWidth: totalCurrentCoverage > 0 ? "60px" : "0px",
                }}
              >
                <span className="text-xs font-bold text-white">{coveragePercent.toFixed(0)}%</span>
              </div>
              {gap > 0 && (
                <div
                  className="absolute top-0 right-0 h-full flex items-center justify-center"
                  style={{ width: `${100 - coveragePercent}%` }}
                >
                  <span className="text-xs font-medium text-coral">
                    Gap: {formatCurrency(gap)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm font-medium text-foreground">Recommended</span>
              <span className="text-sm text-muted-foreground">{formatCurrency(recommended.total)}</span>
            </div>
          </div>

          {/* Current coverage breakdown */}
          <div className="mt-6 space-y-3">
            {coverageSources.map((source) => (
              <div
                key={source.label}
                className="flex items-center justify-between p-3 bg-surface-hover rounded-lg"
              >
                <div>
                  <span className="text-sm font-medium text-foreground">{source.label}</span>
                  {source.note && (
                    <p className="text-xs text-coral mt-0.5">{source.note}</p>
                  )}
                </div>
                {source.editable && source.setter ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">$</span>
                    <input
                      type="number"
                      value={source.amount}
                      onChange={(e) => source.setter(Number(e.target.value) || 0)}
                      className="w-32 text-right text-sm font-semibold bg-card border border-border rounded-lg px-3 py-1.5 text-foreground"
                      step={50000}
                      min={0}
                    />
                  </div>
                ) : (
                  <span className="text-sm font-semibold text-foreground">{formatCurrency(source.amount)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Input controls + Breakdown side by side */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Fields */}
        <Card>
          <CardTitle>Your Information</CardTitle>
          <div className="space-y-5 mt-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Annual Salary</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">$</span>
                <input
                  type="number"
                  value={annualSalary}
                  onChange={(e) => setAnnualSalary(Number(e.target.value) || 0)}
                  className="w-full text-sm bg-card border border-border rounded-lg px-3 py-2 text-foreground"
                  step={5000}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                Years Until Youngest Child is 22
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={yearsUntilChildIndependent}
                  onChange={(e) => setYearsUntilChildIndependent(Number(e.target.value))}
                  className="flex-1 accent-navy h-2 rounded-full"
                />
                <span className="text-sm font-bold text-navy w-16 text-right">
                  {yearsUntilChildIndependent} yrs
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Number of Children</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={numberOfChildren}
                  onChange={(e) => setNumberOfChildren(Number(e.target.value))}
                  className="flex-1 accent-navy h-2 rounded-full"
                />
                <span className="text-sm font-bold text-navy w-16 text-right">
                  {numberOfChildren}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Monthly Household Expenses</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">$</span>
                <input
                  type="number"
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(Number(e.target.value) || 0)}
                  className="w-full text-sm bg-card border border-border rounded-lg px-3 py-2 text-foreground"
                  step={500}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Recommended Breakdown */}
        <Card>
          <CardTitle>Recommended Coverage Breakdown</CardTitle>
          <div className="space-y-4 mt-4">
            {breakdownItems.map((item) => {
              const pct = recommended.total > 0 ? (item.amount / recommended.total) * 100 : 0;
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="pl-5">
                    <ProgressBar value={pct} size="sm" />
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                </div>
              );
            })}

            <div className="border-t border-border pt-3 flex justify-between">
              <span className="text-sm font-bold text-foreground">Total Recommended</span>
              <span className="text-sm font-bold text-navy">{formatCurrency(recommended.total)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Gap Alert or Success */}
      {gap > 0 ? (
        <Card className="border-l-4 border-l-coral">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-coral shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-coral">
                Coverage Gap: {formatCurrency(gap)}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your family would be underinsured by {formatCurrency(gap)} if something were to happen today.
                A 20-year level term life policy for this amount would cost approximately{" "}
                <strong className="text-foreground">$50 - $120/month</strong> for a healthy adult in their late 20s to early 30s.
              </p>
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-foreground">Recommended next steps:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-coral font-bold">1.</span>
                    Get quotes from Ladder, Haven Life, or Policygenius
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-coral font-bold">2.</span>
                    Target a 20-year level term policy (covers until child is independent)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-coral font-bold">3.</span>
                    Get both spouses covered — don&apos;t forget stay-at-home parent value
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-coral font-bold">4.</span>
                    Lock in rates while young and healthy — premiums increase with age
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="border-l-4 border-l-teal">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-teal shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-teal">Fully Covered</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your current coverage meets or exceeds the recommended amount. Review annually as your
                income and family situation changes.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Premium Estimate */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-navy" />
          <CardTitle>Estimated Monthly Premium Ranges</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          For a healthy non-smoker, 20-year level term life insurance
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Coverage Amount</th>
                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Age 25-30</th>
                <th className="text-right py-2 px-4 font-medium text-muted-foreground">Age 30-35</th>
                <th className="text-right py-2 pl-4 font-medium text-muted-foreground">Age 35-40</th>
              </tr>
            </thead>
            <tbody>
              {[
                { amount: 500000, young: "$20-30", mid: "$25-40", older: "$35-55" },
                { amount: 1000000, young: "$35-50", mid: "$45-70", older: "$65-100" },
                { amount: 1500000, young: "$50-75", mid: "$65-95", older: "$90-140" },
                { amount: 2000000, young: "$60-90", mid: "$80-120", older: "$110-170" },
                { amount: 2500000, young: "$75-110", mid: "$95-145", older: "$130-200" },
              ].map((row) => (
                <tr key={row.amount} className="border-b border-border last:border-0">
                  <td className="py-3 pr-4 font-medium text-foreground">{formatCurrency(row.amount)}</td>
                  <td className="py-3 px-4 text-right text-muted-foreground">{row.young}/mo</td>
                  <td className="py-3 px-4 text-right text-muted-foreground">{row.mid}/mo</td>
                  <td className="py-3 pl-4 text-right text-muted-foreground">{row.older}/mo</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-3 italic">
          Premiums vary by health, lifestyle, and specific insurer. Get actual quotes for accurate pricing.
        </p>
      </Card>

      {/* Important notes */}
      <Card className="border-l-4 border-l-navy">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-navy shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Important Considerations</h3>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1.5">
              <li>
                <strong>Employer coverage is not portable</strong> — Tesla&apos;s 2x salary benefit disappears if you leave. Own your own policy.
              </li>
              <li>
                <strong>Don&apos;t skip the spouse</strong> — Even if one spouse doesn&apos;t work, childcare, household management, and emotional support have real financial value.
              </li>
              <li>
                <strong>Get covered before baby arrives</strong> — Pregnancy can complicate or delay underwriting.
              </li>
              <li>
                <strong>Term vs. Whole Life</strong> — For most young families, term life is the best value. Invest the premium savings separately.
              </li>
              <li>
                <strong>Review annually</strong> — As income grows and debts shrink, your coverage needs will change.
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
