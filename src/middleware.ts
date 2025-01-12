import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  const isAuth = !!token;
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin");
  const isDocumentsPage = request.nextUrl.pathname.startsWith("/documents");

  // Handle admin access
  if (isAdminPage) {
    if (!isAuth) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
    if (token?.role !== "admin") {
      return NextResponse.redirect(new URL("/documents", request.url));
    }
  }

  // Handle protected routes
  if (isDocumentsPage && !isAuth) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Handle auth pages
  if (isAuthPage && isAuth) {
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
    if (
      callbackUrl &&
      token?.role === "admin" &&
      callbackUrl.startsWith("/admin")
    ) {
      return NextResponse.redirect(new URL(callbackUrl, request.url));
    }
    return NextResponse.redirect(new URL("/documents", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/documents/:path*", "/admin/:path*", "/auth/:path*"],
};
