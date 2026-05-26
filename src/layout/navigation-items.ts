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

export interface NavigationItem {
  to: string;
  label: string;
  icon: LucideIcon;
  moduleCode?: FrontendModuleCode;
}

export const mainNavigationItems: NavigationItem[] = [
  { to: "/dashboard", label: "Cruscotto", icon: LayoutDashboard, moduleCode: "orders" },
  { to: "/quotes", label: "Preventivi", icon: FileText, moduleCode: "quotes" },
  { to: "/orders", label: "Ordini", icon: ShoppingCart, moduleCode: "orders" },
  { to: "/pick-notes", label: "Note Prelievo", icon: ClipboardList, moduleCode: "warehouse" },
  { to: "/shipments", label: "Spedizioni", icon: Truck, moduleCode: "shipping" },
  { to: "/parties", label: "Anagrafiche", icon: Users, moduleCode: "parties" },
  { to: "/articles", label: "Articoli", icon: Package, moduleCode: "articles" },
];

export const bottomNavigationItems: NavigationItem[] = [
  { to: "/admin", label: "Centro di Controllo", icon: SlidersHorizontal, moduleCode: "settings" },
];
