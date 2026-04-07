"use client";

import { CalendarDays, LayoutDashboard, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Aperçu", icon: LayoutDashboard },
  { href: "/events", label: "Événements", icon: CalendarDays },
  { href: "/contacts", label: "Contacts", icon: Users },
];

export const MobileNav = () => {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-card/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[9px] uppercase tracking-[0.15em] font-semibold">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
