"use client";

import { use } from "react";
import PrintHandler from "@/components/pdf/PrintHandler";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function PrintPage({ params }: PageProps) {
  const resolvedParams = use(params);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <PrintHandler printToken={resolvedParams.token} />
    </div>
  );
}
