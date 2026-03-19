import { AuthImage } from "@/shared/ui/auth-image";
import { cn } from "@/shared/lib/utils";

const AVATAR_COLORS = [
  { bg: "bg-primary/12", text: "text-primary" },
  { bg: "bg-emerald-500/12", text: "text-emerald-600" },
  { bg: "bg-violet-500/12", text: "text-violet-600" },
  { bg: "bg-amber-500/12", text: "text-amber-600" },
  { bg: "bg-rose-500/12", text: "text-rose-600" },
  { bg: "bg-cyan-500/12", text: "text-cyan-600" },
  { bg: "bg-indigo-500/12", text: "text-indigo-600" },
  { bg: "bg-orange-500/12", text: "text-orange-600" },
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface PartyAvatarProps {
  partyGuid: string;
  name: string;
  imagePath?: string | null;
  className?: string;
  textClassName?: string;
}

export function PartyAvatar({ partyGuid, name, imagePath, className, textClassName }: PartyAvatarProps) {
  if (imagePath) {
    return (
      <AuthImage
        src={`/parties/${partyGuid}/image`}
        alt={name}
        className={cn("rounded-full object-cover", className)}
        fallbackClassName={cn("rounded-full", className)}
      />
    );
  }

  const color = getAvatarColor(name);
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        color.bg,
        color.text,
        className,
        textClassName,
      )}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
