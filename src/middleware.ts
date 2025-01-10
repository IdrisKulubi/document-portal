import { NextResponse, type NextRequest } from "next/server";
import { auth } from "../auth";

export default async function middleware(request: NextRequest) {
  const session = await auth();
  const isAuth = !!session;
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin");

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/documents", request.url));
    }
    return null;
  }

  if (!isAuth) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  if (isAdminPage && session?.user?.role !== "admin") {
    return NextResponse.redirect(new URL("/documents", request.url));
  }

  return null;
}

export const config = {
  matcher: ["/documents/:path*", "/admin/:path*", "/auth/:path*"],
};
