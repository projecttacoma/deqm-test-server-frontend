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
  Center,
} from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { ResourceCounts } from "../components/ResourceCounts";
import Link from "next/link";
import { textGray } from "../styles/appColors";

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
              <Navbar width={{ base: 320 }} height="100vh" p="xs">
                <Navbar.Section>
                  <Box
                    sx={(theme) => ({
                      backgroundColor: "white",
                      textAlign: "center",
                      paddingTop: "8px",
                      paddingBottom: "12px",
                      borderRadius: theme.radius.xs,
                      cursor: "pointer",
                    })}
                  >
                    <Text size="xl" weight={700} color={textGray}>
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
              <Header height={80} style={{ backgroundColor: "#bdebf0", color: textGray }}>
                <Center>
                  <Link href={"/"}>
                    <h1 style={{ marginTop: "12px", cursor: "pointer" }}>
                      DEQM Test Server Frontend
                    </h1>
                  </Link>
                </Center>
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
