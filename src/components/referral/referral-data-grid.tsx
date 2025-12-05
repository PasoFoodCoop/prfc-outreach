"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Referral } from "@/schema/referral";
import { operatorFilter, filterOperators, type FilterOperator, type ColumnFilterValue } from "@/lib/table-filters";
import { useToast } from "@/hooks/use-toast";
import { useReferrals } from "@/hooks/use-referrals";
import { Skeleton } from "@/components/ui/skeleton";

type Density = "compact" | "standard" | "comfortable";

const densityClasses: Record<Density, string> = {
  compact: "h-8 py-1 text-sm",
  standard: "h-12 py-2",
  comfortable: "h-16 py-4",
};

const columnDisplayLabels: Record<string, string> = {
  select: "Checkbox selection",
  createdAt: "Date",
  memberName: "Member Name",
  memberEmail: "Member Email",
  prospectName: "Prospect Name",
  prospectEmail: "Prospect Email",
  referralCode: "Code",
  redeemed: "Redeemed",
};

const filterableColumns = [
  { id: "createdAt", label: "Date" },
  { id: "memberName", label: "Member Name" },
  { id: "memberEmail", label: "Member Email" },
  { id: "prospectName", label: "Prospect Name" },
  { id: "prospectEmail", label: "Prospect Email" },
  { id: "referralCode", label: "Code" },
];

const STORAGE_KEY = "referral-table-columns";

