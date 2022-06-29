import { AppProps } from "next/app";
import Head from "next/head";
import {
  AppShell,
  Header,
  MantineProvider,
  Navbar,
  ScrollArea,
  Text,
  Box,
  Divider,
} from "@mantine/core";
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
              <Navbar width={{ base: 320 }}  height="100vh" p="xs">
                <Navbar.Section>
                  <Box
                    sx={(theme) => ({
                      backgroundColor: "white",
                      textAlign: "center",
                      padding: theme.spacing.md,
                      borderRadius: theme.radius.xs,
                      cursor: "pointer",
                    })}
                  >
                    <Text size="xl" weight={700} color="#4a4f4f">
                      Resources
                    </Text>
                  </Box>
                </Navbar.Section>
                <Divider my="sm" style={{ paddingBottom: "15px" }} />
                <Navbar.Section grow component={ScrollArea} mt="-xs" mb="-xs" ml="-xl" mr="-xs">
                  <ResourceCounts />
                </Navbar.Section>
              </Navbar>
            }
            header={
              <Header
                height={80}
                pt="xs"
                pl="sm"
                pb="xs"
                style={{ backgroundColor: "#bdebf0", color: "#4a4f4f" }}
              >
                <h2 style={{ textAlign: "center" }}>DEQM Test Server Frontend</h2>
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
