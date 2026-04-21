"use client";

import "@aejkatappaja/phantom-ui";
import "@aejkatappaja/phantom-ui/ssr.css";

const phantomProps = { loading: true, animation: "pulse" as const };

export default function SummaryLoading() {
  return (
    <div>
      {/* Mobile */}
      <div className="md:hidden space-y-6">
        <phantom-ui {...phantomProps}>
          <div className="flex items-start justify-between pt-1 border-b border-border pb-5">
            <div className="space-y-2">
              <div className="h-2 w-20 rounded" />
              <div className="h-10 w-40 rounded" />
              <div className="h-3 w-24 rounded" />
            </div>
            <div className="w-9 h-9 rounded-full" />
          </div>
        </phantom-ui>

        <phantom-ui {...phantomProps}>
          <div className="grid grid-cols-3 gap-px bg-border border border-border">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-card px-3 py-4 space-y-2">
                <div className="h-2 w-14 rounded" />
                <div className="h-4 w-20 rounded" />
              </div>
            ))}
          </div>
        </phantom-ui>

        <div className="space-y-2">
          <phantom-ui {...phantomProps}>
            <div className="h-2 w-20 rounded mb-3" />
          </phantom-ui>
          <phantom-ui {...phantomProps}>
            <div className="border border-border">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3.5 border-b border-border last:border-0"
                >
                  <div className="space-y-1.5">
                    <div className="h-3.5 rounded" style={{ width: `${100 + ((i * 23) % 80)}px` }} />
                    <div className="h-2.5 w-20 rounded" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-16 rounded" />
                    <div className="h-3 w-3 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </phantom-ui>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block space-y-6">
        <phantom-ui {...phantomProps}>
          <div className="flex items-end justify-between pb-5 border-b border-border">
            <div className="space-y-2">
              <div className="h-2 w-24 rounded" />
              <div className="h-14 w-32 rounded" />
            </div>
            <div className="text-right space-y-1.5">
              <div className="h-2 w-32 rounded ml-auto" />
              <div className="h-4 w-24 rounded ml-auto" />
            </div>
          </div>
        </phantom-ui>

        <phantom-ui {...phantomProps}>
          <div className="grid grid-cols-4 gap-px bg-border border border-border">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-card px-5 py-5 space-y-3">
                <div className="h-2 w-20 rounded" />
                <div className="h-7 w-28 rounded" />
              </div>
            ))}
          </div>
        </phantom-ui>

        <phantom-ui {...phantomProps}>
          <div className="border border-border">
            <div className="grid grid-cols-6 gap-3 px-5 py-2.5 bg-muted/30 border-b border-border">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-2 w-12 rounded" />
              ))}
            </div>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-6 gap-3 items-center px-5 py-3.5 border-b border-border last:border-0"
              >
                <div className="h-3 rounded" style={{ width: `${60 + ((i * 19) % 60)}px` }} />
                <div className="h-3 w-16 rounded" />
                <div className="h-3 w-14 rounded" />
                <div className="h-3 w-16 rounded" />
                <div className="h-3 w-14 rounded" />
                <div className="h-3 w-20 rounded ml-auto" />
              </div>
            ))}
          </div>
        </phantom-ui>
      </div>
    </div>
  );
}
