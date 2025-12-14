"use client";

import type { Table } from "@tanstack/react-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ApiReferral } from "@/schema/api";

interface DataTablePaginationProps {
  table: Table<ApiReferral>;
}

export function DataTablePagination({ table }: DataTablePaginationProps) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;
  const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="flex items-center justify-end gap-2">
      <span className="text-sm text-gray-600">Rows per page:</span>
      <Select value={`${pageSize}`} onValueChange={(value) => table.setPageSize(Number(value))}>
        <SelectTrigger className="w-16 h-8" aria-label="Rows per page">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {[5, 10, 20, 100].map((size) => (
            <SelectItem key={size} value={`${size}`}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-sm text-gray-600 mx-2">
        {totalRows === 0 ? "0-0 of 0" : `${startRow}-${endRow} of ${totalRows}`}
      </span>

      <button
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
        className="p-1 disabled:opacity-30"
        style={{ color: "rgba(0, 0, 0, 0.54)" }}
        aria-label="Previous page"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
      </button>
      <button
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
        className="p-1 disabled:opacity-30"
        style={{ color: "rgba(0, 0, 0, 0.54)" }}
        aria-label="Next page"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
      </button>
    </div>
  );
}
