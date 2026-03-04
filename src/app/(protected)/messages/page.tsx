import type { Metadata } from "next";
import { MessageSquareMore } from "lucide-react";
import { ComingSoonPage } from "@/components/layout/coming-soon-page";

export const metadata: Metadata = {
  title: "Messages | PRFC Connect",
};

export default function MessagesPage() {
  return (
    <ComingSoonPage
      icon={MessageSquareMore}
      title="Messages"
      description="Coming soon. You'll be able to send messages to your groups here."
    />
  );
}
