import {
  ClipboardList,
  FileText,
  LayoutDashboard,
  Package,
  ShoppingCart,
  SlidersHorizontal,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { FrontendModuleCode } from "@/app/module-access";

export type NavigationSection = "OPERATIVITÀ" | "ANAGRAFICA";

export interface NavigationItem {
  to: string;
  label: string;
  icon: LucideIcon;
  moduleCode?: FrontendModuleCode;
  section?: NavigationSection;
}

export const mainNavigationItems: NavigationItem[] = [
  { to: "/dashboard", label: "Cruscotto", icon: LayoutDashboard, moduleCode: "orders", section: "OPERATIVITÀ" },
  { to: "/quotes", label: "Preventivi", icon: FileText, moduleCode: "quotes", section: "OPERATIVITÀ" },
  { to: "/orders", label: "Ordini", icon: ShoppingCart, moduleCode: "orders", section: "OPERATIVITÀ" },
  { to: "/pick-notes", label: "Note Prelievo", icon: ClipboardList, moduleCode: "warehouse", section: "OPERATIVITÀ" },
  { to: "/shipments", label: "Spedizioni", icon: Truck, moduleCode: "shipping", section: "OPERATIVITÀ" },
  { to: "/parties", label: "Anagrafiche", icon: Users, moduleCode: "parties", section: "ANAGRAFICA" },
  { to: "/articles", label: "Articoli", icon: Package, moduleCode: "articles", section: "ANAGRAFICA" },
];

export const bottomNavigationItems: NavigationItem[] = [
  { to: "/admin", label: "Centro di Controllo", icon: SlidersHorizontal, moduleCode: "settings" },
];
