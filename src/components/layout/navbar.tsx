"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b bg-background">
      <div className="container flex h-16 items-center px-4">
        <Link href="/" className="font-bold">
          {window.location.pathname === "/admin" ? "Admin Dashboard" : "Document Manager"}
        </Link>
        <div className="ml-auto flex items-center space-x-4">
          {session ? (
            <>
              {session.user.role === "admin" && (
                <Link href="/admin">
                  <Button variant="ghost">
                    {window.location.pathname !== "/admin" && "Admin"}
                  </Button>
                </Link>
              )}
              {window.location.pathname !== "/documents" && (
                <Link href="/documents">
                  <Button variant="ghost">Documents</Button>
                </Link>
              )}
              <Button
                variant="ghost"
                onClick={() => signOut()}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar>
                    <AvatarFallback>
                      {session.user.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => signOut()}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/auth/signin">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
