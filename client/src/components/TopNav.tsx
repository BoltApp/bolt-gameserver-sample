import { Link } from "@tanstack/react-router";
import { useFakeLogin, useUserProfile } from "../endpoints";

import GameLogo from "../assets/Character_l_Sample01.png";
import { GemIcon } from "./GemIcon";

export function TopNav() {
  const { data: userProfile, isLoading, error } = useUserProfile();
  const { mutate: fakeLogin, isPending } = useFakeLogin();

  async function handleSignIn() {
    fakeLogin();
  }

  return (
    <nav className="app-nav">
      <div className="nav-container">
        <div className="nav-left">
          <div className="nav-brand">
            <Link to="/" className="nav-brand-link">
              <img src={GameLogo} alt="Game Logo" className="nav-logo" />
              <span className="mobile-hidden">Knights of Valor</span>
            </Link>
          </div>
          <div className="nav-links mobile-hidden">
            <Link
              to="/store"
              className="nav-link"
              activeProps={{ className: "active" }}>
              Shop
            </Link>
            <Link
              to="/game"
              className="nav-link"
              activeProps={{ className: "active" }}>
              Game
            </Link>
          </div>
        </div>
        <div className="nav-user-info">
          {isLoading || isPending ? (
            <div className="nav-loading">Loading...</div>
          ) : error || !userProfile ? (
            <button className="nav-signin-btn" onClick={handleSignIn}>
              Sign In
            </button>
          ) : (
            <div className="nav-user-profile">
              <div className="nav-username">{userProfile.username}</div>
              <div className="nav-gems">
                <GemIcon size={24} /> {userProfile.gems}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
