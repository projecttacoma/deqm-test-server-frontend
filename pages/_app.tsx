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
import { appHeader, textGray } from "../styles/appColors";
import { CountProvider } from "../components/CountContext";

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <>
      <Head>
        <title>Test server frontend</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <NotificationsProvider position="top-center">
          <CountProvider>
            <AppShell
              padding="md"
              navbar={
                <Navbar width={{ base: "20vw" }} height="92vh" p="xs">
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
                      <Text size="xl" weight={700} color={textGray} style={{ height: "40px" }}>
                        Resources
                      </Text>
                    </Box>
                  </Navbar.Section>
                  <Divider my="sm" style={{ paddingBottom: "16px" }} />
                  <Navbar.Section grow component={ScrollArea} mt="-xs" mb="-xs" ml="-xl" mr="-xs">
                    <ResourceCounts />
                  </Navbar.Section>
                </Navbar>
              }
              header={
                <Header height={80} style={{ backgroundColor: appHeader, color: textGray }}>
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
          </CountProvider>
        </NotificationsProvider>
      </MantineProvider>
    </>
  );
}
