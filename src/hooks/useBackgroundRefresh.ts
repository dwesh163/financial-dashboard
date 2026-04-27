"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { RefreshType } from "@/types/cache";

type RefreshStatus = "idle" | "checking" | "refreshing";

type UseBackgroundRefreshParams = {
  type: RefreshType;
  slug?: string;
};

type UseBackgroundRefreshResult = {
  isChecking: boolean;
  isRefreshing: boolean;
};

export const useBackgroundRefresh = ({ type, slug }: UseBackgroundRefreshParams): UseBackgroundRefreshResult => {
  const router = useRouter();
  const [status, setStatus] = useState<RefreshStatus>("idle");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const url = new URL("/api/refresh", window.location.origin);
    url.searchParams.set("type", type);
    if (slug) url.searchParams.set("slug", slug);

    const es = new EventSource(url.toString());
    setStatus("checking");

    es.addEventListener("no-change", () => {
      setStatus("idle");
      es.close();
    });

    es.addEventListener("changed", () => {
      es.close();
      setStatus("refreshing");
      startTransition(() => router.refresh());
    });

    es.addEventListener("error", () => {
      setStatus("idle");
      es.close();
    });

    return () => {
      es.close();
    };
  }, [type, slug, router]);

  useEffect(() => {
    if (!isPending && status === "refreshing") setStatus("idle");
  }, [isPending, status]);

  return {
    isChecking: status === "checking",
    isRefreshing: status === "refreshing",
  };
};
