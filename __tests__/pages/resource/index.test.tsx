import { render, screen, act, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  getMockFetchImplementation,
  createMockRouter,
  getMockFetchImplementationError,
} from "../../helpers/testHelpers";
import ResourceTypeIDs from "../../../pages/[resourceType]";
import { RouterContext } from "next/dist/shared/lib/router-context";
import { fhirJson } from "@fhir-typescript/r4-core";

const ID_BODY_NO_LINKS: fhirJson.Bundle = {
  resourceType: "Bundle",
  meta: {
    lastUpdated: "2022-06-23T19:52:58.721Z",
  },
  type: "searchset",
  total: 2,
  entry: [
    {
      fullUrl: "http://localhost:3000/4_0_1/DiagnosticReport/denom-EXM125-3",
      resource: {
        resourceType: "DiagnosticReport",
        id: "denom-EXM125-3",
        meta: {
          profile: [
            "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note",
          ],
        },
      },
    },
    {
      fullUrl: "http://localhost:3000/4_0_1/DiagnosticReport/numer-EXM125-3",
      resource: {
        resourceType: "DiagnosticReport",
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

const RESOURCE_ID_ZERO_COUNT = {
  resourceType: "Bundle",
  meta: {
    lastUpdated: "2022-06-27T15:18:52.234Z",
  },
  type: "searchset",
  total: 0,
};

describe("resource ID button render", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(ID_BODY_NO_LINKS);
  });

  it("should display both id's as buttons and a create new resource button", async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { resourceType: "DiagnosticReport" },
          })}
        >
          <ResourceTypeIDs />
        </RouterContext.Provider>,
      );
    });

    expect(
      await screen.findByRole("button", { name: "DiagnosticReport/denom-EXM125-3" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "DiagnosticReport/numer-EXM125-3" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("link", { name: "Create New DiagnosticReport" }),
    ).toBeInTheDocument();

    //resource ID navigation should not be rendered
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
  afterAll(() => {
    jest.clearAllMocks();
  });
});

describe("resource ID button no pagination", () => {
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

    //resource ID navigation should not be rendered
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
  afterAll(() => {
    jest.clearAllMocks();
  });
});

describe("resource ID search pagination render", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(ID_BODY_2_PAGES);
  });

  it("should display search pagination buttons", async () => {
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

    //navigation buttons should be rendered
    expect(screen.getByRole("navigation")).toBeInTheDocument();

    //page 2 button should not be "current" until it is clicked on
    const page2Button = screen.getByRole("button", { name: "2", current: false });
    expect(page2Button).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(page2Button);
    });
    expect(screen.getByRole("button", { name: "2", current: "page" })).toBeInTheDocument();

    //resource ID buttons should be rendered based on the fetch response
    expect(
      await screen.findByRole("button", { name: "Library/denom-EXM125-3" }),
    ).toBeInTheDocument();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });
});

describe("Tests for when the 'No resource found message' should display", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(RESOURCE_ID_ZERO_COUNT);
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
