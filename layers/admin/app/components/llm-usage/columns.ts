import type { ColumnDef } from "@tanstack/vue-table";
import { ExternalLink, List } from "lucide-vue-next";
import { h } from "vue";

import { formatNumber } from "../../lib/formatters";

import { NuxtLink } from "#components";
import { Button } from "@/components/ui/button";
import type { FlattenedLlmUsage } from "~~/server/lib/admin";

export const createLlmUsageColumns = (
  onIdClick?: (item: FlattenedLlmUsage) => void,
): ColumnDef<FlattenedLlmUsage>[] => [
  {
    accessorKey: "summaryId",
    header: "ID",
    cell: ({ row }) => {
      const item = row.original;
      return h(
        Button,
        {
          variant: "link",
          class: "font-mono p-0 h-auto",
          onClick: () => onIdClick?.(item),
        },
        () => item.summaryId,
      );
    },
  },
  {
    accessorKey: "essence",
    header: "Type",
    cell: ({ row }) => h("div", { class: "capitalize" }, row.original.essence),
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "summaryModel",
    header: "Summary Model",
    cell: ({ row }) => row.original.summaryModel || "N/A",
  },
  {
    accessorKey: "holisticTotalTokens",
    header: "Total Tokens",
    cell: ({ row }) => formatNumber(row.original.holisticTotalTokens),
  },
  {
    accessorKey: "wordCount",
    header: "Words",
    cell: ({ row }) => {
      const wordCount = row.original.wordCount;
      if (!wordCount) return h("span", { class: "text-muted-foreground" }, "-");
      return h("div", { class: "tabular-nums" }, wordCount.toLocaleString());
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const summary = row.original;
      return h("div", { class: "flex items-center gap-2" }, [
        // Link back to summaries table, filtered
        h(
          Button,
          {
            variant: "ghost",
            size: "sm",
            asChild: true,
            class: "h-8 w-8 p-0",
          },
          () =>
            h(
              NuxtLink,
              {
                to: `/admin/summaries?search=${summary.summaryId}`,
              },
              () => h(List, { class: "h-4 w-4" }),
            ),
        ),
        // Link to public summary page
        h(
          Button,
          {
            variant: "ghost",
            size: "sm",
            as: "a",
            href: `/app/${summary.summaryId}`,
            target: "_blank",
            class: "h-8 w-8 p-0",
          },
          () => h(ExternalLink, { class: "h-4 w-4" }),
        ),
      ]);
    },
  },
];
