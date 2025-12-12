import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ACCESS_COOKIE = "prfc_database_access";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname.startsWith("/referral-database")) {
    const hasAccess = request.cookies.get(ACCESS_COOKIE);

    if (hasAccess?.value === "verified") {
      return NextResponse.next();
    }

    const password = searchParams.get("pass");
    const correctPassword = process.env.DATABASE_PASSWORD;

    if (password && correctPassword && password === correctPassword) {
      const url = request.nextUrl.clone();
      url.searchParams.delete("pass");

      const response = NextResponse.redirect(url, { status: 302 });
      response.cookies.set(ACCESS_COOKIE, "verified", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 28800,
        path: "/",
      });

      return response;
    }

    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
