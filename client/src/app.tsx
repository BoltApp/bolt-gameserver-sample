import { QueryClient } from "@tanstack/react-query";
import "./app.css";
import { homeRoute } from "./routes/home";
import { rootRoute } from "./routes/root";
import { microTransactionStoreRoute } from "./routes/store";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

const routeTree = rootRoute.addChildren([
  homeRoute,
  microTransactionStoreRoute,
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

export function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}>
      <RouterProvider router={router} />
    </PersistQueryClientProvider>
  );
}
