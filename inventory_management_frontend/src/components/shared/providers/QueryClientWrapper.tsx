import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { JSX } from "react";

const queryClient = new QueryClient();

const QueryClientWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  return <QueryClientProvider client={queryClient} children={children} />;
};

export default QueryClientWrapper;
