import { createRoute } from "@tanstack/react-router";
import { standardLayoutRoute } from "./root";
import Products from "../pages/products/Products";

export function ProductsPage() {
  return <Products />;
}

export const productsRoute = createRoute({
  path: "/",
  component: ProductsPage,
  getParentRoute: () => standardLayoutRoute,
});
