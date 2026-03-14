"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Wallet,
  FolderLock,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/debt", label: "Debt", icon: CreditCard },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/binder", label: "Binder", icon: FolderLock },
  { href: "/action-plan", label: "Plan", icon: ListChecks },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around py-2 px-1 safe-area-pb">
        {mobileNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition min-w-[56px]",
                isActive
                  ? "text-navy"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "text-navy")} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
