import { createRoute, Link } from "@tanstack/react-router";
import { rootRoute } from "./root";

import Chest from "../assets/chest.png";
import ChestOpen from "../assets/chest-open.png";
import CastleScene from "../assets/castle-bg.png";
import { useState } from "preact/hooks";

function Home() {
  const [isChestOpen, setChestOpen] = useState(false);
  return (
    <div className="index-page" style={{ "--home-bg": `url(${CastleScene})` }}>
      <div className="app-header">
        <h1>⚔️ Bolt Demo Store ⚔️</h1>
        <p>Store to showcase Bolt Charge SDK</p>
      </div>

      <div className="app-content">
        <div className="demo-card">
          <h2>
            <img
              src={isChestOpen ? ChestOpen : Chest}
              alt="Chest Icon"
              className="icon"
            />
            Royal Treasury
          </h2>
          <p>Acquire precious gems to enhance thy power and prestige</p>
          <Link
            to="/store"
            className="demo-button"
            onMouseDown={() => setChestOpen(true)}
            onDragEnter={() => setChestOpen(false)}>
            Enter Treasury
          </Link>
        </div>
      </div>

      <footer className="app-footer"></footer>
    </div>
  );
}

export const homeRoute = createRoute({
  path: "/",
  component: Home,
  getParentRoute: () => rootRoute,
});
