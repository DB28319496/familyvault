"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderLock,
  ListChecks,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/binder", label: "Binder", icon: FolderLock },
  { href: "/action-plan", label: "Plan", icon: ListChecks },
  { href: "/insurance", label: "Insurance", icon: ShieldCheck },
  { href: "/guide", label: "Guide", icon: BookOpen },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
      <div className="flex items-center justify-around pt-2 px-1">
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
