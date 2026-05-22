import { vi } from "vitest";

vi.mock("@/env", () => ({
  env: {
    BREVO_API_KEY: "test-api-key",
  },
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import { sendBrevoEmail } from "@/lib/brevo";

const payload = {
  sender: { name: "Test", email: "test@example.com" },
  to: [{ email: "recipient@example.com" }],
  subject: "Test",
  htmlContent: "<p>Test</p>",
};

describe("sendBrevoEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns messageId and remaining on success", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ messageId: "abc-123" }),
      headers: new Headers({ "x-sib-ratelimit-remaining": "212" }),
    });

    const result = await sendBrevoEmail(payload);

    expect(result.messageId).toBe("abc-123");
    expect(result.remaining).toBe(212);
  });

  it("returns remaining as null when header is missing", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ messageId: "abc-123" }),
      headers: new Headers(),
    });

    const result = await sendBrevoEmail(payload);

    expect(result.messageId).toBe("abc-123");
    expect(result.remaining).toBeNull();
  });

  it("throws QUOTA_EXCEEDED on 429", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
      json: () => Promise.resolve({ code: "rate_limit", message: "Daily limit reached" }),
      headers: new Headers(),
    });

    await expect(sendBrevoEmail(payload)).rejects.toMatchObject({
      code: "QUOTA_EXCEEDED",
    });
  });

  it("throws EMAIL_ERROR on 500", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ code: "server_error", message: "Internal error" }),
      headers: new Headers(),
    });

    await expect(sendBrevoEmail(payload)).rejects.toMatchObject({
      code: "EMAIL_ERROR",
    });
  });

  it("throws INTERNAL_ERROR when API key is missing", async () => {
    const { env } = await import("@/env");
    const original = env.BREVO_API_KEY;
    (env as Record<string, unknown>).BREVO_API_KEY = undefined;

    await expect(sendBrevoEmail(payload)).rejects.toMatchObject({
      code: "INTERNAL_ERROR",
    });

    (env as Record<string, unknown>).BREVO_API_KEY = original;
  });

  it("throws EMAIL_ERROR when response body is not JSON", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.reject(new Error("not json")),
      headers: new Headers(),
    });

    await expect(sendBrevoEmail(payload)).rejects.toMatchObject({
      code: "EMAIL_ERROR",
    });
  });
});
