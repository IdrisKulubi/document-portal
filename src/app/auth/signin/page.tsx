"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/documents"); // Ensure redirection is handled by Next.js router
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);

    try {
      console.log("Session status:", status);
      const result = await signIn("credentials", {
        email,
        redirect: false,
      });
      console.log("SignIn result:", result);

      if (result?.error) {
        toast({
          title: "Access Denied",
          description: "You are not authorized to access this application.",
          variant: "destructive",
        });
      } else if (result?.ok) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        router.replace("/documents"); // Changed from window.location.href to router.replace
      }
    } catch (error) {
      console.error("SignIn error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If already authenticated, don't render the sign-in form
  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <Card className="w-[400px] relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={() => router.push("/")}
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">Sign In</h1>
          <p className="text-center text-muted-foreground">
            Enter your email to continue
          </p>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? "Signing in..." : "Continue with Email"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
