export type FrontendModuleCode =
  | "orders"
  | "warehouse"
  | "shipping"
  | "parties"
  | "articles"
  | "documents"
  | "mail"
  | "quotes"
  | "settings";

const DEFAULT_MODULE_PATHS: Partial<Record<FrontendModuleCode, string>> = {
  orders: "/dashboard",
  warehouse: "/pick-notes",
  shipping: "/shipments",
  quotes: "/quotes",
  parties: "/parties",
  articles: "/articles",
  settings: "/admin",
};

const DEFAULT_MODULE_ORDER: FrontendModuleCode[] = [
  "orders",
  "warehouse",
  "shipping",
  "quotes",
  "parties",
  "articles",
  "settings",
];

export function getDefaultPath(allowedModules: readonly string[] | undefined): string {
  if (!allowedModules?.length) return "/profile";

  for (const moduleCode of DEFAULT_MODULE_ORDER) {
    if (allowedModules.includes(moduleCode)) {
      return DEFAULT_MODULE_PATHS[moduleCode] ?? "/profile";
    }
  }

  return "/profile";
}

export function canAccessModule(
  allowedModules: readonly string[] | undefined,
  moduleCode?: FrontendModuleCode,
): boolean {
  return !moduleCode || Boolean(allowedModules?.includes(moduleCode));
}
