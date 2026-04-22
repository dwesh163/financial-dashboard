"use client";

import "@aejkatappaja/phantom-ui";
import "@aejkatappaja/phantom-ui/ssr.css";

const phantomProps = { loading: true, animation: "pulse" as const, "fallback-radius": 4 };

export default function SettingsLoading() {
  return (
    <div className="max-w-lg flex flex-col gap-6">
      <phantom-ui {...phantomProps}>
        <div className="mb-2 space-y-2">
          <div className="h-2 w-16 rounded" />
          <div className="h-7 w-32 rounded" />
        </div>
      </phantom-ui>

      <phantom-ui {...phantomProps}>
        <div className="flex items-center gap-4 p-4 rounded-2xl border border-border">
          <div className="w-14 h-14 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-36 rounded" />
            <div className="h-2 w-16 rounded" />
          </div>
        </div>
      </phantom-ui>

      <div className="space-y-3">
        <phantom-ui {...phantomProps}>
          <div className="h-2 w-12 rounded mx-1" />
        </phantom-ui>
        <phantom-ui {...phantomProps}>
          <div className="rounded-2xl border border-border px-4 py-3.5 flex items-center justify-between">
            <div className="h-3 w-24 rounded" />
            <div className="h-7 w-28 rounded" />
          </div>
        </phantom-ui>
        <phantom-ui {...phantomProps}>
          <div className="rounded-2xl border border-border px-4 py-3.5 flex items-center gap-3">
            <div className="w-4 h-4 rounded" />
            <div className="h-3 w-28 rounded" />
          </div>
        </phantom-ui>
      </div>

      <div className="space-y-3">
        <phantom-ui {...phantomProps}>
          <div className="h-2 w-14 rounded mx-1" />
        </phantom-ui>
        <phantom-ui {...phantomProps}>
          <div className="rounded-2xl border border-border px-4 py-4 flex items-center gap-3">
            <div className="w-4 h-4 rounded" />
            <div className="space-y-1.5">
              <div className="h-3 w-28 rounded" />
              <div className="h-2 w-20 rounded" />
            </div>
          </div>
        </phantom-ui>
      </div>
    </div>
  );
}
