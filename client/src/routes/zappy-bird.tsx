import { createRoute, Outlet } from "@tanstack/react-router";
import { rootRoute } from "./root";
import ZappyBird from "../pages/ZappyBird";
import { ToastContainer } from "react-toastify";

export const zappyLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/zappy-bird",
  component: () => (
    <>
      <div className="app-container app-container--full-viewport">
        <main className="app-main app-main--full-viewport">
          <Outlet />
        </main>
      </div>
      <ToastContainer position="top-center" />
    </>
  ),
});

export const zappyBirdRoute = createRoute({
  getParentRoute: () => zappyLayoutRoute,
  path: "/",
  component: ZappyBird,
});