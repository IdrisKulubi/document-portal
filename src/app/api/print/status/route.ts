import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { jwtVerify, SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.PRINT_TOKEN_SECRET!);

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { printToken, status } = await req.json();

    // Verify the original print token
    const { payload } = await jwtVerify(printToken, secret);
    if (payload.action !== "print") {
      return new NextResponse("Invalid token", { status: 401 });
    }

    // Create a very short-lived token for actual printing (30 seconds)
    const printAccessToken = await new SignJWT({
      ...payload,
      status: "printing",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("30s")
      .sign(secret);

    return NextResponse.json({
      printAccessToken,
      documentId: payload.documentId,
    });
  } catch (error) {
    console.error("[PRINT_STATUS_ERROR]", error);
    return new NextResponse("Invalid request", { status: 400 });
  }
}
