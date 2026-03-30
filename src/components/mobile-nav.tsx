"use client";

import { CalendarDays, LayoutDashboard, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Aperçu", icon: LayoutDashboard },
  { href: "/events", label: "Événements", icon: CalendarDays },
  { href: "/contacts", label: "Contacts", icon: Users },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div
      className="fixed left-3 right-3 z-50 md:hidden"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
    >
      <nav className="bg-card/90 backdrop-blur-xl border border-border rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
        <div className="flex items-stretch px-2 py-1.5 gap-1">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex-1 flex flex-col items-center justify-center py-2 gap-1 rounded-xl transition-all ${
                  active ? "text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {active && <span className="absolute inset-0 bg-primary rounded-xl" />}
                <Icon className="w-[18px] h-[18px] relative z-10" strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[10px] font-semibold relative z-10 tracking-wide">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
