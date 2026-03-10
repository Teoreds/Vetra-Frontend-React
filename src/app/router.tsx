import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/layout/app-layout";
import { AuthLayout } from "@/layout/auth-layout";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { GuestGuard } from "@/features/auth/components/guest-guard";
import { LoginPage } from "@/features/auth/pages/login-page";
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page";
import { OrderListPage } from "@/features/orders/pages/order-list-page";
import { OrderDetailPage } from "@/features/orders/pages/order-detail-page";
import { NewOrderPage } from "@/features/orders/pages/new-order-page";
import { OrderWizardPage } from "@/features/orders/pages/order-wizard-page";
import { PartiesListPage } from "@/features/parties/pages/parties-list-page";
import { PartyDetailPage } from "@/features/parties/pages/party-detail-page";
import { NewPartyPage } from "@/features/parties/pages/new-party-page";
import { ArticlesListPage } from "@/features/articles/pages/articles-list-page";
import { ArticleDetailPage } from "@/features/articles/pages/article-detail-page";
import { NewArticlePage } from "@/features/articles/pages/new-article-page";
import { WarehousesListPage } from "@/features/warehouses/pages/warehouses-list-page";
import { WarehouseDetailPage } from "@/features/warehouses/pages/warehouse-detail-page";

export const router = createBrowserRouter([
  {
    element: <GuestGuard />,
    children: [
      {
        element: <AuthLayout />,
        children: [{ path: "/login", element: <LoginPage /> }],
      },
    ],
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/orders", element: <OrderListPage /> },
          { path: "/orders/new", element: <NewOrderPage /> },
          { path: "/orders/:id", element: <OrderDetailPage /> },
          { path: "/orders/:id/edit", element: <OrderWizardPage /> },
          { path: "/parties", element: <PartiesListPage /> },
          { path: "/parties/new", element: <NewPartyPage /> },
          { path: "/parties/:id", element: <PartyDetailPage /> },
          { path: "/articles", element: <ArticlesListPage /> },
          { path: "/articles/new", element: <NewArticlePage /> },
          { path: "/articles/:id", element: <ArticleDetailPage /> },
          { path: "/warehouses", element: <WarehousesListPage /> },
          { path: "/warehouses/:id", element: <WarehouseDetailPage /> },
        ],
      },
    ],
  },
]);
