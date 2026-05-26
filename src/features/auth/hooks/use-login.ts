import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getDefaultPath } from "@/app/module-access";
import { authApi } from "../api/auth.api";
import { authKeys } from "../api/auth.queries";
import { useAuthStore } from "./use-auth-store";

export function useLogin() {
  const setTokens = useAuthStore((s) => s.setTokens);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const { data, error } = await authApi.login(
        credentials.username,
        credentials.password,
      );
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      if (data) {
        setTokens(data.access_token, data.refresh_token);
        const { data: user, error } = await authApi.me();
        if (!error && user) {
          queryClient.setQueryData(authKeys.me(), user);
          navigate(getDefaultPath(user.allowed_modules), { replace: true });
          return;
        }
        navigate("/", { replace: true });
      }
    },
  });
}
