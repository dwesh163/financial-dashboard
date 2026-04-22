"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { INACTIVITY_THRESHOLD_MS } from "@/constants/pin";

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"] as const;
const CHECK_INTERVAL_MS = 10_000;

export const LockWatcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const lastActivity = useRef(Date.now());

  useEffect(() => {
    const onActivity = () => {
      lastActivity.current = Date.now();
    };

    for (const event of ACTIVITY_EVENTS) window.addEventListener(event, onActivity, { passive: true });

    const interval = setInterval(() => {
      if (Date.now() - lastActivity.current > INACTIVITY_THRESHOLD_MS)
        router.push(`/lock?callbackUrl=${encodeURIComponent(pathname)}`);
    }, CHECK_INTERVAL_MS);

    return () => {
      for (const event of ACTIVITY_EVENTS) window.removeEventListener(event, onActivity);
      clearInterval(interval);
    };
  }, [router, pathname]);

  return null;
};
