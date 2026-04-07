"use client";

import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { DescriptionCellProps } from "@/types/props";

export const DescriptionCell = ({ description, comment }: DescriptionCellProps) => (
  <span className="flex items-center gap-1.5 min-w-0">
    <span className="truncate">{description || "—"}</span>
    {comment && (
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="w-3 h-3 text-muted-foreground/50 hover:text-muted-foreground shrink-0 cursor-default transition-colors" />
        </TooltipTrigger>
        <TooltipContent>{comment}</TooltipContent>
      </Tooltip>
    )}
  </span>
);
