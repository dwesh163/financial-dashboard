"use client";

import "@aejkatappaja/phantom-ui";
import "@aejkatappaja/phantom-ui/ssr.css";

const phantomProps = { loading: true, animation: "pulse" as const };

export default function EventLoading() {
  return (
    <div className="space-y-6">
      <phantom-ui {...phantomProps}>
        <div className="pb-4 border-b border-border">
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="h-2 w-16 rounded" />
              <div className="h-10 w-56 rounded" />
              <div className="h-3 w-28 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-32 rounded" />
              <div className="h-8 w-8 rounded" />
            </div>
          </div>
        </div>
      </phantom-ui>

      <phantom-ui {...phantomProps}>
        <div className="border border-border">
          <div className="md:hidden divide-y divide-border">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3.5 bg-card">
                <div className="h-2 w-16 rounded" />
                <div className="h-5 w-20 rounded" />
              </div>
            ))}
          </div>
          <div className="hidden md:grid md:grid-cols-3 gap-px bg-border">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-card px-5 py-5 space-y-3">
                <div className="h-2 w-16 rounded" />
                <div className="h-7 w-28 rounded" />
              </div>
            ))}
          </div>
        </div>
      </phantom-ui>

      {/* Mobile transaction list */}
      <phantom-ui {...phantomProps} class="md:hidden block">
        <div className="border border-border">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-stretch border-b border-border last:border-0">
              <div className="w-0.5 bg-border shrink-0" />
              <div className="flex items-center gap-3 flex-1 px-4 py-3.5">
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 rounded" style={{ width: `${100 + ((i * 27) % 120)}px` }} />
                  <div className="h-2.5 w-32 rounded" />
                </div>
                <div className="h-4 w-16 rounded" />
              </div>
            </div>
          ))}
        </div>
      </phantom-ui>

      {/* Desktop transaction table */}
      <phantom-ui {...phantomProps} class="hidden md:block">
        <div className="border border-border">
          <div className="grid grid-cols-[48px_100px_1fr_1fr_1fr_140px_130px_50px_64px] gap-3 px-5 py-2.5 bg-muted/30 border-b border-border">
            {[48, 80, 0, 0, 0, 100, 80, 40, 40].map((w, i) => (
              <div key={i} className="h-2 rounded" style={{ width: w > 0 ? `${w}%` : "70%" }} />
            ))}
          </div>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-[48px_100px_1fr_1fr_1fr_140px_130px_50px_64px] gap-3 items-center px-5 py-3 border-b border-border last:border-0"
            >
              <div className="h-3 w-8 rounded" />
              <div className="h-3 w-20 rounded" />
              <div className="h-3 rounded" style={{ width: `${50 + ((i * 23) % 40)}%` }} />
              <div className="h-3 rounded" style={{ width: `${40 + ((i * 17) % 40)}%` }} />
              <div className="h-3 rounded" style={{ width: `${35 + ((i * 13) % 45)}%` }} />
              <div className="h-3 w-24 rounded" />
              <div className="h-4 w-20 rounded ml-auto" />
              <div className="h-3 w-8 rounded mx-auto" />
              <div className="h-3 w-8 rounded" />
            </div>
          ))}
        </div>
      </phantom-ui>
    </div>
  );
}
