"use client";

import React from "react";
import { QueryClientProvider as TanstackQueryProvider } from "@tanstack/react-query";
import { getQueryClient } from "~/lib/tanstack-query/get-query-client";

export function QueryClientProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = getQueryClient();

  return (
    <TanstackQueryProvider client={queryClient}>
      {children}
    </TanstackQueryProvider>
  );
}
