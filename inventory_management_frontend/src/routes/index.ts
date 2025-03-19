import { createBrowserRouter } from "react-router-dom";
import Login from "@/pages/auth/login/Index";
import Register from "@/pages/auth/register/Index";
import AuthLayout from "@/layouts/AuthLayout";
import NotFound from "@/pages/root/_404/Index";
import Dashboard from "@/pages/root/dashboard/Index";
import ProductType from "@/pages/root/product_type/Index";
import Product from "@/pages/root/Items/Index";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AuthLayout,
    children: [
      {
        path: "/",
        Component: Login,
      },
      {
        path: "/register",
        Component: Register,
      },
    ],
  },
  {
    path: "dashboard",
    Component: Dashboard,
  },
  {
    path: "/dashboard/products/types",
    Component: ProductType,
  },
  {
    path: "/dashboard/products/items",
    Component: Product,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
