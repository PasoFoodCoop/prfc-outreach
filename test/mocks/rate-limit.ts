import { vi } from "vitest";

const mockLimit = vi.fn().mockResolvedValue({
  success: true,
  remaining: 4,
  reset: Date.now() + 60000,
});

const mockMembersLimit = vi.fn().mockResolvedValue({
  success: true,
  remaining: 9,
  reset: Date.now() + 60000,
});

const mockMessageSendLimit = vi.fn().mockResolvedValue({
  success: true,
  remaining: 4,
  reset: Date.now() + 60000,
});

vi.mock("@/lib/rate-limit", () => ({
  rateLimiter: {
    limit: mockLimit,
  },
  membersRateLimiter: {
    limit: mockMembersLimit,
  },
  messageSendLimiter: {
    limit: mockMessageSendLimit,
  },
}));

beforeEach(() => {
  mockLimit.mockClear();
  mockLimit.mockResolvedValue({
    success: true,
    remaining: 4,
    reset: Date.now() + 60000,
  });
  mockMembersLimit.mockClear();
  mockMembersLimit.mockResolvedValue({
    success: true,
    remaining: 9,
    reset: Date.now() + 60000,
  });
  mockMessageSendLimit.mockClear();
  mockMessageSendLimit.mockResolvedValue({
    success: true,
    remaining: 4,
    reset: Date.now() + 60000,
  });
});

export {
  mockLimit as mockRateLimiter,
  mockMembersLimit as mockMembersRateLimiter,
  mockMessageSendLimit as mockMessageSendLimiter,
};
