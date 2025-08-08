import { render } from "preact";
import "./index.css";
import { App } from "./app.tsx";
import { BoltSDK } from "@boltpay/bolt-js";

BoltSDK.initialize({
  publishableKey: import.meta.env.VITE_BOLT_PUBLISHABLE_KEY,
  gameId: import.meta.env.VITE_GAME_ID,
  environment: "Development",
});

render(<App />, document.getElementById("app")!);
