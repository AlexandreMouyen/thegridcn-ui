"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Zap, Shield, Network, Activity, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlowContainer } from "@/components/thegridcn/glow-container";
import { CircuitBackground } from "@/components/thegridcn/circuit-background";

export default function LoginPageClient() {
  const searchParams = useSearchParams();

  const getCallbackUrl = () => {
    const callbackUrl = searchParams.get("callbackUrl");
    if (callbackUrl && callbackUrl.startsWith("/")) return callbackUrl;
    return "/";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground lg:p-8">
      {/* Global outer frame — vertical divider "crosses" it */}
      <div className="relative flex min-h-[calc(100vh-2rem)] w-full overflow-hidden border border-primary/20 lg:min-h-[calc(100vh-4rem)]">

        {/* Global corner decorations */}
        <div className="pointer-events-none absolute left-0 top-0 z-20 h-8 w-8 border-l-2 border-t-2 border-primary/60" />
        <div className="pointer-events-none absolute right-0 top-0 z-20 h-8 w-8 border-r-2 border-t-2 border-primary/60" />
        <div className="pointer-events-none absolute bottom-0 left-0 z-20 h-8 w-8 border-b-2 border-l-2 border-primary/60" />
        <div className="pointer-events-none absolute bottom-0 right-0 z-20 h-8 w-8 border-b-2 border-r-2 border-primary/60" />
        {/* Top accent line */}
        <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Left Decorative Panel (hidden on mobile) */}
      <div className="relative hidden w-1/2 overflow-hidden border-r border-primary/20 lg:flex lg:flex-col lg:items-center lg:justify-center">
        <CircuitBackground
          animated
          opacity={0.08}
          className="absolute inset-0"
        />

        {/* Radial glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(var(--primary-rgb,0,180,255),0.08)_0%,transparent_70%)]" />

        {/* Grid pattern overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(var(--primary-rgb,0,180,255),0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--primary-rgb,0,180,255),0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Content */}
        <div className="relative z-10 flex max-w-md flex-col items-center px-12 text-center">
          {/* Logo */}
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 shadow-[0_0_40px_rgba(var(--primary-rgb,0,180,255),0.15)]">
            <Zap className="h-10 w-10 text-primary" />
          </div>

          {/* Brand */}
          <h1 className="font-[family-name:var(--font-orbitron)] text-3xl font-bold uppercase tracking-[0.2em] text-foreground">
            SC Timeline
          </h1>
          <div className="mx-auto mt-4 flex items-center gap-2">
            <div className="h-px w-8 bg-primary/60" />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary/80">
              Enter the Grid
            </span>
            <div className="h-px w-8 bg-primary/60" />
          </div>

          {/* Description */}
          <p className="mt-6 text-sm leading-relaxed text-foreground/50">
            Access the next generation of grid-based interfaces. Secure, fast,
            and built for the future.
          </p>

          {/* Feature list */}
          <div className="mt-10 space-y-4 text-left">
            {[
              {
                icon: <Shield className="h-4 w-4" />,
                label: "End-to-end encrypted access",
              },
              {
                icon: <Network className="h-4 w-4" />,
                label: "Connected to 48,291 nodes",
              },
              {
                icon: <Activity className="h-4 w-4" />,
                label: "99.97% system uptime",
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-primary/30 bg-primary/5 text-primary/70">
                  {item.icon}
                </div>
                <span className="font-mono text-xs tracking-wide text-foreground/60">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Decorative status bar */}
          <div className="mt-12 w-full rounded border border-primary/20 bg-primary/5 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-widest text-primary/50">
                System Status
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                <span className="font-mono text-[9px] uppercase tracking-widest text-green-500/80">
                  All Systems Operational
                </span>
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Right Side — Login Form */}
      <div className="relative flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        {/* Circuit background — mirrors left panel */}
        <CircuitBackground animated opacity={0.05} className="absolute inset-0" />

        {/* Radial glow centered on the form */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(var(--primary-rgb,0,180,255),0.06)_0%,transparent_65%)]" />

        {/* Subtle grid pattern */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(var(--primary-rgb,0,180,255),0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--primary-rgb,0,180,255),0.025)_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* Scanline effect */}
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.02)_2px,rgba(0,0,0,0.02)_4px)]" />

        <div className="relative z-10 w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 shadow-[0_0_24px_rgba(var(--primary-rgb,0,180,255),0.15)]">
              <Zap className="h-7 w-7 text-primary" />
            </div>
            <span className="font-[family-name:var(--font-orbitron)] text-lg font-bold uppercase tracking-[0.15em] text-foreground">
              SC Timeline
            </span>
          </div>

          {/* Login Card */}
          <GlowContainer
            intensity="sm"
            hover={false}
            className="relative overflow-hidden border-primary/20 bg-card/80 p-6 backdrop-blur-sm sm:p-8"
          >
            {/* Scanline inside card */}
            <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.015)_2px,rgba(0,0,0,0.015)_4px)]" />

            {/* Corner decorations */}
            <div className="pointer-events-none absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-primary/30" />
            <div className="pointer-events-none absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-primary/30" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-primary/30" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-primary/30" />

            {/* Header */}
            <div className="relative mb-6 text-center">
              <div className="mb-1 hidden items-center justify-center lg:flex">
                <div className="flex h-10 w-10 items-center justify-center rounded border border-primary/30 bg-primary/10">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
              </div>
              <h2 className="mt-3 font-[family-name:var(--font-orbitron)] text-xl font-bold uppercase tracking-wider text-foreground lg:mt-4">
                Sign In
              </h2>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-foreground/40">
                Access your Grid account
              </p>
            </div>

            {/* OAuth Providers */}
            <div className="relative flex flex-col gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() =>
                  signIn("github", { callbackUrl: getCallbackUrl() })
                }
                className="h-11 w-full justify-start gap-3 border-primary/20 bg-background/30 font-mono text-xs uppercase tracking-widest transition-all hover:border-primary/40 hover:bg-primary/5"
              >
                <svg
                  className="h-4 w-4 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Continue with GitHub
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() =>
                  signIn("discord", { callbackUrl: getCallbackUrl() })
                }
                className="h-11 w-full justify-start gap-3 border-primary/20 bg-background/30 font-mono text-xs uppercase tracking-widest transition-all hover:border-primary/40 hover:bg-primary/5"
              >
                <svg
                  className="h-4 w-4 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z" />
                </svg>
                Continue with Discord
              </Button>
            </div>
          </GlowContainer>

          {/* Bottom decorative text */}
          <div className="mt-6 text-center">
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-foreground/20">
              Gridcn Security Protocol v4.2 // Encrypted Connection
            </p>
          </div>
        </div>
      </div>

      </div>{/* /outer frame */}
    </div>
  );
}
