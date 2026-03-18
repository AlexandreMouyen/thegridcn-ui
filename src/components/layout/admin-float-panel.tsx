"use client";

import { useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import type { ComponentProps } from "react";
import { useSession } from "next-auth/react";
import { Clock, Shield, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { USER_ROLES } from "@/types/user";

const ADMIN_NAV = [
  {
    label: "Timeline",
    items: [
      {
        href: "/admin/timeline/eras",
        label: "Eras",
        icon: <Clock className="h-3.5 w-3.5" />,
        matchPrefix: "/admin/timeline",
      },
    ],
  },
];

export function AdminFloatPanel() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (status === "loading" || !session) return null;

  const isAdmin = (session.user.roles ?? []).some((r) =>
    ([USER_ROLES.ADMIN, USER_ROLES.MODERATOR] as string[]).includes(r),
  );
  if (!isAdmin) return null;

  return (
    <>
      {/* Backdrop — closes panel on click outside */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed top-1/2 left-0 z-50 -translate-y-1/2 flex items-stretch transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Sidebar content */}
        <div className="relative w-48 border border-primary/30 bg-background/95 backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          {/* Corner brackets */}
          <span className="absolute -top-px -left-px h-4 w-4 border-t-2 border-l-2 border-primary/70" />
          <span className="absolute -top-px -right-px h-4 w-4 border-t-2 border-r-2 border-primary/70" />
          <span className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-primary/70" />
          <span className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-primary/70" />

          {/* Top accent */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-primary/60 via-primary/20 to-transparent" />

          {/* Header */}
          <div className="px-4 py-3 border-b border-border/25 flex items-center gap-2">
            <Shield className="h-3 w-3 text-primary/60 shrink-0" />
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-foreground/50">
              Admin Panel
            </span>
          </div>

          {/* Nav */}
          <nav className="px-3 py-3 space-y-3">
            {ADMIN_NAV.map((group) => (
              <div key={group.label}>
                <p className="px-2 mb-1.5 font-mono text-[8px] uppercase tracking-[0.2em] text-foreground/30">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = item.matchPrefix
                      ? pathname.startsWith(item.matchPrefix)
                      : pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href as ComponentProps<typeof Link>["href"]}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "group relative flex items-center gap-2.5 rounded-sm px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition-all duration-200",
                          isActive
                            ? "border border-primary/35 bg-primary/10 text-primary"
                            : "border border-transparent text-foreground/45 hover:border-border/30 hover:bg-foreground/5 hover:text-foreground/75",
                        )}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-px bg-primary shadow-[0_0_6px_var(--primary)]" />
                        )}
                        <span
                          className={cn(
                            isActive
                              ? "text-primary"
                              : "text-foreground/35 group-hover:text-foreground/60",
                          )}
                        >
                          {item.icon}
                        </span>
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Bottom accent */}
          <div className="px-4 py-2 border-t border-border/20">
            <div className="h-px w-full bg-gradient-to-r from-primary/20 to-transparent" />
          </div>
        </div>

        {/* Toggle handle — always visible */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          aria-label={open ? "Close admin panel" : "Open admin panel"}
          className={cn(
            "self-center flex items-center justify-center h-12 w-6 border border-l-0 border-primary/40 bg-background/90 backdrop-blur-sm text-primary/60 hover:text-primary hover:bg-primary/10 transition-colors",
            open ? "rounded-r-sm" : "translate-x-full rounded-r-sm",
          )}
        >
          {open ? (
            <ChevronLeft className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </>
  );
}
