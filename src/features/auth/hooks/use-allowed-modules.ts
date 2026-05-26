import { useMemo } from "react";
import { canAccessModule, type FrontendModuleCode } from "@/app/module-access";
import { useCurrentUser } from "./use-current-user";

export function useAllowedModules() {
  const currentUser = useCurrentUser();
  const allowedModules = useMemo(
    () => currentUser.data?.allowed_modules ?? [],
    [currentUser.data?.allowed_modules],
  );

  const moduleSet = useMemo(() => new Set(allowedModules), [allowedModules]);

  return {
    ...currentUser,
    allowedModules,
    moduleSet,
    canSee: (moduleCode?: FrontendModuleCode) =>
      canAccessModule(allowedModules, moduleCode),
  };
}
