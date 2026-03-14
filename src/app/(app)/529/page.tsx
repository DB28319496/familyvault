"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { GraduationCap, TrendingUp, DollarSign, Info, Calculator } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatCurrency, cn } from "@/lib/utils";

// 2024 average costs, inflated to 2044 at ~5% college inflation
const COLLEGE_COSTS_2044 = {
  in_state_public: 112000,
  out_of_state_public: 184000,
  private: 260000,
};

export default function FiveTwentyNinePage() {
  const [monthlyContribution, setMonthlyContribution] = useState(250);
  const [initialDeposit, setInitialDeposit] = useState(0);
  const [expectedReturn, setExpectedReturn] = useState(7);
  const [years, setYears] = useState(18);

  // Calculate projected balance year by year
  const projections = useMemo(() => {
    const monthlyRate = expectedReturn / 100 / 12;
    const data: { year: number; contributions: number; growth: number; total: number }[] = [];

    let balance = initialDeposit;
    let totalContributions = initialDeposit;

    for (let year = 1; year <= years; year++) {
      for (let month = 0; month < 12; month++) {
        balance = balance * (1 + monthlyRate) + monthlyContribution;
        totalContributions += monthlyContribution;
      }
      const growth = balance - totalContributions;
      data.push({
        year,
        contributions: Math.round(totalContributions),
        growth: Math.round(growth),
        total: Math.round(balance),
      });
    }

    return data;
  }, [monthlyContribution, initialDeposit, expectedReturn, years]);

  const finalProjection = projections[projections.length - 1];
  const projectedBalance = finalProjection?.total ?? 0;
  const totalContributions = finalProjection?.contributions ?? 0;
  const totalGrowth = finalProjection?.growth ?? 0;

  // Coverage percentages
  const coverageInState = Math.min((projectedBalance / COLLEGE_COSTS_2044.in_state_public) * 100, 100);
  const coverageOutState = Math.min((projectedBalance / COLLEGE_COSTS_2044.out_of_state_public) * 100, 100);
  const coveragePrivate = Math.min((projectedBalance / COLLEGE_COSTS_2044.private) * 100, 100);

  // Chart data (show every year or every other for readability)
  const chartData = projections.filter((_, i) => years <= 15 || i % 2 === 0 || i === projections.length - 1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">529 College Savings Calculator</h1>
        <p className="text-muted-foreground text-sm mt-1">Plan for your child&apos;s education with tax-advantaged growth</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardTitle>Projected Balance</CardTitle>
          <p className="text-2xl font-bold text-navy mt-2">{formatCurrency(projectedBalance)}</p>
          <p className="text-xs text-muted-foreground mt-1">after {years} years</p>
        </Card>
        <Card>
          <CardTitle>Total Contributions</CardTitle>
          <p className="text-2xl font-bold text-navy-light mt-2">{formatCurrency(totalContributions)}</p>
          <p className="text-xs text-muted-foreground mt-1">your money in</p>
        </Card>
        <Card>
          <CardTitle>Investment Growth</CardTitle>
          <p className="text-2xl font-bold text-teal mt-2">{formatCurrency(totalGrowth)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {totalContributions > 0 ? `${((totalGrowth / totalContributions) * 100).toFixed(0)}%` : "0%"} return on contributions
          </p>
        </Card>
        <Card>
          <CardTitle>Monthly Investment</CardTitle>
          <p className="text-2xl font-bold text-foreground mt-2">{formatCurrency(monthlyContribution)}/mo</p>
          <p className="text-xs text-muted-foreground mt-1">{formatCurrency(monthlyContribution * 12)}/year</p>
        </Card>
      </div>

      {/* Input Controls */}
      <Card>
        <CardTitle>Calculator Inputs</CardTitle>
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {/* Monthly Contribution */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-foreground font-medium">Monthly Contribution</label>
              <span className="text-sm font-bold text-navy">{formatCurrency(monthlyContribution)}</span>
            </div>
            <input
              type="range"
              min={50}
              max={1500}
              step={25}
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full accent-navy h-2 rounded-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>$50</span>
              <span>$1,500</span>
            </div>
          </div>

          {/* Initial Deposit */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-foreground font-medium">Initial Deposit</label>
              <span className="text-sm font-bold text-navy">{formatCurrency(initialDeposit)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={25000}
              step={500}
              value={initialDeposit}
              onChange={(e) => setInitialDeposit(Number(e.target.value))}
              className="w-full accent-navy h-2 rounded-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>$0</span>
              <span>$25,000</span>
            </div>
          </div>

          {/* Expected Return */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-foreground font-medium">Expected Annual Return</label>
              <span className="text-sm font-bold text-navy">{expectedReturn}%</span>
            </div>
            <input
              type="range"
              min={3}
              max={12}
              step={0.5}
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
              className="w-full accent-navy h-2 rounded-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>3%</span>
              <span>12%</span>
            </div>
          </div>

          {/* Years */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-foreground font-medium">Years Until College</label>
              <span className="text-sm font-bold text-navy">{years} years</span>
            </div>
            <input
              type="range"
              min={5}
              max={25}
              step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-navy h-2 rounded-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>5 years</span>
              <span>25 years</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Growth Chart */}
      <Card>
        <CardTitle>Year-by-Year Growth</CardTitle>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 11 }}
                stroke="var(--muted-fg)"
                tickFormatter={(v) => `Yr ${v}`}
              />
              <YAxis
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11 }}
                stroke="var(--muted-fg)"
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  backgroundColor: "var(--card-bg)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
              />
              <Legend
                formatter={(value) =>
                  value === "contributions" ? "Your Contributions" : "Investment Growth"
                }
              />
              <Bar dataKey="contributions" stackId="a" fill="#2C5282" radius={[0, 0, 0, 0]} />
              <Bar dataKey="growth" stackId="a" fill="#1D9E75" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* College Cost Comparison */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="w-5 h-5 text-navy" />
          <CardTitle>College Cost Comparison (Estimated 2044)</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Projected 4-year costs based on current averages with ~5% annual college inflation
        </p>

        <div className="space-y-5">
          {/* In-State Public */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="text-sm font-medium text-foreground">In-State Public University</span>
                <span className="text-xs text-muted-foreground ml-2">
                  (e.g., SDSU, Cal Poly)
                </span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {formatCurrency(COLLEGE_COSTS_2044.in_state_public)}
              </span>
            </div>
            <ProgressBar
              value={coverageInState}
              color={coverageInState >= 100 ? "bg-teal" : coverageInState >= 60 ? "bg-amber" : "bg-coral"}
              size="md"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                {formatCurrency(projectedBalance)} saved
              </span>
              <span
                className={cn(
                  "text-xs font-bold",
                  coverageInState >= 100 ? "text-teal" : coverageInState >= 60 ? "text-amber" : "text-coral"
                )}
              >
                {Math.round(coverageInState)}% covered
              </span>
            </div>
          </div>

          {/* Out-of-State Public */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="text-sm font-medium text-foreground">Out-of-State Public University</span>
                <span className="text-xs text-muted-foreground ml-2">
                  (e.g., U of Oregon, ASU)
                </span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {formatCurrency(COLLEGE_COSTS_2044.out_of_state_public)}
              </span>
            </div>
            <ProgressBar
              value={coverageOutState}
              color={coverageOutState >= 100 ? "bg-teal" : coverageOutState >= 60 ? "bg-amber" : "bg-coral"}
              size="md"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                {formatCurrency(projectedBalance)} saved
              </span>
              <span
                className={cn(
                  "text-xs font-bold",
                  coverageOutState >= 100 ? "text-teal" : coverageOutState >= 60 ? "text-amber" : "text-coral"
                )}
              >
                {Math.round(coverageOutState)}% covered
              </span>
            </div>
          </div>

          {/* Private */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="text-sm font-medium text-foreground">Private University</span>
                <span className="text-xs text-muted-foreground ml-2">
                  (e.g., USC, Stanford)
                </span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {formatCurrency(COLLEGE_COSTS_2044.private)}
              </span>
            </div>
            <ProgressBar
              value={coveragePrivate}
              color={coveragePrivate >= 100 ? "bg-teal" : coveragePrivate >= 60 ? "bg-amber" : "bg-coral"}
              size="md"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                {formatCurrency(projectedBalance)} saved
              </span>
              <span
                className={cn(
                  "text-xs font-bold",
                  coveragePrivate >= 100 ? "text-teal" : coveragePrivate >= 60 ? "text-amber" : "text-coral"
                )}
              >
                {Math.round(coveragePrivate)}% covered
              </span>
            </div>
          </div>
        </div>

        {/* Shortfall/surplus */}
        {projectedBalance < COLLEGE_COSTS_2044.in_state_public && (
          <div className="mt-4 p-3 bg-amber/10 border border-amber/20 rounded-lg">
            <p className="text-sm text-amber font-medium">
              Shortfall for in-state public: {formatCurrency(COLLEGE_COSTS_2044.in_state_public - projectedBalance)}
            </p>
            <p className="text-xs text-amber/80 mt-1">
              Consider increasing to{" "}
              {formatCurrency(
                Math.ceil(
                  (COLLEGE_COSTS_2044.in_state_public /
                    (projectedBalance / monthlyContribution || 1)) /
                    12
                ) * 12 / 12
              )}{" "}
              /mo to fully cover in-state costs, or apply for scholarships and financial aid.
            </p>
          </div>
        )}
      </Card>

      {/* ScholarShare Info */}
      <Card className="border-l-4 border-l-navy">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-navy shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">California ScholarShare 529</h3>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-navy font-bold">1.</span>
                <span>
                  <strong>Tax-free growth</strong> — No federal or California state tax on qualified education withdrawals
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-navy font-bold">2.</span>
                <span>
                  <strong>Low fees</strong> — Managed by TIAA-CREF with expense ratios from 0.07% to 0.37%
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-navy font-bold">3.</span>
                <span>
                  <strong>Age-based portfolios</strong> — Automatically shift from aggressive to conservative as college approaches
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-navy font-bold">4.</span>
                <span>
                  <strong>Flexible use</strong> — Can be used for tuition, room & board, books, supplies, and K-12 ($10K/yr limit)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-navy font-bold">5.</span>
                <span>
                  <strong>Rollover to Roth IRA</strong> — Starting 2024, unused 529 funds can be rolled into a beneficiary Roth IRA (up to $35K lifetime, subject to annual limits)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-navy font-bold">6.</span>
                <span>
                  <strong>Gift tax benefits</strong> — Contribute up to $18K/year ($36K married) without gift tax, or superfund 5 years at once
                </span>
              </li>
            </ul>
            <p className="text-xs text-muted-foreground mt-3 italic">
              Open an account at ScholarShare529.com — no minimum to start.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
