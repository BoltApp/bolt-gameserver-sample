import { QueryClient } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

import "./app.css";
import "./vendor.css";

import { rootRoute, standardLayoutRoute } from "./routes/root";
import { zappyBirdRoute, zappyLayoutRoute } from "./routes/zappy-bird";
import { useUserProfile } from "./endpoints";
import { useBoltSessionVerification } from "./hooks/useBoltSessionVerification";
import { productsRoute } from "./routes/products";

const routeTree = rootRoute.addChildren([
  standardLayoutRoute.addChildren([productsRoute]),
  zappyLayoutRoute.addChildren([zappyBirdRoute]),
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: window.localStorage,
});

type SessionManagementProps = {
  children: React.ReactNode;
};

function SessionManagement({ children }: SessionManagementProps) {
  const { data: userProfile, isLoading, error } = useUserProfile();

  const isLoggedIn = !isLoading && !error && !!userProfile;
  useBoltSessionVerification(isLoggedIn);

  return <>{children}</>;
}

export function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}>
      <SessionManagement>
        <RouterProvider router={router} />
      </SessionManagement>
    </PersistQueryClientProvider>
  );
}
