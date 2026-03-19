import { useState, useEffect } from "react";
import { Package } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { env } from "@/config/env";
import { useAuthStore } from "@/features/auth/hooks/use-auth-store";

interface AuthImageProps {
  src: string | null;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
}

export function AuthImage({ src, alt = "", className, fallbackClassName }: AuthImageProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setObjectUrl(null);
    setError(false);

    if (!src) return;

    let revoked = false;
    const token = useAuthStore.getState().accessToken;

    fetch(`${env.API_BASE_URL}${src}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.blob();
      })
      .then((blob) => {
        if (revoked) return;
        const url = URL.createObjectURL(blob);
        setObjectUrl(url);
      })
      .catch(() => {
        if (!revoked) setError(true);
      });

    return () => {
      revoked = true;
      setObjectUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [src]);

  if (!src || error || !objectUrl) {
    return (
      <div className={cn("flex items-center justify-center bg-muted/50", fallbackClassName ?? className)}>
        <Package className="h-1/3 w-1/3 text-muted-foreground/40" />
      </div>
    );
  }

  return (
    <img
      src={objectUrl}
      alt={alt}
      className={cn("object-cover", className)}
    />
  );
}
