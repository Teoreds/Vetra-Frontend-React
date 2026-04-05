import { ArrowLeft } from "lucide-react";
import { Button } from "./button";
import { useBack } from "@/shared/hooks/use-back";

interface BackButtonProps {
  fallback: string;
  className?: string;
}

export function BackButton({ fallback, className }: BackButtonProps) {
  const back = useBack();
  return (
    <Button
      variant="ghost"
      size="icon"
      className={className ?? "h-8 w-8"}
      aria-label="Torna indietro"
      onClick={() => back(fallback)}
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );
}
