"use client";

import * as React from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRoleBadge } from "./user-role-badge";
import { UserRole } from "@/types/user";

export function HeaderAuthSection() {
  const { data: session, status } = useSession();
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Loading skeleton
  if (status === "loading") {
    return (
      <div className="h-8 w-20 animate-pulse rounded border border-primary/20 bg-primary/5" />
    );
  }

  // Not authenticated — show login link
  if (!session) {
    return (
      <a
        href="/login"
        className="flex items-center gap-1.5 rounded border border-primary/30 bg-primary/5 px-3 py-1.5 font-mono text-xs tracking-widest text-primary transition-colors hover:border-primary/60 hover:bg-primary/10"
      >
        LOGIN
      </a>
    );
  }

  const user = session.user;
  const primaryRole = (user.roles?.[0] ?? "USER") as UserRole;
  const initials = (user.name ?? user.email ?? "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded border bg-primary/5 px-2 py-1.5 transition-colors",
          open
            ? "border-primary/60 bg-primary/10"
            : "border-primary/30 hover:border-primary/60 hover:bg-primary/10",
        )}
      >
        {/* Avatar */}
        <div className="relative h-6 w-6 overflow-hidden rounded border border-primary/30">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? "User"}
              fill
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-primary/10 font-mono text-[9px] font-bold text-primary">
              {initials}
            </span>
          )}
        </div>
        {/* Role badge */}
        <UserRoleBadge role={primaryRole} />
        {/* Caret */}
        <svg
          className={cn(
            "h-3 w-3 text-primary/60 transition-transform",
            open && "rotate-180",
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden border border-primary/30 bg-panel shadow-[0_0_30px_oklch(from_var(--primary)_l_c_h/0.15)]">
          {/* Corner brackets */}
          <div className="absolute -left-px -top-px h-3 w-3 border-l-2 border-t-2 border-primary" />
          <div className="absolute -right-px -top-px h-3 w-3 border-r-2 border-t-2 border-primary" />

          {/* User info */}
          <div className="border-b border-primary/20 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="relative h-8 w-8 overflow-hidden rounded border border-primary/30">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name ?? "User"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-primary/10 font-mono text-[9px] font-bold text-primary">
                    {initials}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-mono text-[11px] font-bold tracking-wider text-foreground">
                  {user.name ?? "USER"}
                </div>
                <div className="truncate font-mono text-[9px] text-foreground/50">
                  {user.email}
                </div>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {(user.roles ?? ["USER"]).map((role) => (
                <UserRoleBadge key={role} role={role as UserRole} />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="py-1">
            <button
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 font-mono text-xs tracking-wider text-foreground/70 transition-colors hover:bg-primary/5 hover:text-primary"
            >
              <LogOut className="h-3.5 w-3.5" />
              SIGN OUT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
