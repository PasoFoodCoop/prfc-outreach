import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/env";
import { verifySession } from "@/lib/dal";
import { getMemberById } from "@/lib/api/member-api";
import { AppError, apiErrorHandler } from "@/utils/errors";

function createMembersRateLimiter() {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    prefix: "prfc:members",
  });
}

const rateLimiter = createMembersRateLimiter();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (rateLimiter) {
      const forwarded = req.headers.get("x-forwarded-for");
      const ip = forwarded?.split(",")[0]?.trim() ?? "127.0.0.1";
      const { success, remaining, reset } = await rateLimiter.limit(ip);

      if (!success) {
        return NextResponse.json(
          { error: { code: "RATE_LIMITED", message: "Too many requests" } },
          {
            status: 429,
            headers: {
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
            },
          },
        );
      }
    }

    await verifySession();

    const { id } = await params;
    const memberId = parseInt(id, 10);

    if (isNaN(memberId)) {
      throw new AppError("VALIDATION_ERROR", "Invalid member ID format");
    }

    const member = await getMemberById(memberId);

    if (!member) {
      throw new AppError("NOT_FOUND", "Member not found");
    }

    return NextResponse.json(member, {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return apiErrorHandler(error);
  }
}
