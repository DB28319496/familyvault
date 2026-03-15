import Link from "next/link";
import {
  Shield,
  FolderLock,
  FileText,
  ListChecks,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-sidebar text-white">
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
          Your family&apos;s single source of truth for estate planning,
          insurance coverage, and emergency preparedness. Everything your
          loved ones need, organized and secure.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-8 py-4 bg-teal text-white font-semibold rounded-xl hover:bg-teal-light transition text-lg"
        >
          Start Protecting Your Family
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: FolderLock,
              title: "Digital Emergency Binder",
              desc: "Contacts, legal documents, financial accounts, insurance policies, bills, and digital access — everything organized in one place.",
            },
            {
              icon: ListChecks,
              title: "Action Plan",
              desc: "A step-by-step roadmap for protecting your family. Track progress through each phase, from estate documents to long-term planning.",
            },
            {
              icon: ShieldCheck,
              title: "Insurance Gap Analysis",
              desc: "Know exactly how much coverage your family needs. Identify gaps and get clear recommendations.",
            },
            {
              icon: GraduationCap,
              title: "529 College Calculator",
              desc: "Project your college savings growth with tax-free compound interest. See coverage across university tiers.",
            },
            {
              icon: FileText,
              title: "Letter of Intent",
              desc: "Write a personal letter with your wishes, values, and guidance for your family. The most important document you\u2019ll ever create.",
            },
            {
              icon: Shield,
              title: "Shared Household Access",
              desc: "Both spouses see the same data. Invite your partner so either of you can find what you need, when you need it.",
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
