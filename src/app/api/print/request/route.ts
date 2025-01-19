import { NextResponse } from "next/server";
import { auth } from "@/auth";
import puppeteer from "puppeteer";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.PRINT_TOKEN_SECRET!);

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { printToken } = await req.json();

    // Verify the print token
    const { payload } = await jwtVerify(printToken, secret);
    if (payload.action !== "print" || !payload.fileUrl) {
      return new NextResponse("Invalid token", { status: 401 });
    }

    // Launch Puppeteer with additional security options
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-extensions",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();

    // Set additional headers and cookies if needed
    await page.setExtraHTTPHeaders({
      Authorization: `Bearer ${session.user.id}`,
    });

    // Load the document with a timeout
    await page.goto(payload.fileUrl as string, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Add watermark and other security features
    await page.evaluate(() => {
      const watermark = document.createElement("div");
      watermark.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 60px;
        opacity: 0.2;
        pointer-events: none;
        z-index: 1000;
        color: #000;
      `;
      watermark.textContent = "CONFIDENTIAL";
      document.body.appendChild(watermark);
    });

    // Generate PDF with security options
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%; padding: 0 10px;">
          Printed by ${session.user.email} on ${new Date().toLocaleString()}
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%; padding: 0 10px;">
          Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `,
      margin: {
        top: "2cm",
        bottom: "2cm",
        left: "1cm",
        right: "1cm",
      },
    });

    await browser.close();

    // Set secure headers for the response
    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    headers.set("Content-Disposition", "inline");
    headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private"
    );
    headers.set("Pragma", "no-cache");
    headers.set("Expires", "0");

    return new NextResponse(pdf, { headers });
  } catch (error) {
    console.error("[PRINT_REQUEST_ERROR]", error);
    return new NextResponse(
      "Print failed: " +
        (error instanceof Error ? error.message : "Unknown error"),
      { status: 500 }
    );
  }
}
