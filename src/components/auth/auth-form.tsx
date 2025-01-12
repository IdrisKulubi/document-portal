"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await signIn("email", {
        email: email,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email address");
        return;
      }

      if (result?.ok) {
        router.push("/documents");
        router.refresh();
      }
    } catch (error) {
      console.error("Error signing in", error);
      setError("An error occurred");
    }
  };

  return (
    <form onSubmit={handleSignIn}>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button type="submit">Sign In</button>
    </form>
  );
}
