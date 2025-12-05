import { Header } from "@/components/layout/header";
import { ReferralDataGrid } from "@/components/referral/referral-data-grid";

export default function ReferralDatabasePage() {
  return (
    <main>
      <Header />
      <div className="bg-prfc-tan px-4 md:px-[52px] py-5 min-h-[calc(100vh-8vw)]">
        <h1 className="font-komika text-[2rem] text-[#333] mb-4">Referral History</h1>
        <ReferralDataGrid />
      </div>
    </main>
  );
}
