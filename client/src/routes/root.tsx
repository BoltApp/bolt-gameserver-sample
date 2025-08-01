import { createRootRoute, Outlet } from "@tanstack/react-router";

import { ToastContainer } from "react-toastify";

import { TopNav } from "../components/TopNav";
import { Footer } from "../components/Footer";

export const rootRoute = createRootRoute({
  component: () => (
    <>
      <div className="app-container">
        <TopNav />

        <main className="app-main">
          <Outlet />
        </main>

        <Footer />
      </div>
      <ToastContainer position="top-center" />
      {/* <TanStackRouterDevtools /> */}
    </>
  ),
});
