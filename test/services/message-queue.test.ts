import "../mocks/prisma";
import "../mocks/email-quota";
import "../mocks/email";
import "../mocks/email-suppression";
import "../mocks/unsubscribe-tokens";
import "../mocks/member-api";
import "../mocks/sms-consent-service";

import { vi } from "vitest";

vi.mock("@/services/sms", () => ({
  sendGroupSms: vi.fn(),
  validateSmsAllowed: vi.fn(),
  isQuietHours: vi.fn().mockReturnValue(false),
}));

import { mockPrisma } from "../mocks/prisma";
import { mockReserveEmailQuota } from "../mocks/email-quota";
import { processEmailQueue } from "@/services/message";

describe("processEmailQueue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns zeros when no queued recipients exist", async () => {
    mockPrisma.messageRecipient.findMany.mockResolvedValue([]);

    const result = await processEmailQueue();

    expect(result).toEqual({ sent: 0, failed: 0, remaining: 0 });
    expect(mockReserveEmailQuota).not.toHaveBeenCalled();
  });

  it("returns remaining count when quota is exhausted", async () => {
    mockPrisma.messageRecipient.findMany.mockResolvedValue([
      { id: 1, messageId: 10, memberId: 100001 } as never,
      { id: 2, messageId: 10, memberId: 100002 } as never,
    ]);
    mockReserveEmailQuota.mockResolvedValue({ allowed: 0, total: 300 });

    const result = await processEmailQueue();

    expect(result).toEqual({ sent: 0, failed: 0, remaining: 2 });
    expect(mockPrisma.message.findUnique).not.toHaveBeenCalled();
  });
});
