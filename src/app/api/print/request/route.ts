import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { jwtVerify } from "jose";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";

const secret = new TextEncoder().encode(process.env.PRINT_TOKEN_SECRET!);

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { printToken, mode } = await req.json();
    const { payload } = await jwtVerify(printToken, secret);

    // Get the original PDF
    const response = await fetch(payload.fileUrl as string);
    const pdfBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);

    if (mode === "preview") {
      // Return preview image
      const pages = await pdfDoc.saveAsBase64();
      const image = await sharp(Buffer.from(pages, "base64"))
        .png({ quality: 70, compressionLevel: 9 })
        .toBuffer();

      return new NextResponse(image, {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": "inline",
        },
      });
    } else {
      // Return actual PDF for printing
      const modifiedPdf = await pdfDoc.save();
      return new NextResponse(modifiedPdf, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "inline",
        },
      });
    }
  } catch (error) {
    console.error("[PRINT_REQUEST_ERROR]", error);
    return new NextResponse("Print failed", { status: 500 });
  }
}
