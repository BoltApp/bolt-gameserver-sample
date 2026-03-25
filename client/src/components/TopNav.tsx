import { Link } from "@tanstack/react-router";

import BoltLightningGames from "../assets/lightning-games.svg";

import styles from "./TopNav.module.css";

export function TopNav() {
  return (
    <nav className={styles.topNav}>
      <div className={styles.navContainer}>
        <div className={styles.navLeft}>
          <div className={styles.navBrand}>
            <Link to="/" className={styles.navBrandLink}>
              <img
                src={BoltLightningGames}
                alt="Game Logo"
                className={styles.navLogo}
              />
            </Link>
          </div>
          <div className={`${styles.navLinks}`}>
            <Link
              to="/"
              className={styles.navLink}
              activeProps={{ className: styles.active }}>
              Products
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
