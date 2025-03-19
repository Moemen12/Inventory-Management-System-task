import { createRoot } from "react-dom/client";
import "./index.css";
import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/index.ts";
import QueryClientWrapper from "./components/shared/providers/QueryClientWrapper.tsx";

createRoot(document.getElementById("root")!).render(
  <QueryClientWrapper>
    <Toaster />
    <RouterProvider router={router} />
  </QueryClientWrapper>
);
