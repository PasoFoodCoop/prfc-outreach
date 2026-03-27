import "server-only";
import prisma from "@/lib/db";
import type { EmailSuppressionReason } from "@/generated/prisma/client";
import { transformError } from "@/utils/errors";
import { encrypt, blindIndex } from "@/lib/encryption";

export async function isEmailSuppressed(email: string): Promise<boolean> {
  try {
    const hash = blindIndex(email);
    const suppression = await prisma.emailSuppression.findUnique({
      where: { emailHash: hash },
    });
    return suppression !== null;
  } catch (error) {
    throw transformError(error);
  }
}

export async function suppressEmail(email: string, reason: EmailSuppressionReason): Promise<void> {
  try {
    const normalized = email.toLowerCase();
    const hash = blindIndex(normalized);
    const encrypted = encrypt(normalized);

    await prisma.emailSuppression.upsert({
      where: { emailHash: hash },
      update: { reason, suppressedAt: new Date() },
      create: { email: encrypted, emailHash: hash, reason },
    });
  } catch (error) {
    throw transformError(error);
  }
}

export async function filterSuppressedEmails(emails: string[]): Promise<{ valid: string[]; suppressed: string[] }> {
  try {
    const hashToOriginal = new Map<string, string>();
    for (const email of emails) {
      hashToOriginal.set(blindIndex(email), email);
    }

    const suppressions = await prisma.emailSuppression.findMany({
      where: { emailHash: { in: Array.from(hashToOriginal.keys()) } },
      select: { emailHash: true },
    });

    const suppressedHashes = new Set(suppressions.map((s) => s.emailHash));

    return {
      valid: emails.filter((e) => !suppressedHashes.has(blindIndex(e))),
      suppressed: emails.filter((e) => suppressedHashes.has(blindIndex(e))),
    };
  } catch (error) {
    throw transformError(error);
  }
}
