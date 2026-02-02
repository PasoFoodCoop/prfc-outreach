import "server-only";
import { env } from "@/env";
import type { MockMember } from "@/lib/mock-members";

async function getMockMemberDetails(memberIds: number[]): Promise<MockMember[]> {
  return memberIds.map((id) => ({
    ownerid: id,
    ownername: `Member ${id}`,
    owneremail: `member${id}@example.com`,
    ownerphone: `+1555000${String(id).padStart(4, "0")}`,
  }));
}

async function getRealMemberDetails(_memberIds: number[]): Promise<MockMember[]> {
  throw new Error("Real Member Portal API integration not yet implemented");
}

async function getMockAllActiveMemberIds(): Promise<number[]> {
  const { mockMembers } = await import("@/lib/mock-members");
  return mockMembers.map((m) => m.ownerid);
}

async function getRealAllActiveMemberIds(): Promise<number[]> {
  throw new Error("Real Member Portal API integration not yet implemented");
}

export async function getMemberDetails(memberIds: number[]): Promise<MockMember[]> {
  if (env.USE_MOCK_MEMBER_API) {
    return getMockMemberDetails(memberIds);
  }
  return getRealMemberDetails(memberIds);
}

export async function getAllActiveMemberIds(): Promise<number[]> {
  if (env.USE_MOCK_MEMBER_API) {
    return getMockAllActiveMemberIds();
  }
  return getRealAllActiveMemberIds();
}
