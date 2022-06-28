import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  getMockFetchImplementation,
  createMockRouter,
  getMockFetchImplementationError,
} from "../helpers/testHelpers";
import ResourceTypeIDs from "../../pages/[resourceType]";
import { RouterContext } from "next/dist/shared/lib/router-context";

const RESOURCE_ID_BODY = {
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
    global.fetch = getMockFetchImplementation(RESOURCE_ID_BODY);
  });

  it("should display both id's as buttons", async () => {
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
    expect(await screen.findByRole("button", { name: "denom-EXM125-3" })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "numer-EXM125-3" })).toBeInTheDocument();
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
});
