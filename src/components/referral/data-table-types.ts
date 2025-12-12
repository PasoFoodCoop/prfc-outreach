export type Density = "compact" | "standard" | "comfortable";

export const densityClasses: Record<Density, string> = {
  compact: "h-8 py-1 text-sm",
  standard: "h-12 py-2",
  comfortable: "h-16 py-4",
};

export const columnDisplayLabels: Record<string, string> = {
  select: "Checkbox selection",
  createdAt: "Date",
  memberName: "Member Name",
  memberEmail: "Member Email",
  prospectName: "Prospect Name",
  prospectEmail: "Prospect Email",
  referralCode: "Code",
  redeemed: "Redeemed",
};

export const filterableColumns = [
  { id: "createdAt", label: "Date" },
  { id: "memberName", label: "Member Name" },
  { id: "memberEmail", label: "Member Email" },
  { id: "prospectName", label: "Prospect Name" },
  { id: "prospectEmail", label: "Prospect Email" },
  { id: "referralCode", label: "Code" },
] as const;
