import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!token || token.role !== "admin") {
      return NextResponse.redirect(new URL("/documents", request.url));
    }
  }

  // Protect document routes
  if (request.nextUrl.pathname.startsWith("/documents")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith("/auth") && token) {
    return NextResponse.redirect(new URL("/documents", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/documents/:path*", "/admin/:path*", "/auth/:path*"],
};
