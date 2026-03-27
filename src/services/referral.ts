import "server-only";
import prisma from "@/lib/db";
import { CreateReferralSchema, type CreateReferral } from "@/schema/referral";
import { AppError, transformError } from "@/utils/errors";
import { encrypt, decrypt } from "@/lib/encryption";

interface ReferralPii {
  memberName: string;
  memberEmail: string;
  prospectName: string;
  prospectEmail: string;
}

function encryptPii(data: ReferralPii): ReferralPii {
  return {
    memberName: encrypt(data.memberName),
    memberEmail: encrypt(data.memberEmail),
    prospectName: encrypt(data.prospectName),
    prospectEmail: encrypt(data.prospectEmail),
  };
}

function decryptPii<T extends ReferralPii>(record: T): T {
  return {
    ...record,
    memberName: decrypt(record.memberName),
    memberEmail: decrypt(record.memberEmail),
    prospectName: decrypt(record.prospectName),
    prospectEmail: decrypt(record.prospectEmail),
  };
}

export async function getAllReferrals() {
  try {
    const referrals = await prisma.referral.findMany({
      orderBy: { createdAt: "desc" },
    });
    return referrals.map(decryptPii);
  } catch (error) {
    throw transformError(error);
  }
}

export async function getReferralById(id: number) {
  try {
    const referral = await prisma.referral.findUnique({ where: { id } });

    if (!referral) {
      throw new AppError("NOT_FOUND", `Referral with id ${id} not found`);
    }

    return decryptPii(referral);
  } catch (error) {
    throw transformError(error);
  }
}

export async function createReferral(data: CreateReferral) {
  try {
    const validated = CreateReferralSchema.parse(data);
    const encrypted = encryptPii(validated);

    const referral = await prisma.referral.create({
      data: {
        ...encrypted,
        referralCode: validated.referralCode,
        redeemed: validated.redeemed ?? false,
      },
    });
    return decryptPii(referral);
  } catch (error) {
    throw transformError(error);
  }
}

export async function createManyReferrals(referrals: CreateReferral[]) {
  try {
    const validatedReferrals = referrals.map((data) => CreateReferralSchema.parse(data));

    const results = await prisma.$transaction(
      validatedReferrals.map((data) => {
        const encrypted = encryptPii(data);
        return prisma.referral.create({
          data: {
            ...encrypted,
            referralCode: data.referralCode,
            redeemed: data.redeemed ?? false,
          },
        });
      }),
    );
    return results.map(decryptPii);
  } catch (error) {
    throw transformError(error);
  }
}

export async function toggleReferralRedeemed(id: number) {
  try {
    const existing = await prisma.referral.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError("NOT_FOUND", `Referral with id ${id} not found`);
    }

    const updated = await prisma.referral.update({
      where: { id },
      data: { redeemed: !existing.redeemed },
    });
    return decryptPii(updated);
  } catch (error) {
    throw transformError(error);
  }
}

export async function updateReferralRedeemed(id: number, redeemed: boolean) {
  try {
    const updated = await prisma.referral.update({
      where: { id },
      data: { redeemed },
    });
    return decryptPii(updated);
  } catch (error) {
    throw transformError(error);
  }
}

export async function deleteReferral(id: number) {
  try {
    const existing = await prisma.referral.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError("NOT_FOUND", `Referral with id ${id} not found`);
    }

    const deleted = await prisma.referral.delete({ where: { id } });
    return decryptPii(deleted);
  } catch (error) {
    throw transformError(error);
  }
}
