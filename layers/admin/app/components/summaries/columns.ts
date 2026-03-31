import type { ColumnDef } from "@tanstack/vue-table";
import { ArrowUpDown, ExternalLink, FileJson } from "lucide-vue-next";
import { h } from "vue";

import { NuxtLink } from "#components";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Summary } from "~~/db/schema";

export const createColumns = (
  onTitleClick?: (summary: Summary) => void,
): ColumnDef<Summary>[] => {
  return [
    // ID column - hidden by default
    {
      accessorKey: "summaryId",
      header: ({ column }) => {
        return h(
          Button,
          {
            variant: "ghost",
            onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
            class: "font-medium",
          },
          () => ["ID", h(ArrowUpDown, { class: "ml-2 h-4 w-4" })],
        );
      },
      cell: ({ row }) => {
        const summaryId = row.getValue("summaryId") as string;
        return h("div", { class: "font-mono text-sm" }, summaryId);
      },
    },

    // Title column - visible by default
    {
      accessorKey: "title",
      header: ({ column }) => {
        return h(
          Button,
          {
            variant: "ghost",
            onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
            class: "font-medium",
          },
          () => ["Title", h(ArrowUpDown, { class: "ml-2 h-4 w-4" })],
        );
      },
      cell: ({ row }) => {
        const title = row.getValue("title") as string;
        const summary = row.original;
        return h("div", { class: "max-w-[300px] truncate font-medium" }, [
          h(
            "button",
            {
              onClick: () => onTitleClick?.(summary),
              class: "text-left hover:underline cursor-pointer",
            },
            title || "N/A",
          ),
        ]);
      },
    },

    // Essence/Type column - visible by default
    {
      accessorKey: "essence",
      header: ({ column }) => {
        return h("div", { class: "flex items-center gap-2" }, [
          "Type",
          h(
            Button,
            {
              variant: "ghost",
              onClick: () =>
                column.toggleSorting(column.getIsSorted() === "asc"),
              class: "ml-auto",
            },
            () => h(ArrowUpDown, { class: "h-4 w-4" }),
          ),
        ]);
      },
      cell: ({ row }) => {
        const essence = row.getValue("essence") as string;
        const variantMap: Record<string, "default" | "secondary" | "outline"> =
          {
            article: "default",
            youtube: "secondary",
            reddit: "outline",
          };
        return h(
          Badge,
          { variant: variantMap[essence] || "default" },
          () => essence.charAt(0).toUpperCase() + essence.slice(1),
        );
      },
    },

    // Actions column - visible by default
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const summary = row.original;
        return h("div", { class: "flex items-center gap-2" }, [
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
          // Link to LLM Usage details page
          h(
            Button,
            {
              variant: "ghost",
              size: "sm",
              asChild: true, // Use asChild
              class: "h-8 w-8 p-0",
            },
            () =>
              h(
                NuxtLink,
                {
                  // Wrap with NuxtLink
                  to: `/admin/llm-usage?summaryId=${summary.summaryId}`,
                },
                () => h(FileJson, { class: "h-4 w-4" }),
              ),
          ),
        ]);
      },
    },

    // ===== HIDDEN COLUMNS (available in dropdown) =====

    // Source column - hidden by default (moved from visible)
    {
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => {
        const source = row.getValue("source") as string;
        let domain = source;
        try {
          const url = new URL(source);
          domain = url.hostname.replace(/^www\./, "");
        } catch {
          domain = source.replace(/^https?:\/\/(www\.)?/, "");
        }
        return h(TooltipProvider, {}, () =>
          h(Tooltip, {}, () => [
            h(TooltipTrigger, { asChild: true }, () =>
              h(
                "a",
                {
                  href: source,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  class:
                    "flex items-center text-sm text-muted-foreground hover:text-foreground",
                },
                [
                  h("span", { class: "max-w-[150px] truncate" }, domain),
                  h(ExternalLink, { class: "ml-1 h-3 w-3 flex-shrink-0" }),
                ],
              ),
            ),
            h(
              TooltipContent,
              { side: "bottom", class: "max-w-[400px] break-all" },
              () => source,
            ),
          ]),
        );
      },
    },

    // Status column - hidden by default
    {
      accessorKey: "status",
      header: ({ column }) => {
        return h(
          Button,
          {
            variant: "ghost",
            onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
            class: "font-medium",
          },
          () => ["Status", h(ArrowUpDown, { class: "ml-2 h-4 w-4" })],
        );
      },
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variantMap: Record<
          string,
          "default" | "secondary" | "outline" | "destructive"
        > = {
          pending: "outline",
          processing: "secondary",
          completed: "default",
          failed: "destructive",
        };
        return h(
          Badge,
          { variant: variantMap[status] || "outline" },
          () => status.charAt(0).toUpperCase() + status.slice(1),
        );
      },
    },

    // Created at column - hidden by default
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return h(
          Button,
          {
            variant: "ghost",
            onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
            class: "font-medium",
          },
          () => ["Created", h(ArrowUpDown, { class: "ml-2 h-4 w-4" })],
        );
      },
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string;
        const date = new Date(createdAt);
        return h(
          "div",
          { class: "text-sm text-muted-foreground" },
          date.toLocaleString(),
        );
      },
    },
  ];
};
