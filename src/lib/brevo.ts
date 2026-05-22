import "server-only";
import { env } from "@/env";
import { AppError } from "@/utils/errors";
import type { BrevoEmailPayload, BrevoSendResult } from "@/types/email";

export type { BrevoEmailPayload, BrevoSendResult } from "@/types/email";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export async function sendBrevoEmail(payload: BrevoEmailPayload): Promise<BrevoSendResult> {
  const apiKey = env.BREVO_API_KEY;
  if (!apiKey) {
    throw new AppError("INTERNAL_ERROR", "Brevo API key is not configured");
  }

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      code: "unknown",
      message: `HTTP ${response.status}`,
    }));

    if (response.status === 429) {
      throw new AppError("QUOTA_EXCEEDED", `Daily email limit reached: ${error.message}`);
    }

    throw new AppError("EMAIL_ERROR", `Email send failed: ${error.code} - ${error.message}`);
  }

  const data: { messageId: string } = await response.json();
  const remainingHeader = response.headers.get("x-sib-ratelimit-remaining");
  const remaining = remainingHeader !== null ? parseInt(remainingHeader, 10) : null;

  return { messageId: data.messageId, remaining: Number.isNaN(remaining) ? null : remaining };
}
