import { createRootRoute, Outlet, createRoute } from "@tanstack/react-router";

import { ToastContainer } from "react-toastify";

import { TopNav } from "../components/TopNav";

export const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Standard layout route
export const standardLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "standard",
  component: () => (
    <>
      <div className="app-container">
        <TopNav />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
      <ToastContainer position="top-center" />
    </>
  ),
});
