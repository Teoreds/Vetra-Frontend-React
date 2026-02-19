import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "./use-auth-store";

export function useLogin() {
  const setTokens = useAuthStore((s) => s.setTokens);
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
    onSuccess: (data) => {
      if (data) {
        setTokens(data.access_token, data.refresh_token);
        navigate("/dashboard");
      }
    },
  });
}
