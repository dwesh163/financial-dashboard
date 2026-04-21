"use client";

import "@aejkatappaja/phantom-ui";
import "@aejkatappaja/phantom-ui/ssr.css";

const phantomProps = { loading: true, animation: "pulse" as const };

export default function EventsLoading() {
  return (
    <div className="space-y-6">
      <phantom-ui {...phantomProps}>
        <div className="pb-4 border-b border-border">
          <div className="space-y-2">
            <div className="h-2 w-10 rounded" />
            <div className="h-10 w-48 rounded" />
            <div className="h-3 w-24 rounded" />
          </div>
        </div>
      </phantom-ui>

      <phantom-ui {...phantomProps}>
        <div className="border border-border">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-4">
                <div className="h-2 w-4 rounded" />
                <div className="h-3.5 rounded" style={{ width: `${120 + ((i * 31) % 100)}px` }} />
              </div>
              <div className="h-4 w-4 rounded" />
            </div>
          ))}
        </div>
      </phantom-ui>
    </div>
  );
}
