/**
 * @jest-environment node
 */
import { prismaMock } from "../mocks/prisma";
import { referralCharlie, createReferralInput, allReferrals } from "../mocks/referrals";
import { getAllReferrals, getReferralById, createReferral, toggleReferralRedeemed } from "@/services/referral-store";

describe("getAllReferrals", () => {
  it("returns referrals ordered by createdAt desc", async () => {
    prismaMock.referral.findMany.mockResolvedValue(allReferrals);

    const result = await getAllReferrals();

    expect(result).toEqual(allReferrals);
    expect(prismaMock.referral.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "desc" },
    });
  });
});

describe("getReferralById", () => {
  it("returns referral when found", async () => {
    prismaMock.referral.findUnique.mockResolvedValue(referralCharlie);

    const result = await getReferralById(1);

    expect(result).toEqual(referralCharlie);
  });

  it("throws NOT_FOUND when missing", async () => {
    prismaMock.referral.findUnique.mockResolvedValue(null);

    await expect(getReferralById(999)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});

describe("createReferral", () => {
  it("persists validated referral", async () => {
    prismaMock.referral.create.mockResolvedValue(referralCharlie);

    const result = await createReferral(createReferralInput);

    expect(result.id).toBe(1);
    expect(prismaMock.referral.create).toHaveBeenCalled();
  });

  it("rejects invalid email format", async () => {
    const badInput = { ...createReferralInput, memberEmail: "not-an-email" };

    await expect(createReferral(badInput)).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
    });
  });
});

describe("toggleReferralRedeemed", () => {
  it("flips redeemed false->true", async () => {
    prismaMock.referral.findUnique.mockResolvedValue(referralCharlie);
    prismaMock.referral.update.mockResolvedValue({
      ...referralCharlie,
      redeemed: true,
    });

    const result = await toggleReferralRedeemed(1);

    expect(result.redeemed).toBe(true);
    expect(prismaMock.referral.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { redeemed: true },
    });
  });

  it("throws NOT_FOUND for missing referral", async () => {
    prismaMock.referral.findUnique.mockResolvedValue(null);

    await expect(toggleReferralRedeemed(999)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});
