import { Link } from "@tanstack/react-router";

import BoltIcon from "../../assets/bolt.svg";
import BoltLightningGames from "../../assets/lightning-games.svg";

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
                className={styles.navLogoFull}
              />
              <img
                src={BoltIcon}
                alt="Game Logo"
                className={styles.navLogoIcon}
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
            <Link
              to="/sdks"
              className={styles.navLink}
              activeProps={{ className: styles.active }}>
              Development SDKs
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
