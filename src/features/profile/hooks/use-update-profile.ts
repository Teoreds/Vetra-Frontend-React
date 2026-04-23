import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/auth.api";
import { authKeys } from "@/features/auth/api/auth.queries";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: {
      display_name?: string;
      email?: string;
      current_password?: string;
      new_password?: string;
    }) => {
      const { data, error } = await authApi.updateProfile(body);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me(), data);
    },
  });
}
