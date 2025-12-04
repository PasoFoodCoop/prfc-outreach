import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname === "/referral-database") {
    const password = searchParams.get("pass");
    const correctPassword = process.env.DATABASE_PASSWORD;

    if (!correctPassword || password !== correctPassword) {
      return new NextResponse(null, { status: 404 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/referral-database"],
};
