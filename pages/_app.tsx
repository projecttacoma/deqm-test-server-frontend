import { AppProps } from "next/app";
import Head from "next/head";
import { AppShell, Header, MantineProvider, Navbar } from "@mantine/core";
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
              <Navbar width={{ base: 300 }} height={800} p="xs">
                <ResourceCounts> </ResourceCounts>
              </Navbar>
            }
            header={
              <Header height={80} p="xs">
                <h2>DEQM Test Server Frontend</h2>
              </Header>
            }
            styles={(theme) => ({
              main: {
                backgroundColor:
                  theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[0],
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
