"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {  useSearchParams } from "next/navigation";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/documents";
  const error = searchParams.get("error");

  // Handle error messages
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description:
          error === "Callback"
            ? "There was a problem with the authentication process."
            : "An unexpected error occurred during authentication.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const result = await signIn("credentials", {
        email,
        redirect: true,
        callbackUrl,
      });

      toast({
        title: "Success",
        description: "Successfully signed in",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <Card className="w-[400px]">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">Sign In</h1>
          <p className="text-center text-muted-foreground">
            Enter your email to continue
          </p>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
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
