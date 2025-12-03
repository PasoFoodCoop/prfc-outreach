export type FilterOperator =
  | "contains"
  | "doesNotContain"
  | "equals"
  | "doesNotEqual"
  | "startsWith"
  | "endsWith"
  | "isEmpty"
  | "isNotEmpty";

export interface ColumnFilterValue {
  text: string;
  operator: FilterOperator;
}

const ops: Record<FilterOperator, (cellVal: string, filterVal: string) => boolean> = {
  contains: (c, f) => c.includes(f),
  doesNotContain: (c, f) => !c.includes(f),
  equals: (c, f) => c === f,
  doesNotEqual: (c, f) => c !== f,
  startsWith: (c, f) => c.startsWith(f),
  endsWith: (c, f) => c.endsWith(f),
  isEmpty: (c) => c === "",
  isNotEmpty: (c) => c !== "",
};

export function operatorFilter(
  row: { getValue: (columnId: string) => unknown },
  columnId: string,
  filterValue: ColumnFilterValue,
): boolean {
  const cell = String(row.getValue(columnId) ?? "").toLowerCase();
  const text = filterValue.text.toLowerCase();
  return ops[filterValue.operator](cell, text);
}

export const filterOperators: { value: FilterOperator; label: string }[] = [
  { value: "contains", label: "contains" },
  { value: "doesNotContain", label: "does not contain" },
  { value: "equals", label: "equals" },
  { value: "doesNotEqual", label: "does not equal" },
  { value: "startsWith", label: "starts with" },
  { value: "endsWith", label: "ends with" },
  { value: "isEmpty", label: "is empty" },
  { value: "isNotEmpty", label: "is not empty" },
];
