import { apiClient } from "@/shared/api/client";

export const authApi = {
  login: (username: string, password: string) =>
    apiClient.POST("/auth/login", {
      body: { username, password, scope: "" },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      bodySerializer(body) {
        const params = new URLSearchParams();
        for (const [key, val] of Object.entries(body as Record<string, unknown>)) {
          if (val != null) params.set(key, String(val));
        }
        return params.toString();
      },
    }),

  refresh: (refreshToken: string) =>
    apiClient.POST("/auth/refresh", {
      body: { refresh_token: refreshToken },
    }),

  me: () => apiClient.GET("/auth/me"),

  lookupTenant: (username: string) =>
    apiClient.GET("/auth/tenant", { params: { query: { username } } }),

  updateProfile: (body: {
    display_name?: string;
    email?: string;
    current_password?: string;
    new_password?: string;
  }) => apiClient.PATCH("/auth/me", { body }),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiClient.POST("/auth/me/avatar", {
      body: form as unknown as never,
      bodySerializer: (b) => b as unknown as FormData,
    });
  },

  deleteAvatar: () => apiClient.DELETE("/auth/me/avatar"),
};
