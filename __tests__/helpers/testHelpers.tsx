/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColorSchemeProvider, MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { RecoilRoot } from "recoil";

export function mantineRecoilWrap(children: JSX.Element) {
  return (
    <ColorSchemeProvider
      colorScheme="light"
      toggleColorScheme={() => {
        void 0;
      }}
    >
      <RecoilRoot>
        <MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme: "light" }}>
          <NotificationsProvider position="top-center">{children}</NotificationsProvider>
        </MantineProvider>
      </RecoilRoot>
    </ColorSchemeProvider>
  );
}

/*
 * Generate a mock implementation for `fetch` with any desired 200 OK response
 * Use any type to avoid writing out every property of `fetch` responses
 */
export function getMockFetchImplementation(desiredResponse: any) {
  return jest.fn(
    () =>
      Promise.resolve({
        json: jest.fn().mockResolvedValue(desiredResponse),
      }) as any,
  );
}

/*
 * Generate a mock implementation that rejects a `fetch` call with a specific error
 */
export function getMockFetchImplementationError(errorMessage: string) {
  return jest.fn(() => Promise.reject(new Error(errorMessage)));
}
