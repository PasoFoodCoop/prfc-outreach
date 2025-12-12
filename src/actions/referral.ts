"use server";

import { revalidatePath } from "next/cache";
import { ReferralFormSchema } from "@/schema/api";
import { createManyReferrals, toggleReferralRedeemed } from "@/services/referral";
import { sendReferralEmails } from "@/services/email";
import { transformError } from "@/utils/errors";

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function submitReferrals(formData: FormData): Promise<ActionResult> {
  try {
    const rawData = {
      memberName: formData.get("memberName"),
      memberEmail: formData.get("memberEmail"),
      referralCode: formData.get("referralCode"),
      prospects: JSON.parse(formData.get("prospects") as string),
    };

    const { memberName, memberEmail, referralCode, prospects } = ReferralFormSchema.parse(rawData);

    await sendReferralEmails({ prospects, referralCode, memberName });

    const referrals = prospects.map((prospect) => ({
      memberName,
      memberEmail,
      prospectName: prospect.prospectName,
      prospectEmail: prospect.prospectEmail,
      referralCode,
      redeemed: false,
    }));

    await createManyReferrals(referrals);
    revalidatePath("/referral-database");

    return { success: true };
  } catch (error) {
    const appError = transformError(error);
    return { success: false, error: appError.message };
  }
}

export async function toggleRedeemed(id: number): Promise<ActionResult> {
  try {
    await toggleReferralRedeemed(id);
    revalidatePath("/referral-database");
    return { success: true };
  } catch (error) {
    const appError = transformError(error);
    return { success: false, error: appError.message };
  }
}
