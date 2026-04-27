"use client";

import { Fragment } from "react";
import { RefreshIndicator } from "@/components/refresh/indicator";
import { RefreshOverlay } from "@/components/refresh/overlay";
import { useBackgroundRefresh } from "@/hooks/useBackgroundRefresh";
import type { RefreshType } from "@/types/cache";

type Props = {
  type: RefreshType;
  slug?: string;
};

export const RefreshWatcher = ({ type, slug }: Props) => {
  const { isChecking, isRefreshing } = useBackgroundRefresh({ type, slug });
  return (
    <Fragment>
      <RefreshIndicator visible={isChecking && !isRefreshing} />
      <RefreshOverlay visible={isRefreshing} />
    </Fragment>
  );
};
