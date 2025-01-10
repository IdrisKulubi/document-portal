import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorCardProps {
  title?: string;
  description?: string;
  retry?: () => void;
}

export function ErrorCard({
  title = "Something went wrong",
  description = "There was an error loading this content. Please try again later.",
  retry,
}: ErrorCardProps) {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {retry && (
        <CardContent>
          <Button onClick={retry} variant="outline">
            Try Again
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
