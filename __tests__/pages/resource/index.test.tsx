import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  getMockFetchImplementation,
  createMockRouter,
  getMockFetchImplementationError,
} from "../../helpers/testHelpers";
import ResourceTypeIDs from "../../../pages/[resourceType]";
import { RouterContext } from "next/dist/shared/lib/router-context";
import { fhirJson } from "@fhir-typescript/r4-core";

const ID_BODY_ONE_PAGE: fhirJson.Bundle = {
  resourceType: "Bundle",
  meta: {
    lastUpdated: "2022-06-23T19:52:58.721Z",
  },
  type: "searchset",
  total: 2,
  link: [
    {
      relation: "self",
      url: "http://localhost:3000/4_0_1/Library",
    },
    {
      relation: "first",
      url: "http://localhost:3000/4_0_1/Library?page=1",
    },
    {
      relation: "last",
      url: "http://localhost:3000/4_0_1/Library?page=1",
    },
  ],
  entry: [
    {
      fullUrl: "http://localhost:3000/4_0_1/Library/denom-EXM125-3",
      resource: {
        resourceType: "Library",
        id: "denom-EXM125-3",
        meta: {
          profile: [
            "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note",
          ],
        },
      },
    },
    {
      fullUrl: "http://localhost:3000/4_0_1/Library/numer-EXM125-3",
      resource: {
        resourceType: "Library",
        id: "numer-EXM125-3",
        meta: {
          profile: [
            "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note",
          ],
        },
      },
    },
  ],
};

const ID_BODY_2_PAGES: fhirJson.Bundle = {
  resourceType: "Bundle",
  meta: {
    lastUpdated: "2022-06-23T19:52:58.721Z",
  },
  type: "searchset",
  total: 20,
  link: [
    {
      relation: "self",
      url: "http://localhost:3000/4_0_1/Library",
    },
    {
      relation: "first",
      url: "http://localhost:3000/4_0_1/Library?page=1",
    },
    {
      relation: "next",
      url: "http://localhost:3000/4_0_1/Library?page=2",
    },
    {
      relation: "last",
      url: "http://localhost:3000/4_0_1/Library?page=2",
    },
  ],
  entry: [
    {
      fullUrl: "http://localhost:3000/4_0_1/Library/denom-EXM125-3",
      resource: {
        resourceType: "Library",
        id: "denom-EXM125-3",
      },
    },
    {
      fullUrl: "http://localhost:3000/4_0_1/Library/numer-EXM125-3",
      resource: {
        resourceType: "Library",
        id: "numer-EXM125-3",
      },
    },
  ],
};

const RESOURCE_BODY_ZERO_COUNT = {
  resourceType: "Bundle",
  meta: {
    lastUpdated: "2022-06-27T15:18:52.234Z",
  },
  type: "searchset",
  total: 0,
};

const RESOURCE_BODY_EMPTY_ENTRY = {
  resourceType: "Bundle",
  meta: {
    lastUpdated: "2022-06-27T15:18:52.234Z",
  },
  type: "searchset",
  total: 8,
  entry: [],
};

describe("resource ID button render, no pagination", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(ID_BODY_ONE_PAGE);
  });

  it("should render resource IDs but no search pagination", async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { resourceType: "Library" },
          })}
        >
          <ResourceTypeIDs />
        </RouterContext.Provider>,
      );
    });

    expect(
      await screen.findByRole("button", { name: "Library/denom-EXM125-3" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "Library/numer-EXM125-3" }),
    ).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "Create New Library" })).toBeInTheDocument();

    //resource ID navigation should not be rendered
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
  afterAll(() => {
    jest.clearAllMocks();
  });
});

describe("resource ID valid search pagination render", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(ID_BODY_2_PAGES);
  });

  it("when no page is specified in router, page 1 is active by default", async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { resourceType: "Library" },
          })}
        >
          <ResourceTypeIDs />
        </RouterContext.Provider>,
      );
    });

    //page 1 button should be "current" because no page was specified by the router
    expect(screen.getByRole("button", { name: "1", current: "page" })).toBeInTheDocument();

    //resource ID buttons should be rendered based on the fetch response
    expect(
      await screen.findByRole("button", { name: "Library/denom-EXM125-3" }),
    ).toBeInTheDocument();
  });

  it("when page 1 is specified in router, page 1 is active", async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { resourceType: "Library", page: "1" },
          })}
        >
          <ResourceTypeIDs />
        </RouterContext.Provider>,
      );
    });

    //page 1 button should be "current" because page=1 was specified by the router
    expect(screen.getByRole("button", { name: "1", current: "page" })).toBeInTheDocument();

    //resource ID buttons should be rendered based on the fetch response
    expect(
      await screen.findByRole("button", { name: "Library/denom-EXM125-3" }),
    ).toBeInTheDocument();
  });

  it("when page >1 is specified in router, that page is active", async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { resourceType: "Library", page: "2" },
          })}
        >
          <ResourceTypeIDs />
        </RouterContext.Provider>,
      );
    });

    //page 2 button should be "current"
    const page2Button = screen.getByRole("button", { name: "2", current: "page" });
    expect(page2Button).toBeInTheDocument();

    //resource ID buttons should be rendered based on the fetch response
    expect(
      await screen.findByRole("button", { name: "Library/denom-EXM125-3" }),
    ).toBeInTheDocument();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });
});

describe("Resource ID render when page number is invalid", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(RESOURCE_BODY_EMPTY_ENTRY);
  });

  it("should render No resources found message", async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { resourceType: "Library", page: "3" },
          })}
        >
          <ResourceTypeIDs />
        </RouterContext.Provider>,
      );
    });

    //when ResourceIDs is given a json body with an empty entry array, a no resources found message is rendered
    expect(await screen.findByText("No resources found")).toBeInTheDocument();

    //resource ID navigation should not be rendered
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });
});

describe("Tests for when the 'No resource found message' should display", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(RESOURCE_BODY_ZERO_COUNT);
  });

  it("should display 'No resources found' on the screen because the resource's count is zero", async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { resourceType: "Account" },
          })}
        >
          <ResourceTypeIDs />
        </RouterContext.Provider>,
      );
    });
    expect(await screen.findByText("No resources found")).toBeInTheDocument();
  });
  afterAll(() => {
    jest.clearAllMocks();
  });
});

describe("error response test", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementationError("Problem connecting to server");
  });

  it("should show error notification when there is an issue sending a request to the server", async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: {},
          })}
        >
          <ResourceTypeIDs />
        </RouterContext.Provider>,
      );
    });

    expect(await screen.findByText("Problem connecting to server")).toBeInTheDocument();
  });
  afterAll(() => {
    jest.clearAllMocks();
  });
});
