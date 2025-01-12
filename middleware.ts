import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";

export async function middleware(request: NextRequest) {
  const session = await auth();

  if (!session && !request.nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  if (session && request.nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/documents", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/documents/:path*", "/admin/:path*", "/auth/:path*"],
};
