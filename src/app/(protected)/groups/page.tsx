import { getSessionWithName } from "@/lib/dal";
import { getAllGroups, getGroupsByOwner } from "@/services/contact-group";
import { GroupsContent } from "./groups-content";

export default async function GroupsPage() {
  const session = await getSessionWithName();
  const isAdmin = session.isAdmin;

  const groups = isAdmin ? await getAllGroups() : await getGroupsByOwner(session.ownerid);

  return <GroupsContent groups={groups} isAdmin={isAdmin} ownerId={session.ownerid} />;
}
