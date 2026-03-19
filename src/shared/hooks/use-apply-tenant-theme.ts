import { useEffect } from "react";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { TENANT_THEMES, DEFAULT_THEME, type TenantTheme } from "@/config/tenant-themes";

const CSS_VAR_MAP: Record<keyof TenantTheme["colors"], string> = {
  primary: "--color-primary",
  primaryForeground: "--color-primary-foreground",
  primaryHover: "--color-primary-hover",
  primaryLight: "--color-primary-light",
  ring: "--color-ring",
  sidebarAccent: "--color-sidebar-accent",
  sidebarAccentForeground: "--color-sidebar-accent-foreground",
};

const TENANT_GUID_STORAGE_KEY = "tenant-theme-guid";

export function applyThemeToRoot(masterDataGuid: string | null | undefined) {
  const resolvedGuid = masterDataGuid ?? getCachedTenantGuid();
  const theme =
    (resolvedGuid ? TENANT_THEMES[resolvedGuid] : null) ?? DEFAULT_THEME;

  if (masterDataGuid) {
    localStorage.setItem(TENANT_GUID_STORAGE_KEY, masterDataGuid);
  }

  const root = document.documentElement;
  const vars = Object.entries(CSS_VAR_MAP) as [keyof TenantTheme["colors"], string][];

  for (const [key, cssVar] of vars) {
    root.style.setProperty(cssVar, theme.colors[key]);
  }
}

export function getCachedTenantGuid(): string | null {
  return localStorage.getItem(TENANT_GUID_STORAGE_KEY);
}

export function resetThemeOnRoot() {
  const root = document.documentElement;
  for (const cssVar of Object.values(CSS_VAR_MAP)) {
    root.style.removeProperty(cssVar);
  }
}

export function useApplyTenantTheme() {
  const { data: user } = useCurrentUser();

  useEffect(() => {
    applyThemeToRoot(user?.master_data_guid);

    return () => {
      resetThemeOnRoot();
    };
  }, [user?.master_data_guid]);
}
