"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AuthError() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");

  useEffect(() => {
    console.error("[AUTH_ERROR_PAGE]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <Card className="w-[400px]">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center text-red-500">
            Authentication Error
          </h1>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            {error === "Callback"
              ? "There was a problem with the authentication process."
              : "An unexpected error occurred during authentication."}
          </p>
          <div className="flex justify-center">
            <Button
              onClick={() => router.push("/auth/signin")}
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
