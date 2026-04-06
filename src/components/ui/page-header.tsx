import type { PageHeaderProps } from "@/types/props";

export const PageHeader = ({ eyebrow, title, subtitle, action }: PageHeaderProps) => (
  <div className="pb-4 border-b border-border">
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-1">{eyebrow}</p>
        <h1 className="font-mono text-3xl md:text-4xl font-bold text-foreground leading-none">{title}</h1>
        {subtitle && <p className="font-mono text-xs text-muted-foreground mt-2">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  </div>
);