export function ReferralDataGrid() {
  const { data: referrals, error, isLoading, isFetching, toggleRedeemed } = useReferrals();
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  // null = CSS handles responsive visibility, object = user overrides
  const [userOverrides, setUserOverrides] = useState<VisibilityState | null>(null);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [density, setDensity] = useState<Density>("standard");

  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterColumn, setFilterColumn] = useState("createdAt");
  const [filterOperator, setFilterOperator] = useState<FilterOperator>("contains");
  const [filterValue, setFilterValue] = useState("");
  const [columnSearch, setColumnSearch] = useState("");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUserOverrides(JSON.parse(stored));
      }
    } catch {
      // localStorage unavailable or corrupted
    }
  }, []);

  const hasCustomized = userOverrides !== null;

  const handleColumnVisibilityChange = useCallback(
    (updater: VisibilityState | ((prev: VisibilityState) => VisibilityState)) => {
      setUserOverrides((prev) => {
        const next = typeof updater === "function" ? updater(prev ?? {}) : updater;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // localStorage full or unavailable
        }
        return next;
      });
    },
    [],
  );

  const resetColumnVisibility = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage unavailable
    }
    setUserOverrides(null);
  }, []);

  useEffect(() => {
    if (error) {
      toast({ title: "Failed to load referrals", variant: "destructive" });
    }
  }, [error, toast]);

  const formatDate = useCallback((date: string | Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(date));
  }, []);

  const columns: ColumnDef<Referral>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => formatDate(row.getValue("createdAt")),
        filterFn: operatorFilter,
        meta: { className: "hidden md:table-cell", responsiveHidden: "md" },
      },
      {
        accessorKey: "memberName",
        header: "Member Name",
        enableHiding: false,
        filterFn: operatorFilter,
      },
      {
        accessorKey: "memberEmail",
        header: "Member Email",
        filterFn: operatorFilter,
        meta: { className: "hidden lg:table-cell", responsiveHidden: "lg" },
      },
      {
        accessorKey: "prospectName",
        header: "Prospect Name",
        enableHiding: false,
        filterFn: operatorFilter,
      },
      {
        accessorKey: "prospectEmail",
        header: "Prospect Email",
        filterFn: operatorFilter,
        meta: { className: "hidden lg:table-cell", responsiveHidden: "lg" },
      },
      {
        accessorKey: "referralCode",
        header: "Code",
        filterFn: operatorFilter,
        meta: { className: "hidden md:table-cell", responsiveHidden: "md" },
      },
      {
        accessorKey: "redeemed",
        header: () => <div className="text-center">Redeemed</div>,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-center">
            <Switch
              checked={row.getValue("redeemed")}
              onCheckedChange={() => toggleRedeemed(row.original.id, row.getValue("redeemed"))}
              aria-label="Toggle redeemed status"
            />
          </div>
        ),
      },
    ],
    [formatDate, toggleRedeemed],
  );

  const placeholderRows = useMemo(() => Array(10).fill({} as Referral), []);
  const skeletonColumns: ColumnDef<Referral>[] = useMemo(
    () => columns.map((col) => ({ ...col, cell: () => <Skeleton className="h-4 w-full" /> })),
    [columns],
  );

  const tableRows = isLoading ? placeholderRows : referrals;
  const tableCols = isLoading ? skeletonColumns : columns;

  const table = useReactTable({
    data: tableRows,
    columns: tableCols,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility: userOverrides ?? {},
      rowSelection,
      globalFilter,
    },
  });

  const handleClearFilter = useCallback(() => {
    setFilterValue("");
    setColumnFilters([]);
    setShowFilterPanel(false);
  }, []);

  const handleShowHideAll = useCallback(
    (show: boolean) => {
      table.getAllColumns().forEach((column) => {
        if (column.getCanHide()) {
          column.toggleVisibility(show);
        }
      });
    },
    [table],
  );

  const handleReset = useCallback(() => {
    handleShowHideAll(true);
    setColumnSearch("");
  }, [handleShowHideAll]);

  const allColumnsVisible = table
    .getAllColumns()
    .filter((c) => c.getCanHide())
    .every((c) => c.getIsVisible());

  const hiddenColumnCount = table.getAllColumns().filter((c) => c.getCanHide() && !c.getIsVisible()).length;

  const isFiltered = columnFilters.length > 0;

  const exportToPDF = useCallback(() => {
    const doc = new jsPDF();
    const tableColumns = ["Date", "Member Name", "Member Email", "Prospect Name", "Prospect Email", "Code", "Redeemed"];
    const tableRows = table
      .getFilteredRowModel()
      .rows.map((row) => [
        formatDate(row.original.createdAt),
        row.original.memberName,
        row.original.memberEmail,
        row.original.prospectName,
        row.original.prospectEmail,
        row.original.referralCode,
        row.original.redeemed ? "Yes" : "No",
      ]);

    doc.setFontSize(16);
    doc.text("Paso Food Co-op Referral Database", doc.internal.pageSize.getWidth() / 2, 15, { align: "center" });

    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [131, 16, 2] },
      alternateRowStyles: { fillColor: [237, 221, 204] },
      margin: { left: 10, right: 10 },
    });

    doc.autoPrint();
    window.open(doc.output("bloburl"), "_blank");
  }, [table, formatDate]);

  const filteredColumns = table
    .getAllColumns()
    .filter((column) => column.id !== "select")
    .filter((column) => {
      const label = columnDisplayLabels[column.id] || column.id;
      return label.toLowerCase().includes(columnSearch.toLowerCase());
    });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 p-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex flex-1 items-center bg-white px-2 py-1"
            style={{
              border: "2px solid #831002",
              borderRadius: "28px",
            }}
          >
            <svg className="w-5 h-5 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <Input
              type="text"
              placeholder="Search…"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="border-none shadow-none focus-visible:ring-0 w-40 p-0 h-auto text-sm"
              aria-label="Search referrals"
            />
          </div>

          <Drawer open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative flex md:hidden min-h-[44px] min-w-[44px] shrink-0"
                aria-label="Open filters and options"
              >
                <SlidersHorizontal className="h-5 w-5" />
                {(isFiltered || hiddenColumnCount > 0) && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-prfc-blue" />
                )}
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[85vh]">
              <DrawerHeader>
                <DrawerTitle>Filters & Display Options</DrawerTitle>
              </DrawerHeader>
              <div className="space-y-6 px-4 pb-4 overflow-y-auto">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-prfc-blue">
                      Visible Columns
                      {hiddenColumnCount > 0 && (
                        <span className="ml-2 text-sm text-muted-foreground">({hiddenColumnCount} hidden)</span>
                      )}
                    </h3>
                    <button onClick={resetColumnVisibility} className="text-sm text-prfc-blue hover:underline">
                      Reset to defaults
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {table
                      .getAllColumns()
                      .filter((column) => column.id !== "select" && column.getCanHide())
                      .map((column) => (
                        <label key={column.id} className="flex items-center gap-2 min-h-[44px] cursor-pointer">
                          <Checkbox
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                          />
                          <span>{columnDisplayLabels[column.id] || column.id}</span>
                        </label>
                      ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-prfc-blue">Filters</h3>
                  <div className="space-y-2">
                    <Select value={filterColumn} onValueChange={setFilterColumn}>
                      <SelectTrigger className="w-full min-h-[44px]">
                        <SelectValue placeholder="Column" />
                      </SelectTrigger>
                      <SelectContent>
                        {filterableColumns.map((col) => (
                          <SelectItem key={col.id} value={col.id}>
                            {col.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterOperator} onValueChange={(v) => setFilterOperator(v as FilterOperator)}>
                      <SelectTrigger className="w-full min-h-[44px]">
                        <SelectValue placeholder="Operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {filterOperators.map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="text"
                      placeholder="Filter value"
                      value={filterValue}
                      onChange={(e) => {
                        setFilterValue(e.target.value);
                        if (e.target.value.trim()) {
                          setColumnFilters([
                            {
                              id: filterColumn,
                              value: { text: e.target.value, operator: filterOperator } as ColumnFilterValue,
                            },
                          ]);
                        } else {
                          setColumnFilters([]);
                        }
                      }}
                      className="w-full min-h-[44px]"
                    />
                    {isFiltered && (
                      <Button variant="outline" onClick={handleClearFilter} className="w-full min-h-[44px]">
                        Clear Filter
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-prfc-blue">Table Density</h3>
                  <div className="flex flex-col gap-2">
                    {(["compact", "standard", "comfortable"] as Density[]).map((d) => (
                      <label
                        key={d}
                        className={cn(
                          "flex items-center gap-3 min-h-[44px] px-3 rounded-lg cursor-pointer",
                          density === d ? "bg-gray-100" : "hover:bg-gray-50",
                        )}
                      >
                        <input
                          type="radio"
                          name="density"
                          checked={density === d}
                          onChange={() => setDensity(d)}
                          className="h-4 w-4"
                        />
                        <span className="capitalize">{d}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline" className="w-full min-h-[44px]">
                    Done
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 text-sm text-prfc-blue hover:opacity-80">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
                </svg>
                <span className="font-medium">COLUMNS</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <div className="p-2">
                <div className="flex items-center border rounded px-2 py-1">
                  <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search"
                    value={columnSearch}
                    onChange={(e) => setColumnSearch(e.target.value)}
                    className="border-none outline-none text-sm w-full"
                  />
                </div>
              </div>
              {filteredColumns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {columnDisplayLabels[column.id] || column.id}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <div className="flex items-center justify-between px-2 py-1.5">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={allColumnsVisible} onCheckedChange={(checked) => handleShowHideAll(!!checked)} />
                  Show/Hide All
                </label>
                <button onClick={handleReset} className="text-xs text-gray-400 hover:text-gray-600 uppercase">
                  Reset
                </button>
              </div>
              {hasCustomized && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={resetColumnVisibility}>Reset to defaults</DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="flex items-center gap-1 text-sm text-prfc-blue hover:opacity-80"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
            </svg>
            <span className="font-medium">FILTERS</span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 text-sm text-prfc-blue hover:opacity-80">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 8h16V6H4v2zm0 5h16v-2H4v2zm0 5h16v-2H4v2z" />
                </svg>
                <span className="font-medium">DENSITY</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <button
                onClick={() => setDensity("compact")}
                className={cn(
                  "flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100",
                  density === "compact" && "bg-gray-50",
                )}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 8h16V6H4v2zm0 4h16v-2H4v2zm0 4h16v-2H4v2zm0 4h16v-2H4v2z" />
                </svg>
                Compact
              </button>
              <button
                onClick={() => setDensity("standard")}
                className={cn(
                  "flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100",
                  density === "standard" && "bg-gray-50",
                )}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 8h16V6H4v2zm0 5h16v-2H4v2zm0 5h16v-2H4v2z" />
                </svg>
                Standard
              </button>
              <button
                onClick={() => setDensity("comfortable")}
                className={cn(
                  "flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100",
                  density === "comfortable" && "bg-gray-50",
                )}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 9h16V7H4v2zm0 6h16v-2H4v2z" />
                </svg>
                Comfortable
              </button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button
          onClick={exportToPDF}
          className="w-full md:w-auto text-white border-none rounded cursor-pointer"
          style={{
            backgroundColor: "#831002",
            padding: "8px 16px",
          }}
        >
          Export to PDF
        </Button>
      </div>

      <div
        role="region"
        aria-label="Referral data table"
        aria-busy={isFetching ? "true" : "false"}
        tabIndex={0}
        className={cn(
          "overflow-x-auto focus:outline-2 focus:outline-blue-500 transition-opacity",
          isFetching && !isLoading && "opacity-60",
        )}
        style={{
          border: "2px solid #968676",
          borderRadius: "12px",
        }}
      >
        {showFilterPanel && (
          <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-200">
            <button onClick={handleClearFilter} className="text-gray-500 hover:text-gray-700" aria-label="Clear filter">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>

            <span className="text-sm text-gray-600">Columns</span>
            <Select value={filterColumn} onValueChange={setFilterColumn}>
              <SelectTrigger className="w-36 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filterableColumns.map((col) => (
                  <SelectItem key={col.id} value={col.id}>
                    {col.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-sm text-gray-600">Operator</span>
            <Select value={filterOperator} onValueChange={(v) => setFilterOperator(v as FilterOperator)}>
              <SelectTrigger className="w-36 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filterOperators.map((op) => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-sm text-prfc-blue">Value</span>
            <Input
              type="text"
              placeholder="Filter value"
              value={filterValue}
              onChange={(e) => {
                setFilterValue(e.target.value);
                if (e.target.value.trim()) {
                  setColumnFilters([
                    {
                      id: filterColumn,
                      value: { text: e.target.value, operator: filterOperator } as ColumnFilterValue,
                    },
                  ]);
                } else {
                  setColumnFilters([]);
                }
              }}
              className="w-36 h-8 text-sm"
            />
          </div>
        )}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                style={{
                  borderTop: "2px solid #968676",
                  backgroundColor: "#EDDDCC",
                }}
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "font-bold",
                      header.column.getCanSort() && "cursor-pointer underline select-none",
                      !hasCustomized && header.column.columnDef.meta?.className,
                    )}
                    style={{ color: "#831002" }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: " ↑",
                      desc: " ↓",
                    }[header.column.getIsSorted() as string] ?? null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(densityClasses[density])}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#D9D9D9",
                    transition: "none",
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={!hasCustomized ? cell.column.columnDef.meta?.className : undefined}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={tableCols.length} className="h-24 text-center">
                  {isLoading ? "" : "No referrals found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-2">
        <span className="text-sm text-gray-600">Rows per page:</span>
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
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
          {table.getFilteredRowModel().rows.length === 0
            ? "0–0 of 0"
            : `${table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–${Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length,
              )} of ${table.getFilteredRowModel().rows.length}`}
        </span>

        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="p-1 disabled:opacity-30"
          style={{ color: "rgba(0, 0, 0, 0.54)" }}
          aria-label="Previous page"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
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
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default ReferralDataGrid;
