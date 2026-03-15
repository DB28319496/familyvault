"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  CreditCard,
  TrendingUp,
  Wallet,
  Baby,
  FolderLock,
  ListChecks,
  GraduationCap,
  ShieldCheck,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-provider";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/debt", label: "Debt Payoff", icon: CreditCard },
  { href: "/net-worth", label: "Net Worth", icon: TrendingUp },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/baby", label: "Baby Expenses", icon: Baby },
  { href: "/binder", label: "Emergency Binder", icon: FolderLock },
  { href: "/action-plan", label: "Action Plan", icon: ListChecks },
  { href: "/529", label: "529 Calculator", icon: GraduationCap },
  { href: "/insurance", label: "Insurance Gap", icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-navy text-white min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-white/10">
        <Shield className="w-7 h-7 text-teal" />
        <span className="text-lg font-bold">FamilyVault</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition",
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition w-full"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition w-full"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
