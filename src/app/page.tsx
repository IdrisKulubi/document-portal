import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Search, Filter } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
              Document Management{" "}
              <span className="text-primary">Made Simple</span>
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Securely store, organize, and share your documents. Built with
              modern technologies for the best user experience.
            </p>
            <div className="space-x-4">
              <Link href="/documents">
                <Button size="lg" className="gap-2">
                  <FileText className="h-4 w-4" />
                  View Documents
                </Button>
              </Link>
              <Link href="/documents?upload=true">
                <Button size="lg" variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Document
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="container space-y-6 py-8 md:py-12 lg:py-24">
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <Upload className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Easy Upload</h3>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop your documents or use the file picker.
                    Supports PDF and Word documents.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <Search className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Smart Search</h3>
                  <p className="text-sm text-muted-foreground">
                    Quickly find documents with our powerful search
                    functionality.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <Filter className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Advanced Filters</h3>
                  <p className="text-sm text-muted-foreground">
                    Sort and filter documents by date, title, and status.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-8 md:py-12 lg:py-24">
          <div className="mx-auto max-w-[58rem] space-y-6 text-center">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              Ready to get started?
            </h2>
            <p className="leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Join us today and experience the future of document management.
            </p>
            <Link href="/documents">
              <Button size="lg" className="gap-2">
                <FileText className="h-4 w-4" />
                Get Started
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built with{" "}
              <a
                href="https://nextjs.org"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4"
              >
                Next.js
              </a>
              . The source code is available on{" "}
              <a
                href="https://github.com/yourusername/your-repo"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4"
              >
                GitHub
              </a>
              .
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
