import { AppProps } from "next/app";
import Head from "next/head";
import { AppShell, Header, MantineProvider, Navbar, ScrollArea } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { ResourceCounts } from "../components/ResourceCounts";

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <>
      <Head>
        <title>Test server frontend</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: "light",
        }}
      >
        <NotificationsProvider position="top-center">
          <AppShell
            padding="md"
            navbar={
              <Navbar width={{ base: 280 }} p="xs">
                <Navbar.Section grow component={ScrollArea} mt="-xs" mb="-xs" ml="-xl" mr="-xs">
                  <ResourceCounts />
                </Navbar.Section>
              </Navbar>
            }
            header={
              <Header height={80} pt="xs" pl="sm" pb="xs">
                <h2>DEQM Test Server Frontend</h2>
              </Header>
            }
            styles={(theme) => ({
              main: {
                backgroundColor: theme.colors.gray[0],
              },
            })}
          >
            <Component {...pageProps} />
          </AppShell>
        </NotificationsProvider>
      </MantineProvider>
    </>
  );
}
