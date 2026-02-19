import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./schema";
import { env } from "@/config/env";
import { useAuthStore } from "@/features/auth/hooks/use-auth-store";

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  },
  async onResponse({ response }) {
    if (response.status === 401) {
      const store = useAuthStore.getState();
      if (store.refreshToken) {
        const refreshed = await refreshTokens(store.refreshToken);
        if (refreshed) {
          return; // middleware will retry
        }
      }
      store.logout();
      window.location.href = "/login";
    }
    return response;
  },
};

async function refreshTokens(refreshToken: string): Promise<boolean> {
  try {
    const res = await fetch(`${env.API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as {
      access_token: string;
      refresh_token: string;
    };
    useAuthStore.getState().setTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

export const apiClient = createClient<paths>({
  baseUrl: env.API_BASE_URL,
});

apiClient.use(authMiddleware);
