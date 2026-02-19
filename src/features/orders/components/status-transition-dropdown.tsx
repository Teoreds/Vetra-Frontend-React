import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { getValidTransitions, getStatusLabel } from "../types/order-status";

interface StatusTransitionDropdownProps {
  currentStatus: string;
  onTransition: (targetStatus: string) => void;
  disabled?: boolean;
}

export function StatusTransitionDropdown({
  currentStatus,
  onTransition,
  disabled,
}: StatusTransitionDropdownProps) {
  const validTransitions = getValidTransitions(currentStatus);

  if (validTransitions.length === 0) {
    return null;
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button disabled={disabled}>
          Move to
          <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-[180px] rounded-xl border border-border/60 bg-popover p-1.5 shadow-[0_8px_30px_-6px_rgba(0,0,0,0.15)]"
        >
          {validTransitions.map((status) => (
            <DropdownMenu.Item
              key={status}
              onClick={() => onTransition(status)}
              className="cursor-pointer rounded-lg px-3 py-2 text-[13px] outline-none transition-colors hover:bg-accent"
            >
              {getStatusLabel(status)}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
