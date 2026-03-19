export interface TenantTheme {
  colors: {
    primary: string;
    primaryForeground: string;
    primaryHover: string;
    primaryLight: string;
    ring: string;
    sidebarAccent: string;
    sidebarAccentForeground: string;
  };
}

export const TENANT_THEMES: Record<string, TenantTheme> = {
  "00000000-0000-0000-0000-000000000001": {
    colors: {
      primary: "#2563eb",
      primaryForeground: "#ffffff",
      primaryHover: "#1d4ed8",
      primaryLight: "#3b82f6",
      ring: "#2563eb",
      sidebarAccent: "#eff6ff",
      sidebarAccentForeground: "#1d4ed8",
    },
  },
  "00000000-0000-0000-0000-000000000002": {
    colors: {
      primary: "#991b1b",
      primaryForeground: "#ffffff",
      primaryHover: "#7f1d1d",
      primaryLight: "#b91c1c",
      ring: "#991b1b",
      sidebarAccent: "#fef2f2",
      sidebarAccentForeground: "#7f1d1d",
    },
  },
};

export const DEFAULT_THEME = TENANT_THEMES["00000000-0000-0000-0000-000000000001"];
