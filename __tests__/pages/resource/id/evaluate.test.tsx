import { render, screen, act, within, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  mantineRecoilWrap,
  getMockFetchImplementation,
  mockResizeObserver,
  createMockRouter,
} from "../../../helpers/testHelpers";
import { RouterContext } from "next/dist/shared/lib/router-context";
import EvaluateMeasurePage from "../../../../pages/[resourceType]/[id]/evaluate";
import { fhirJson } from "@fhir-typescript/r4-core";

const RESOURCE_ID_BODY: fhirJson.Bundle = {
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
        resourceType: "Practitioner",
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
        resourceType: "Practitioner",
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

describe("Test evaluate page render for measure", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(RESOURCE_ID_BODY);
  });
  it("should display expected text", async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { resourceType: "Measure", id: "Measure-12" },
          })}
        >
          <EvaluateMeasurePage />
        </RouterContext.Provider>,
      );
    });

    expect(screen.getByText("Select Practitioner")).toBeInTheDocument();
  });
});

describe("Test evaluate page render for non-measure", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(RESOURCE_ID_BODY);
  });
  it("should display an error message", async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { resourceType: "DiagnosticReport", id: "denom-EXM125-3" },
          })}
        >
          <EvaluateMeasurePage />
        </RouterContext.Provider>,
      );
    });

    expect(
      screen.getByText(
        /Cannot evaluate on resourceType: DiagnosticReport, only on resourceType: Measure/,
      ),
    ).toBeInTheDocument();
  });
});

describe("Select component render", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(RESOURCE_ID_BODY);
  });

  window.ResizeObserver = mockResizeObserver;

  it("should display a dropdown menu populated with resource ID's when prompted by user key presses", async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { resourceType: "Measure", id: "Measure-12" },
          })}
        >
          <EvaluateMeasurePage />
        </RouterContext.Provider>,
      );
    });
    // //retrieves the combobox and the input field within the combobox
    const radio = screen.getByLabelText("Subject");
    await act(async () => {
      fireEvent.click(radio);
    });
    expect(screen.getByText("Select Patient")).toBeInTheDocument;
  });
});

describe("Select component render1", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(RESOURCE_ID_BODY);
  });

  window.ResizeObserver = mockResizeObserver;

  it("should display a dropdown menu populated with resource ID's when prompted by user key presses1", async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { resourceType: "Measure", id: "Measure-12" },
          })}
        >
          <EvaluateMeasurePage />
        </RouterContext.Provider>,
      );
    });

    // //retrieves the combobox and the input field within the combobox
    const radio2 = screen.getByLabelText("Population");
    // const radio = screen.getByLabelText("radio");
    await act(async () => {
      fireEvent.click(radio2);
    });
    expect(screen.findByText("Select Patient")).not.toBeInTheDocument;
  });
});

