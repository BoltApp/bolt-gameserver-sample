import { createRootRoute, Outlet, useRouterState } from "@tanstack/react-router";

import { ToastContainer } from "react-toastify";

import { TopNav } from "../components/TopNav";
import { DemoTabs } from "../components/DemoTabs";
import { Footer } from "../components/Footer";

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isZappyBird = pathname === "/zappy-bird";

  return (
    <>
      <div className={`app-container${isZappyBird ? " app-container--full-viewport" : ""}`}>
        {!isZappyBird && (
          <>
            <DemoTabs />
            <TopNav />
          </>
        )}

        <main className={`app-main${isZappyBird ? " app-main--full-viewport" : ""}`}>
          <Outlet />
        </main>

        {!isZappyBird && <Footer />}
      </div>
      <ToastContainer position="top-center" />
    </>
  );
}

export const rootRoute = createRootRoute({
  component: RootLayout,
});
