/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColorSchemeProvider, MantineProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { RecoilRoot } from "recoil";
import { NextRouter } from "next/router";

export function createMockRouter(router: Partial<NextRouter>): NextRouter {
  return {
    basePath: "",
    pathname: "/",
    route: "/",
    query: {},
    asPath: "/",
    back: jest.fn(),
    beforePopState: jest.fn(),
    prefetch: jest.fn().mockImplementation(() => Promise.resolve()),
    push: jest.fn().mockImplementation(() => Promise.resolve(true)),
    reload: jest.fn(),
    replace: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isLocaleDomain: false,
    isFallback: false,
    isReady: true,
    defaultLocale: "en",
    isPreview: false,
    ...router,
  };
}

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

/**
 * Generate a mock implementation for `fetch` with any desired response of a Promise that resolves.
 * Use any type to avoid writing out every property of `fetch` responses
 * @param desiredResponse is the response that the returned Promise is resolved to
 * @param desiredStatus optional, for specifying the status code. Default is 200
 * @param desiredStatusText optional, for specifying the status text
 */
export function getMockFetchImplementation(
  desiredResponse: any,
  desiredStatus?: number,
  desiredStatusText?: string,
) {
  return jest.fn(() => {
    return Promise.resolve({
      json: jest.fn().mockResolvedValue(desiredResponse),
      status: desiredStatus ? desiredStatus : 200,
      statusText: desiredStatusText,
    }) as any;
  });
}

/*
 * Generate a mock implementation that rejects a `fetch` call with a specific error
 */
export function getMockFetchImplementationError(errorMessage: string) {
  return jest.fn(() => Promise.reject(new Error(errorMessage)));
}

export const mockResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

/**
 * Returns a Range object set up for a document that contains a CodeMirror component.
 * Necessary when unit testing with CodeMirror component.
 */
export const createRectRange = () => {
  const range = new Range();

  range.getBoundingClientRect = jest.fn();

  range.getClientRects = () => {
    return {
      item: () => null,
      length: 0,
      [Symbol.iterator]: jest.fn(),
    };
  };

  return range;
};
