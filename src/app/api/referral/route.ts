import { NextRequest, NextResponse } from "next/server";
import { ReferralFormSchema } from "@/schema/api";
import { createManyReferrals, getAllReferrals } from "@/services/referral";
import { sendReferralEmails } from "@/services/email";
import { apiErrorHandler } from "@/utils/errors";

const ACCESS_COOKIE = "prfc_database_access";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { memberName, memberEmail, referralCode, prospects } = ReferralFormSchema.parse(body);

    await sendReferralEmails({ prospects, referralCode, memberName });

    const referrals = prospects.map((prospect) => ({
      memberName,
      memberEmail,
      prospectName: prospect.prospectName,
      prospectEmail: prospect.prospectEmail,
      referralCode,
      redeemed: false,
    }));

    const newReferrals = await createManyReferrals(referrals);

    return NextResponse.json({ message: "Referrals created successfully!", referrals: newReferrals }, { status: 201 });
  } catch (error) {
    return apiErrorHandler(error);
  }
}

export async function GET(req: NextRequest) {
  const hasAccess = req.cookies.get(ACCESS_COOKIE);

  if (hasAccess?.value !== "verified") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const referrals = await getAllReferrals();
    return NextResponse.json(referrals, { status: 200 });
  } catch (error) {
    return apiErrorHandler(error);
  }
}
