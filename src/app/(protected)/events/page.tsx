import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { ComingSoonPage } from "@/components/layout/coming-soon-page";

export const metadata: Metadata = {
  title: "Events | PRFC Connect",
};

export default function EventsPage() {
  return (
    <ComingSoonPage
      icon={CalendarDays}
      title="Events"
      description="Coming soon. Events will be available in a future update."
    />
  );
}
