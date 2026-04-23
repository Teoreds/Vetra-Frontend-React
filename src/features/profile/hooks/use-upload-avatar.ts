import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/auth.api";
import { authKeys } from "@/features/auth/api/auth.queries";

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const { data, error } = await authApi.uploadAvatar(file);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me(), data);
    },
  });
}
