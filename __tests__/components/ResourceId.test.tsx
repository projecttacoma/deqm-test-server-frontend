import { render, screen, act, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  mantineRecoilWrap,
  getMockFetchImplementation,
  getMockFetchImplementationError,
} from "../helpers/testHelpers";
import ResourceIDs from "../../components/ResourceIDs";

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

const RESOURCE_ID_EMPTY = {};

describe("resource ID render", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(RESOURCE_ID_BODY);
  });

  it("should display all the id's as buttons", async () => {
    await act(async () => {
      render(mantineRecoilWrap(<ResourceIDs jsonBody={RESOURCE_ID_BODY}></ResourceIDs>));
    });

    expect(screen.getByRole("button", { name: "denom-EXM125-3" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "numer-EXM125-3" })).toBeInTheDocument();
  });
});

describe("resource ID empty dataset", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(RESOURCE_ID_EMPTY);
  });

  it("should display 'no resources found' on the screen", async () => {
    await act(async () => {
      render(mantineRecoilWrap(<ResourceIDs jsonBody={RESOURCE_ID_EMPTY}></ResourceIDs>));
    });

    expect(screen.getByText("No resources found")).toBeInTheDocument();
  });
});
