"use client";

import { TrendingUp } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="dark min-h-screen flex bg-background">
      <div className="w-full max-w-105 shrink-0 flex flex-col justify-between bg-card border-r border-border px-10 py-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground tracking-tight">JCM - Finances</span>
        </div>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-foreground tracking-tight leading-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-2">Sign in to your account to continue</p>
          </div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-10 flex items-center justify-center gap-3 rounded-lg bg-white text-gray-800 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {!loading && (
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
            )}
            {loading ? "Signing in…" : "Continue with Google"}
          </button>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">secure sign-in</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            By signing in, you agree to our{" "}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 JCM - Finances. All rights reserved.</p>
      </div>

      <div className="hidden lg:flex flex-1 flex-col justify-between px-16 py-12">
        <div className="max-w-md">
          <h2 className="text-3xl font-semibold text-foreground tracking-tight leading-snug">
            Your finances,
            <br />
            <span className="text-primary">fully in control.</span>
          </h2>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            Track your assets, monitor your spending, and get a clear picture of your financial health.
          </p>
        </div>
      </div>
    </div>
  );
}
