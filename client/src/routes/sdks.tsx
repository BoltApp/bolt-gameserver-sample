import { createRoute } from "@tanstack/react-router";
import { standardLayoutRoute } from "./root";
import { DevelopmentSDKs } from "../pages/sdks/DeveloperSDKs";

export function SDKsPage() {
  return <DevelopmentSDKs />;
}

export const sdksRoute = createRoute({
  path: "/sdks",
  component: SDKsPage,
  getParentRoute: () => standardLayoutRoute,
});
