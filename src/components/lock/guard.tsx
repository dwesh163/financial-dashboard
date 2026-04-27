"use client";

import { usePathname, useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";

export const LockGuard = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const check = useCallback(async () => {
    try {
      const res = await fetch("/api/lock-status");
      const { locked } = (await res.json()) as { locked: boolean };
      if (locked) router.replace(`/lock?callbackUrl=${encodeURIComponent(pathnameRef.current)}`);
      else setReady(true);
    } catch {
      setReady(true);
    }
  }, [router]);

  useEffect(() => {
    check();
  }, [check]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      setReady(false);
      check();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [check]);

  if (!ready) return <div className="dark min-h-screen bg-background" />;
  return <Fragment>{children}</Fragment>;
};
