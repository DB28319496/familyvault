import Link from "next/link";
import { Shield, TrendingUp, Baby, FileText, Target, ArrowRight } from "lucide-react";
import { DemoButton } from "@/components/demo-button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-navy text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-teal" />
          <span className="text-xl font-bold">FamilyVault</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 text-sm font-medium bg-teal text-white rounded-lg hover:bg-teal-light transition"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-20 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
          Protect What Matters.
          <br />
          <span className="text-teal">Build Your Legacy.</span>
        </h1>
        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10">
          Your family&apos;s single source of truth for financial health, estate planning,
          and legacy management. Track debt payoff, build your emergency binder,
          and plan for every milestone.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-teal text-white font-semibold rounded-xl hover:bg-teal-light transition text-lg"
          >
            Start Protecting Your Family
            <ArrowRight className="w-5 h-5" />
          </Link>
          <DemoButton className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition text-lg border border-white/20" />
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: TrendingUp,
              title: "Debt Payoff & Net Worth",
              desc: "Track every dollar. Avalanche method visualization, projected debt-free date, and net worth growth over time.",
            },
            {
              icon: FileText,
              title: "Digital Emergency Binder",
              desc: "Contacts, legal documents, financial accounts, insurance policies — everything your family needs, organized and secure.",
            },
            {
              icon: Target,
              title: "Action Plan Timeline",
              desc: "Phase-by-phase financial roadmap from debt elimination to wealth building, with progress tracking at every step.",
            },
            {
              icon: Shield,
              title: "Insurance Gap Analysis",
              desc: "Know exactly how much coverage you need. Calculate gaps and get recommendations for your family's situation.",
            },
            {
              icon: Baby,
              title: "Baby Expense Tracker",
              desc: "Dedicated tracking for all baby-related costs. Categories, trends, and comparison to national averages.",
            },
            {
              icon: TrendingUp,
              title: "529 College Calculator",
              desc: "Project your college savings growth with tax-free compound interest. See coverage across university tiers.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition"
            >
              <feature.icon className="w-10 h-10 text-teal mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-white/40 text-sm border-t border-white/10">
        <p>&copy; 2026 FamilyVault. Your data stays private and encrypted.</p>
      </footer>
    </div>
  );
}
