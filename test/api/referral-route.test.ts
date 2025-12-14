/**
 * @jest-environment node
 */
import { prismaMock, createMockRequest, allReferrals } from "../mocks";
import { GET } from "@/app/api/referral/route";

describe("GET /api/referral", () => {
  it("returns all referrals as JSON", async () => {
    prismaMock.referral.findMany.mockResolvedValue(allReferrals);
    const req = createMockRequest({ prfc_database_access: "verified" });

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(3);
  });

  it("returns 401 without valid cookie", async () => {
    const req = createMockRequest();

    const response = await GET(req);

    expect(response.status).toBe(401);
  });

  it("returns 500 on database error", async () => {
    prismaMock.referral.findMany.mockRejectedValue(new Error("Connection lost"));
    const req = createMockRequest({ prfc_database_access: "verified" });

    const response = await GET(req);

    expect(response.status).toBe(500);
  });
});
