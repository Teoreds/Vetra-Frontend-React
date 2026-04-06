import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/layout/app-layout";
import { AuthLayout } from "@/layout/auth-layout";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { GuestGuard } from "@/features/auth/components/guest-guard";
import { RouteErrorPage } from "./route-error-page";
import { NotFoundPage } from "./not-found-page";
import { LazyPage } from "./lazy-page";

// Lazy-loaded pages for code splitting
const LoginPage = lazy(() => import("@/features/auth/pages/login-page").then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import("@/features/dashboard/pages/dashboard-page").then((m) => ({ default: m.DashboardPage })));
const OrderListPage = lazy(() => import("@/features/orders/pages/order-list-page").then((m) => ({ default: m.OrderListPage })));
const OrderDetailPage = lazy(() => import("@/features/orders/pages/order-detail-page").then((m) => ({ default: m.OrderDetailPage })));
const NewOrderPage = lazy(() => import("@/features/orders/pages/new-order-page").then((m) => ({ default: m.NewOrderPage })));
const OrderWizardPage = lazy(() => import("@/features/orders/pages/order-wizard-page").then((m) => ({ default: m.OrderWizardPage })));
const PartiesListPage = lazy(() => import("@/features/parties/pages/parties-list-page").then((m) => ({ default: m.PartiesListPage })));
const PartyDetailPage = lazy(() => import("@/features/parties/pages/party-detail-page").then((m) => ({ default: m.PartyDetailPage })));
const NewPartyPage = lazy(() => import("@/features/parties/pages/new-party-page").then((m) => ({ default: m.NewPartyPage })));
const PartyEditPage = lazy(() => import("@/features/parties/pages/party-edit-page").then((m) => ({ default: m.PartyEditPage })));
const ArticlesListPage = lazy(() => import("@/features/articles/pages/articles-list-page").then((m) => ({ default: m.ArticlesListPage })));
const ArticleDetailPage = lazy(() => import("@/features/articles/pages/article-detail-page").then((m) => ({ default: m.ArticleDetailPage })));
const ArticleEditPage = lazy(() => import("@/features/articles/pages/article-edit-page").then((m) => ({ default: m.ArticleEditPage })));
const NewArticlePage = lazy(() => import("@/features/articles/pages/new-article-page").then((m) => ({ default: m.NewArticlePage })));
const PickNoteListPage = lazy(() => import("@/features/pick-notes/pages/pick-note-list-page").then((m) => ({ default: m.PickNoteListPage })));
const NewPickNotePage = lazy(() => import("@/features/pick-notes/pages/new-pick-note-page").then((m) => ({ default: m.NewPickNotePage })));
const PickNoteDetailPage = lazy(() => import("@/features/pick-notes/pages/pick-note-detail-page").then((m) => ({ default: m.PickNoteDetailPage })));
const ShipmentsListPage = lazy(() => import("@/features/shipments/pages/shipments-list-page").then((m) => ({ default: m.ShipmentsListPage })));
const AdminPage = lazy(() => import("@/features/admin/pages/admin-page").then((m) => ({ default: m.AdminPage })));
const QuoteListPage = lazy(() => import("@/features/quotes/pages/quote-list-page").then((m) => ({ default: m.QuoteListPage })));
const QuoteDetailPage = lazy(() => import("@/features/quotes/pages/quote-detail-page").then((m) => ({ default: m.QuoteDetailPage })));
const QuoteWizardPage = lazy(() => import("@/features/quotes/pages/quote-wizard-page").then((m) => ({ default: m.QuoteWizardPage })));

function lz(Page: React.LazyExoticComponent<React.ComponentType>) {
  return <LazyPage><Page /></LazyPage>;
}

export const router = createBrowserRouter([
  {
    element: <GuestGuard />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <AuthLayout />,
        children: [{ path: "/login", element: lz(LoginPage) }],
      },
    ],
  },
  {
    element: <AuthGuard />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "/dashboard", element: lz(DashboardPage) },
          { path: "/orders", element: lz(OrderListPage) },
          { path: "/orders/new", element: lz(NewOrderPage) },
          { path: "/orders/:id", element: lz(OrderDetailPage) },
          { path: "/orders/:id/edit", element: lz(OrderWizardPage) },
          { path: "/parties", element: lz(PartiesListPage) },
          { path: "/parties/new", element: lz(NewPartyPage) },
          { path: "/parties/:id", element: lz(PartyDetailPage) },
          { path: "/parties/:id/edit", element: lz(PartyEditPage) },
          { path: "/articles", element: lz(ArticlesListPage) },
          { path: "/articles/new", element: lz(NewArticlePage) },
          { path: "/articles/:id", element: lz(ArticleDetailPage) },
          { path: "/articles/:id/edit", element: lz(ArticleEditPage) },
          { path: "/pick-notes", element: lz(PickNoteListPage) },
          { path: "/pick-notes/new", element: lz(NewPickNotePage) },
          { path: "/pick-notes/:id", element: lz(PickNoteDetailPage) },
          { path: "/quotes", element: lz(QuoteListPage) },
          { path: "/quotes/new", element: lz(QuoteWizardPage) },
          { path: "/quotes/:id", element: lz(QuoteDetailPage) },
          { path: "/quotes/:id/edit", element: lz(QuoteWizardPage) },
          { path: "/shipments", element: lz(ShipmentsListPage) },
          { path: "/admin", element: lz(AdminPage) },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
