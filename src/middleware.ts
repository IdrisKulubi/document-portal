import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  console.log('Token:', token);

  const isAuth = !!token;
  const path = request.nextUrl.pathname;

  console.log('Path:', path);

  // Handle authentication routes
  if (path.startsWith("/auth/signin")) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/documents", request.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  if (path.startsWith("/documents")) {
    if (!isAuth) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  // Admin routes
  if (path.startsWith("/admin")) {
    if (!isAuth || token?.role !== "admin") {
      return NextResponse.redirect(new URL("/documents", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/documents/:path*", "/admin/:path*", "/auth/signin"],
};
