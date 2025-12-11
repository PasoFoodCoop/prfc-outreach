/**
 * @jest-environment node
 */
import { prismaMock } from "../mocks/prisma";
import { allReferrals } from "../mocks/referrals";
import { GET } from "@/app/api/referral/route";

describe("GET /api/referral", () => {
  it("returns all referrals as JSON", async () => {
    prismaMock.referral.findMany.mockResolvedValue(allReferrals);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(3);
  });

  it("returns 500 on database error", async () => {
    prismaMock.referral.findMany.mockRejectedValue(new Error("Connection lost"));

    const response = await GET();

    expect(response.status).toBe(500);
  });
});
