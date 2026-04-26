import type { ColumnDef } from "@tanstack/vue-table";
import { ArrowUpDown } from "lucide-vue-next";
import { h } from "vue";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  username: string | null;
  role: "user" | "admin";
  emailVerified: boolean;
  plan: "skim" | "read" | "digest" | "deep";
  creditsUsed: number;
  creditsLimit: number;
  periodResetAt: Date | null;
  createdAt: Date;
  summaryCount: number;
  ipAddress: string | null;
  countryCode: string | null;
  city: string | null;
  utmSource: string | null;
  attribution: {
    utmMedium?: string | null;
    utmCampaign?: string | null;
    utmContent?: string | null;
    utmTerm?: string | null;
    referrer?: string | null;
    umamiSessionId?: string | null;
  } | null;
  metadata: {
    deviceId?: string | null;
    userAgent?: string | null;
  } | null;
};

export const createUserColumns = (
  onRowClick?: (user: AdminUser) => void,
): ColumnDef<AdminUser>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
          class: "font-medium",
        },
        () => ["Name", h(ArrowUpDown, { class: "ml-2 h-4 w-4" })],
      );
    },
    cell: ({ row }) => {
      const user = row.original;
      return h(
        "button",
        {
          onClick: () => onRowClick?.(user),
          class: "text-left font-medium hover:underline cursor-pointer",
        },
        user.name,
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
          class: "font-medium",
        },
        () => ["Email", h(ArrowUpDown, { class: "ml-2 h-4 w-4" })],
      );
    },
    cell: ({ row }) => h("div", { class: "text-sm" }, row.original.email),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role;
      return h(
        Badge,
        { variant: role === "admin" ? "default" : "secondary" },
        () => role.charAt(0).toUpperCase() + role.slice(1),
      );
    },
  },
  {
    accessorKey: "emailVerified",
    header: "Verified",
    cell: ({ row }) => {
      const verified = row.original.emailVerified;
      return h(
        Badge,
        { variant: verified ? "outline" : "destructive" },
        () => (verified ? "Yes" : "No"),
      );
    },
  },
  {
    accessorKey: "plan",
    header: "Plan",
    cell: ({ row }) => {
      const plan = row.original.plan;
      const variant = plan === "skim" ? "secondary" : "default";
      return h(
        Badge,
        { variant },
        () => plan.charAt(0).toUpperCase() + plan.slice(1),
      );
    },
  },
  {
    accessorKey: "creditsUsed",
    header: "Usage",
    cell: ({ row }) => {
      const used = row.original.creditsUsed;
      const limit = row.original.creditsLimit;
      return h(
        "div",
        { class: "text-sm tabular-nums" },
        `${used} / ${limit}`,
      );
    },
  },
  {
    accessorKey: "summaryCount",
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: "ghost",
          onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
          class: "font-medium",
        },
        () => ["Summaries", h(ArrowUpDown, { class: "ml-2 h-4 w-4" })],
      );
    },
    cell: ({ row }) => {
      const count = row.original.summaryCount;
      return h("div", { class: "text-sm tabular-nums text-center" }, count.toString());
    },
  },
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
        () => ["Joined", h(ArrowUpDown, { class: "ml-2 h-4 w-4" })],
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return h(
        "div",
        { class: "text-sm text-muted-foreground" },
        date.toLocaleDateString(),
      );
    },
  },
];
