import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";

import "~/styles/globals.css";

import Head from "next/head";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import NavigationTransition from "~/components/Navigation/NavigationTransition";
import { DefaultSeo } from "next-seo";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

      <DefaultSeo
        openGraph={{
          type: "website",
          locale: "en_IE",
          siteName: "Eurovision Scoreboard",
        }}
        twitter={{
          handle: "@L0coloco",
          cardType: "summary",
        }}
        titleTemplate="%s | Eurovision Scoreboard"
      />

      <SessionProvider session={session}>
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{
            /** Put your mantine theme override here */
            colorScheme: "light",
          }}
        >
          <Notifications />
          <NavigationTransition />
          <Component {...pageProps} />
        </MantineProvider>
      </SessionProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
