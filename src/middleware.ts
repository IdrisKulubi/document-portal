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

  // Handle auth pages (signin)
  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/documents", request.url));
    }
    return null;
  }

  // Handle protected routes
  if (!isAuth && (isDocumentsPage || isAdminPage)) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Handle admin routes
  if (isAdminPage && token?.role !== "admin") {
    return NextResponse.redirect(new URL("/documents", request.url));
  }

  return null;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets).*)"],
};
