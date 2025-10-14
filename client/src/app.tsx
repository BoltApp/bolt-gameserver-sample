import { QueryClient } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

import "./app.css";
import "./vendor.css";

import { homeRoute } from "./routes/home";
import { rootRoute } from "./routes/root";
import { microTransactionStoreRoute } from "./routes/store";
import { gameRoute } from "./routes/game";

import { useUserProfile } from "./endpoints";
import { useBoltSessionVerification } from "./hooks/useBoltSessionVerification";

const routeTree = rootRoute.addChildren([
  homeRoute,
  microTransactionStoreRoute,
  gameRoute,
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
