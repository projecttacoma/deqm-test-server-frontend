import { render, screen, act, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  createMockRouter,
  getMockFetchImplementation,
  mockResizeObserver,
} from "../../../helpers/testHelpers";
import { RouterContext } from "next/dist/shared/lib/router-context";
import CareGapsPage from "../../../../pages/[resourceType]/[id]/care-gaps";
import { DateTime } from "luxon";
import { fhirJson } from "@fhir-typescript/r4-core";

const MEASURE_BODY_WITH_DATES = {
  resourceType: "Measure",
  id: "measure-EXM104-8.2.000",
  meta: {
    lastUpdated: "2022-07-21T18:12:25.008Z",
  },
  effectivePeriod: {
    start: "2019-01-01",
    end: "2019-12-31",
  },
};

const RESOURCE_ID_BODY: fhirJson.Bundle = {
  resourceType: "Bundle",
  meta: {
    lastUpdated: "2022-06-23T19:52:58.721Z",
  },
  type: "searchset",
  total: 2,
  entry: [
    {
      fullUrl: "http://localhost:3000/4_0_1/PractitionerReport/denom-EXM125-3",
      resource: {
        resourceType: "Practitioner",
        id: "denom-EXM125-3",
        meta: {
          profile: [
            "http://hl7.org/fhir/us/core/StructureDefinition/us-core-practitionerreport-note",
          ],
        },
      },
    },
    {
      fullUrl: "http://localhost:3000/4_0_1/PractitionerReport/numer-EXM125-3",
      resource: {
        resourceType: "Practitioner",
        id: "numer-EXM125-3",
        meta: {
          profile: [
            "http://hl7.org/fhir/us/core/StructureDefinition/us-core-practitionerreport-note",
          ],
        },
      },
    },
  ],
};

describe("Test evaluate page render for measure", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(MEASURE_BODY_WITH_DATES);
  });

  it("should display back button, expected title, and two pre-filled DatePickers", async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { resourceType: "Measure", id: "measure-EXM104-8.2.000" },
          })}
        >
          <CareGapsPage />
        </RouterContext.Provider>,
      );
    });
    expect(screen.getByTestId("back-button")).toBeInTheDocument();
    expect(screen.getByText("Gaps in Care: measure-EXM104-8.2.000")).toBeInTheDocument();

    //DatePickers should pre-fill with the effective period dates from the Measure
    expect(screen.getByDisplayValue("January 1, 2019")).toBeInTheDocument();
    expect(screen.getByDisplayValue("December 31, 2019")).toBeInTheDocument();
  });

  it("DatePickers and request preview display value should change when dates are updated", async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { resourceType: "Measure", id: "measure-EXM104-8.2.000" },
          })}
        >
          <CareGapsPage />
        </RouterContext.Provider>,
      );
    });

    //DatePickers should change when their value is altered
    const periodStartSelector = screen.getByLabelText("Period Start");
    const periodEndSelector = screen.getByLabelText("Period End");
    await act(async () => {
      fireEvent.change(periodStartSelector, {
        target: { value: DateTime.fromISO("2018-02-02").toJSDate() },
      });
      fireEvent.change(periodEndSelector, {
        target: { value: DateTime.fromISO("2020-11-13").toJSDate() },
      });
    });
    expect(screen.getByDisplayValue("February 2, 2018")).toBeInTheDocument();
    expect(screen.getByDisplayValue("November 13, 2020")).toBeInTheDocument();
  });
});

describe("Test evaluate page render for non-measure", () => {
  it("should display an error message", async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { resourceType: "DiagnosticReport", id: "denom-EXM125-3" },
          })}
        >
          <CareGapsPage />
        </RouterContext.Provider>,
      );
    });

    expect(screen.getByTestId("back-button")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Cannot calculate care gaps on resourceType: DiagnosticReport, only on resourceType: Measure/,
      ),
    ).toBeInTheDocument();
  });
});

describe("Input/Select components and Radio buttons render", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(RESOURCE_ID_BODY);
  });
  window.ResizeObserver = mockResizeObserver;

  it("tests for expected enabled/disabled state of select components when Subject is selected", async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { resourceType: "Measure", id: "Measure-12" },
          })}
        >
          <CareGapsPage />
        </RouterContext.Provider>,
      );
    });
    // Subject radio button should be pre-selected, so Select Patient component should be enabled
    const subjectRadio = screen.getByLabelText("Subject");
    expect(subjectRadio).toBeChecked();
    expect(screen.getByRole("searchbox", { name: "Select Patient" })).not.toBeDisabled();

    //other AutoComplete components should be disabled, Program text input should be enabled
    expect(screen.getByRole("searchbox", { name: "Select Organization" })).toBeDisabled();
    expect(screen.getByRole("searchbox", { name: "Select Practitioner" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Program" })).not.toBeDisabled();
  });

  it("tests for expected enabled/disabled state of input components when Organization is selected", async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { resourceType: "Measure", id: "Measure-12" },
          })}
        >
          <CareGapsPage />
        </RouterContext.Provider>,
      );
    });

    const organizationRadio = screen.getByLabelText("Organization");
    //Organization radio button should not be pre-selected
    expect(organizationRadio).not.toBeChecked();
    //click the organization radio button
    await act(async () => {
      fireEvent.click(organizationRadio);
    });

    //Patient select should be disabled, other AutoComplete components and Program text input should be enabled
    expect(screen.getByRole("searchbox", { name: "Select Patient" })).toBeDisabled();
    expect(screen.getByRole("searchbox", { name: "Select Organization" })).not.toBeDisabled();
    expect(screen.getByRole("searchbox", { name: "Select Practitioner" })).not.toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Program" })).not.toBeDisabled();
  });
});
