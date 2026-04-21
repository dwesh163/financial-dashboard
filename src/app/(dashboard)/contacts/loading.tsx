"use client";

import "@aejkatappaja/phantom-ui";
import "@aejkatappaja/phantom-ui/ssr.css";

const phantomProps = { loading: true, animation: "pulse" as const, "fallback-radius": 4 };

const TableSkeleton = ({ rows, cols }: { rows: number; cols: number }) => (
  <div className="border border-border">
    <phantom-ui {...phantomProps}>
      <table className="w-full">
        <thead>
          <tr className="bg-muted/30">
            <th className="w-10 h-8" />
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="h-8 px-4">
                <div className="h-2 w-16 rounded" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-t border-border">
              <td className="w-10 px-4 py-3">
                <div className="h-2 w-4 rounded" />
              </td>
              {Array.from({ length: cols }).map((_, j) => (
                <td key={j} className="px-4 py-3">
                  <div className="h-3 rounded" style={{ width: `${60 + (((i * cols + j) * 17) % 30)}%` }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </phantom-ui>
  </div>
);

const SectionSkeleton = ({ rows, cols }: { rows: number; cols: number }) => (
  <div className="space-y-3">
    <phantom-ui {...phantomProps}>
      <div className="flex items-center justify-between gap-2 h-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" />
          <div className="h-3 w-24 rounded" />
          <div className="h-3 w-8 rounded" />
        </div>
        <div className="h-7 w-20 rounded" />
      </div>
    </phantom-ui>
    <TableSkeleton rows={rows} cols={cols} />
  </div>
);

export default function ContactsLoading() {
  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-border">
        <phantom-ui {...phantomProps}>
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="h-2 w-16 rounded" />
              <div className="h-9 w-36 rounded" />
              <div className="h-3 w-20 rounded" />
            </div>
          </div>
        </phantom-ui>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <SectionSkeleton rows={6} cols={2} />
        <SectionSkeleton rows={8} cols={3} />
      </div>
    </div>
  );
}
