import { ReferralDataGrid } from "@/components/referral/referral-data-grid";

export default function ReferralDatabasePage() {
  return (
    <div>
      <h1 className="font-komika text-[2rem] text-[#333] mb-4">Referral History</h1>
      <ReferralDataGrid />
    </div>
  );
}
