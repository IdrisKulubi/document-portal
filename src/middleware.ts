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

  // Redirect authenticated users trying to access auth pages
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL("/documents", request.url));
  }

  // Redirect unauthenticated users to sign in
  if (!isAuth && (isDocumentsPage || isAdminPage)) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // Redirect non-admin users trying to access admin pages
  if (isAdminPage && token?.role !== "admin") {
    return NextResponse.redirect(new URL("/documents", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/documents/:path*", "/admin/:path*", "/auth/:path*"],
};
