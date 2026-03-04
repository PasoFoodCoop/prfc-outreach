import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { ComingSoonPage } from "@/components/layout/coming-soon-page";

export const metadata: Metadata = {
  title: "Settings | PRFC Connect",
};

export default function SettingsPage() {
  return (
    <ComingSoonPage
      icon={Settings}
      title="Settings"
      description="Coming soon. Account settings will be available here."
    />
  );
}
