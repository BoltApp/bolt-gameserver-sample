import { createRoute } from "@tanstack/react-router";
import ZappyBird from "../pages/ZappyBird";
import { rootRoute } from "./root";

export function GamePage() {
  return <ZappyBird />;
}

export const zappyBirdRoute = createRoute({
  path: "/zappy-bird",
  component: GamePage,
  getParentRoute: () => rootRoute,
});