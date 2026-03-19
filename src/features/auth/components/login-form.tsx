import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod/v4";
import { Button } from "@/shared/ui/button";
import { useLogin } from "../hooks/use-login";
import { authApi } from "../api/auth.api";
import { applyThemeToRoot, getCachedTenantGuid } from "@/shared/hooks/use-apply-tenant-theme";

const loginSchema = z.object({
  username: z.string().min(1, "Username obbligatorio"),
  password: z.string().min(1, "Password obbligatoria"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const login = useLogin();
  const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>({});
  const { register, handleSubmit, watch } = useForm<LoginFormValues>();

  // Apply cached theme immediately on mount
  useEffect(() => {
    applyThemeToRoot(getCachedTenantGuid());
  }, []);

  const username = watch("username");
  const [debouncedUsername, setDebouncedUsername] = useState("");

  useEffect(() => {
    if (!username || username.length < 2) {
      setDebouncedUsername("");
      return;
    }
    const timer = setTimeout(() => setDebouncedUsername(username), 500);
    return () => clearTimeout(timer);
  }, [username]);

  const tenantQuery = useQuery({
    queryKey: ["auth", "tenant", debouncedUsername],
    queryFn: async () => {
      const { data, error } = await authApi.lookupTenant(debouncedUsername);
      if (error) throw error;
      return data;
    },
    enabled: debouncedUsername.length >= 2,
    retry: false,
  });

  useEffect(() => {
    if (tenantQuery.data?.master_data_guid) {
      applyThemeToRoot(tenantQuery.data.master_data_guid);
    }
  }, [tenantQuery.data?.master_data_guid]);

  const onSubmit = (values: LoginFormValues) => {
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof LoginFormValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof LoginFormValues;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setValidationErrors(fieldErrors);
      return;
    }
    setValidationErrors({});
    login.mutate(parsed.data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="username" className="text-[13px] font-medium">
          Username
        </label>
        <input
          id="username"
          type="text"
          {...register("username")}
          className="flex h-9 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-[13px] outline-none transition-all placeholder:text-muted-foreground/50 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/20"
          placeholder="Inserisci il tuo username"
        />
        {validationErrors.username && (
          <p className="text-[12px] text-destructive">{validationErrors.username}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-[13px] font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          {...register("password")}
          className="flex h-9 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-[13px] outline-none transition-all placeholder:text-muted-foreground/50 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/20"
          placeholder="Inserisci la tua password"
        />
        {validationErrors.password && (
          <p className="text-[12px] text-destructive">{validationErrors.password}</p>
        )}
      </div>

      {login.error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2">
          <p className="text-[13px] text-destructive">Credenziali errate. Riprova.</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={login.isPending}>
        {login.isPending ? "Accedendo..." : "Accedi"}
      </Button>
    </form>
  );
}
