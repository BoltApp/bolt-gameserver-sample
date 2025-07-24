export function Footer() {
  return (
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
            href="https://github.com/BoltApp/bolt-gameserver-sample"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link">
            Github
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
  );
}
