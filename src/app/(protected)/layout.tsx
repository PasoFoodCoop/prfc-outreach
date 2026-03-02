import { getSessionWithName } from "@/lib/dal";
import { TopBarActionProvider } from "@/components/layout/top-bar-action-context";
import { TopBar } from "@/components/layout/top-bar";
import { Sidebar } from "@/components/layout/sidebar";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionWithName();
  const userRole = session.isAdmin ? "Admin Manager" : "Member";

  return (
    <TopBarActionProvider>
      <TopBar userName={session.ownername} userRole={userRole} />
      <Sidebar />
      <main className="min-h-[calc(100vh-var(--header-height))] p-8 md:pl-[calc(220px+2rem)]">{children}</main>
    </TopBarActionProvider>
  );
}
