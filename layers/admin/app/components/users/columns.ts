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
  createdAt: Date;
  summaryCount: number;
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
      return h("div", { class: "text-sm tabular-nums" }, count.toString());
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
