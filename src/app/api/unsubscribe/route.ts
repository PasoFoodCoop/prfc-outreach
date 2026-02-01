import { NextRequest, NextResponse } from "next/server";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-tokens";
import prisma from "@/lib/db";
import { transformError, errorStatusMap } from "@/utils/errors";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    const verification = verifyUnsubscribeToken(token);

    if (!verification.valid) {
      return NextResponse.json({ error: verification.error }, { status: 400 });
    }

    const { memberId, groupId } = verification;

    await prisma.contactGroupMember.updateMany({
      where: {
        memberId: memberId!,
        groupId: groupId!,
      },
      data: {
        notifyEmail: false,
        unsubscribedAt: new Date(),
        unsubscribeMethod: "one-click",
      },
    });

    const userAgent = request.headers.get("user-agent") || "";
    const isEmailClient =
      userAgent.includes("curl") || userAgent.includes("PostmanRuntime") || userAgent.includes("Mozilla") === false;

    if (isEmailClient) {
      return new NextResponse(null, { status: 204 });
    }

    return new NextResponse(
      `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Unsubscribed</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 600px;
              margin: 100px auto;
              padding: 20px;
              text-align: center;
            }
            h1 { color: #831002; }
            p { color: #666; line-height: 1.6; }
            a { color: #831002; text-decoration: none; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <h1>You've been unsubscribed</h1>
          <p>You will no longer receive emails from this group.</p>
          <p>If this was a mistake, please contact the group administrator to re-subscribe.</p>
        </body>
      </html>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      },
    );
  } catch (error) {
    const appError = transformError(error);
    const status = errorStatusMap[appError.code] || 500;
    console.error("[UNSUBSCRIBE_ERROR]", appError.message, appError.context);
    return NextResponse.json({ error: appError.message }, { status });
  }
}
