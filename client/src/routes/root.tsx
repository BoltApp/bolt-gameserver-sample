import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

import GameLogo from "../assets/Character_l_Sample01.png";

export const rootRoute = createRootRoute({
  component: () => (
    <>
      <div className="app-container">
        <nav className="app-nav">
          <div className="nav-container">
            <div className="nav-brand">
              <Link to="/" className="nav-brand-link">
                <img src={GameLogo} alt="Game Logo" className="nav-logo" />
                Knights of Valor
              </Link>
            </div>
            <div className="nav-links">
              <Link
                to="/store"
                className="nav-link"
                activeProps={{ className: "active" }}>
                Royal Treasury
              </Link>
            </div>
          </div>
        </nav>
        <main className="app-main">
          <Outlet />
        </main>
        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-brand">
              <a
                href="https://help.bolt.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link">
                <img
                  src="https://help.bolt.com/images/brand/logo.svg"
                  alt="Bolt Logo"
                  className="footer-logo"
                />
              </a>
            </div>
            <div className="footer-links">
              <a
                href="https://help.bolt.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link">
                Help Docs
              </a>
              <a
                href="https://github.com/BoltApp/bolt-frontend-sdk"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link">
                Frontend SDK
              </a>
              <a
                href="https://github.com/BoltApp/bolt-unity-sdk"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link">
                Unity SDK
              </a>
              <a
                href="https://github.com/BoltApp/bolt-unreal-engine-sdk"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link">
                Unreal SDK
              </a>
            </div>
          </div>
        </footer>
      </div>
      {/* <TanStackRouterDevtools /> */}
    </>
  ),
});
