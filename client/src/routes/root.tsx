import { createRootRoute, Outlet, createRoute } from '@tanstack/react-router';

import { ToastContainer } from "react-toastify";

import { TopNav } from "../components/TopNav";
import { DemoTabs } from "../components/DemoTabs";
import { Footer } from "../components/Footer";


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
        <DemoTabs />
        <TopNav />
        <main className="app-main">
          <Outlet />
        </main>
        <Footer />
      </div>
      <ToastContainer position="top-center" />
    </>
  ),
});
