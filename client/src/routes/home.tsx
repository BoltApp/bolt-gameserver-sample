import { createRoute, Link } from "@tanstack/react-router";
import { rootRoute } from "./root";

import Chest from "../assets/chest.png";
import ChestOpen from "../assets/chest-open.png";
import CastleScene from "../assets/castle-bg.png";
import Character from "../assets/Character_l_Sample01.png";
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
        <div className="demo-card game-card">
          <h2>
            <img src={Character} alt="Character Icon" className="icon" />
            Epic Adventure
          </h2>
          <p>Embark on a thrilling quest and test thy skills in battle</p>
          <Link to="/game" className="demo-button">
            Play Game
          </Link>
        </div>
        <div className="demo-card treasury-card">
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
