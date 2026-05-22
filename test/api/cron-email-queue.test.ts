import { vi } from "vitest";

const { mockProcessEmailQueue, mockEnv } = vi.hoisted(() => ({
  mockProcessEmailQueue: vi.fn(),
  mockEnv: {
    CRON_SECRET: "test-cron-secret" as string | undefined,
  },
}));

vi.mock("@/services/message", () => ({
  processEmailQueue: mockProcessEmailQueue,
}));

vi.mock("@/env", () => ({
  env: mockEnv,
}));

import { GET } from "@/app/api/cron/process-email-queue/route";
import { NextRequest } from "next/server";

describe("GET /api/cron/process-email-queue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnv.CRON_SECRET = "test-cron-secret";
  });

  it("returns 401 when CRON_SECRET is not configured", async () => {
    mockEnv.CRON_SECRET = undefined;

    const req = new NextRequest("http://localhost/api/cron/process-email-queue");
    const res = await GET(req);

    expect(res.status).toBe(401);
    expect(mockProcessEmailQueue).not.toHaveBeenCalled();
  });

  it("returns 401 when auth header is missing", async () => {
    const req = new NextRequest("http://localhost/api/cron/process-email-queue");
    const res = await GET(req);

    expect(res.status).toBe(401);
    expect(mockProcessEmailQueue).not.toHaveBeenCalled();
  });

  it("returns 401 when auth header is wrong", async () => {
    const req = new NextRequest("http://localhost/api/cron/process-email-queue", {
      headers: { authorization: "Bearer wrong-secret" },
    });
    const res = await GET(req);

    expect(res.status).toBe(401);
    expect(mockProcessEmailQueue).not.toHaveBeenCalled();
  });

  it("returns 200 with queue results when auth header matches", async () => {
    mockProcessEmailQueue.mockResolvedValue({ sent: 5, failed: 1, remaining: 3 });

    const req = new NextRequest("http://localhost/api/cron/process-email-queue", {
      headers: { authorization: "Bearer test-cron-secret" },
    });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ sent: 5, failed: 1, remaining: 3 });
    expect(mockProcessEmailQueue).toHaveBeenCalledOnce();
  });
});
