import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { authKeys } from "../api/auth.queries";
import { useAuthStore } from "./use-auth-store";

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const { data, error } = await authApi.me();
      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated,
  });
}
