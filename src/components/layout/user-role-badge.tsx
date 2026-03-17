"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types/user";

const roleConfig: Record<
  UserRole,
  { label: string; color: string; borderColor: string }
> = {
  VISITOR: {
    label: "VISITOR",
    color: "text-violet-400",
    borderColor: "border-violet-400/40",
  },
  USER: {
    label: "USER",
    color: "text-sky-400",
    borderColor: "border-sky-400/40",
  },
  MODERATOR: {
    label: "MOD",
    color: "text-amber-400",
    borderColor: "border-amber-400/40",
  },
  ADMIN: {
    label: "ADMIN",
    color: "text-red-400",
    borderColor: "border-red-400/40",
  },
};

interface UserRoleBadgeProps {
  role: UserRole;
  className?: string;
}

export function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  const config = roleConfig[role] ?? roleConfig.USER;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest",
        config.color,
        config.borderColor,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
