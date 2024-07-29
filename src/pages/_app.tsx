import BaseLayout from "@/components/layout/BaseLayout";
import { ContestContextProvider } from "@/components/module/ContestContext";
import { authTokenAtom } from "@/components/states";
import "@/styles/globals.css";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { getDefaultStore } from "jotai";
import { HTTPError } from "ky-universal";
import { NextPage } from "next";
import type { AppProps } from "next/app";
import React, { ReactElement, ReactNode } from "react";
import { Toaster } from "react-hot-toast";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchOnMount: false,
            refetchInterval: 10000,
          },
        },
        queryCache: new QueryCache({
          onError(error, query) {
            if (error instanceof HTTPError) {
              if (
                error.response.status === 403 ||
                error.response.status === 401 ||
                error.response.status === 422
              ) {
                const jotaiStore = getDefaultStore();
                jotaiStore.set(authTokenAtom, "");
              }
            }
          },
        }),
      })
  );
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <ContestContextProvider>
        {getLayout(
          <BaseLayout>
            <Component {...pageProps} />
          </BaseLayout>
        )}
      </ContestContextProvider>
    </QueryClientProvider>
  );
}
