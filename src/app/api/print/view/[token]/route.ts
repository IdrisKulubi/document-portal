import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.PRINT_TOKEN_SECRET!);

export async function GET(req: Request, props: { params: Promise<{ token: string }> }) {
  const params = await props.params;
  try {
    const { payload } = await jwtVerify(params.token, secret);
    if (payload.action !== "print" || payload.status !== "printing") {
      return new NextResponse("Invalid token", { status: 401 });
    }

    const response = await fetch(payload.fileUrl as string);
    const pdfBuffer = await response.arrayBuffer();

    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    headers.set(
      "Content-Security-Policy",
      "default-src 'self'; object-src 'none'; script-src 'none'"
    );
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Content-Disposition", "inline");
    headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private"
    );
    headers.set("X-Frame-Options", "SAMEORIGIN");
    headers.set("Permissions-Policy", "download=()");

    return new NextResponse(pdfBuffer, { headers });
  } catch (error) {
    console.error("[PRINT_VIEW_ERROR]", error);
    return new NextResponse("Invalid or expired print token", { status: 401 });
  }
}
