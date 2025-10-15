import { createRoute } from "@tanstack/react-router";
import Game from "../pages/Game";
import { rootRoute } from "./root";

export function GamePage() {
  return <Game />;
}

export const gameRoute = createRoute({
  path: "/game",
  component: GamePage,
  getParentRoute: () => rootRoute,
});
