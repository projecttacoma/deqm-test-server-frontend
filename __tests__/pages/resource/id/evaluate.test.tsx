import { render, screen, act, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
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

describe("Radio button render subject", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(RESOURCE_ID_BODY);
  });

  window.ResizeObserver = mockResizeObserver;

  it("should display an autocomplete component when the subject radio is selected", async () => {
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

    // click the subject radio button to ensure an autocomplete component appears
    const subjectRadio = screen.getByLabelText("Subject");
    await act(async () => {
      fireEvent.click(subjectRadio);
    });
    expect(screen.getByText("Select Patient")).toBeInTheDocument;
  });
});

describe("Radio button render population", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(RESOURCE_ID_BODY);
  });

  window.ResizeObserver = mockResizeObserver;

  it("should not display an autocomplete component when the population radio is selected", async () => {
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

    // click the population radio button to ensure an autocomplete component doesn't appear
    const populationRadio = screen.getByLabelText("Population");
    await act(async () => {
      fireEvent.click(populationRadio);
    });
    expect(screen.findByText("Select Patient")).not.toBeInTheDocument;
  });
});
