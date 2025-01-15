"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface PrintButtonProps {
  documentId: string;
}

export function PrintButton({ documentId }: PrintButtonProps) {
  const [printers, setPrinters] = useState<string[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>("");
  const [isPrinting, setIsPrinting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPrinters();
  }, []);

  const fetchPrinters = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/print");
      if (!response.ok) throw new Error("Failed to get printers");

      const printerList = await response.json();
      setPrinters(printerList);
    } catch (error) {
      console.error("Fetch printers error:", error);
      toast({
        title: "Error",
        description: "No printers found. Please check your printer connection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = async () => {
    if (!selectedPrinter) return;

    setIsPrinting(true);
    try {
      const response = await fetch("/api/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          printer: selectedPrinter,
        }),
      });

      if (!response.ok) throw new Error("Print failed");

      toast({
        title: "Success",
        description: "Document sent to printer",
      });
    } catch (error) {
      console.error("Print error:", error);
      toast({
        title: "Error",
        description: "Failed to print document",
        variant: "destructive",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedPrinter} onValueChange={setSelectedPrinter}>
        <SelectTrigger className="w-[200px]" disabled={isLoading}>
          <SelectValue
            placeholder={isLoading ? "Loading printers..." : "Select printer"}
          />
        </SelectTrigger>
        <SelectContent>
          {printers.length === 0 ? (
            <SelectItem value="none" disabled>
              No printers available
            </SelectItem>
          ) : (
            printers.map((printer) => (
              <SelectItem key={printer} value={printer}>
                {printer}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={handlePrint}
        disabled={!selectedPrinter || isPrinting || isLoading}
      >
        <Printer className="h-4 w-4" />
        {isPrinting ? "Printing..." : "Print"}
      </Button>
    </div>
  );
}
