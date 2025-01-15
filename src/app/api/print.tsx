import { NextResponse } from "next/server";
import { auth } from "@/auth";
import printerAddon from "../../../native-addon/build/Release/printerAddon";
import db from "@/db/drizzle";
import { documents } from "@/db/schema";
import { eq } from "drizzle-orm";

async function getDocumentById(id: string) {
  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);
  return document;
}

interface PrintRequest {
  documentId: string;
  printer: string;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = (await req.json()) as PrintRequest;
    const { documentId, printer } = data;

    // Get document path from your storage
    const document = await getDocumentById(documentId);
    console.log(document);
    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    // Send to printer using the C++ addon
    const jobId = printerAddon.printDocument(document.fileUrl, printer);

    return NextResponse.json({ jobId });
  } catch (error) {
    console.error("[PRINT_ERROR]", error);
    return new NextResponse("Print failed", { status: 500 });
  }
}

export async function GET() {
  try {
    const printers = printerAddon.getPrinters();
    return NextResponse.json(printers);
  } catch (error) {
    console.error("[GET_PRINTERS_ERROR]", error);
    console.log(error);
    return new NextResponse("Failed to get printers", { status: 500 });
  }
}
