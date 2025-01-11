"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteUser, updateUserAdmin } from "@/lib/actions/users";
import type { User } from "@/lib/actions/users";
import { MoreHorizontal } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface UserListProps {
  users: User[];
}

export function UserList({ users }: UserListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [deleteTimer, setDeleteTimer] = useState<NodeJS.Timeout | null>(null);

  const startDeleteCountdown = (userId: string) => {
    setDeleteConfirm(userId);
    setCountdown(5);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setDeleteTimer(timer);
  };

  const cancelDelete = () => {
    if (deleteTimer) clearInterval(deleteTimer);
    setDeleteConfirm(null);
    setCountdown(5);
  };

  const handleDelete = async (userId: string) => {
    try {
      const result = await deleteUser(userId);
      toast({
        title: "Success",
        description: result.message,
        variant: "default",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      cancelDelete();
    }
  };

  const handleUpdate = async (userId: string, data: Partial<User>) => {
    setUpdating(userId);
    try {
      const result = await updateUserAdmin(userId, data);
      toast({
        title: "Success",
        description: result.message,
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onValueChange={(value) =>
                    handleUpdate(user.id, { role: value })
                  }
                  disabled={updating === user.id}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Switch
                  checked={user.isActive}
                  onCheckedChange={(checked) =>
                    handleUpdate(user.id, { isActive: checked })
                  }
                  disabled={updating === user.id}
                />
              </TableCell>
              <TableCell>
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "N/A"}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => startDeleteCountdown(user.id)}
                      className="text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => cancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Deleting in {countdown} seconds...
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={countdown > 0}
            >
              {countdown > 0 ? `Delete (${countdown})` : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
