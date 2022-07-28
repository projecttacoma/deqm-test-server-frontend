import { render, screen, act, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  mantineRecoilWrap,
  createMockRouter,
  getMockFetchImplementation,
  getMockFetchImplementationError,
  mockResizeObserver,
} from "../../../helpers/testHelpers";
import { RouterContext } from "next/dist/shared/lib/router-context";
import EvaluateMeasurePage from "../../../../pages/[resourceType]/[id]/evaluate";
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

const MEASURE_BODY_NO_DATES = {
  resourceType: "Measure",
  id: "measure-EXM104-8.4.000",
  meta: {
    lastUpdated: "2022-07-21T18:12:25.008Z",
  },
  effectivePeriod: {},
};

const MEASURE_BODY_NO_EFFECTIVE_PERIOD = {
  resourceType: "Measure",
  id: "measure-EXM104-8.4.000",
  meta: {
    lastUpdated: "2022-07-21T18:12:25.008Z",
  },
};

const ERROR_400_RESPONSE_BODY = { issue: [{ details: { text: "Invalid resource ID" } }] };

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

const NO_RESOURCE_ID: fhirJson.Bundle = {
  resourceType: "Bundle",
  meta: {
    lastUpdated: "2022-06-23T19:52:58.721Z",
  },
  type: "searchset",
  total: 0,
  entry: [],
};

describe("Test evaluate page render for measure", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(MEASURE_BODY_WITH_DATES);
  });

  it("should display back button, expected title, request preview, and disabled calculate button", async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { resourceType: "Measure", id: "measure-EXM104-8.2.000" },
          })}
        >
          <EvaluateMeasurePage />
        </RouterContext.Provider>,
      );
    });
    expect(screen.getByTestId("back-button")).toBeInTheDocument();
    expect(screen.getByText("Evaluate Measure: measure-EXM104-8.2.000")).toBeInTheDocument();
    expect(screen.getByText("Request Preview:")).toBeInTheDocument();

    const calculateButton = screen.getByRole("button", { name: "Calculate" }) as HTMLButtonElement;
    expect(calculateButton).toBeInTheDocument();
    expect(calculateButton).toBeDisabled();

    //Request preview should include the dates from the Measure's effective period
    expect(
      screen.getByText(
        "/Measure/measure-EXM104-8.2.000/$evaluate-measure?periodStart=2019-01-01&periodEnd=2019-12-31&reportType=subject",
      ),
    ).toBeInTheDocument();
  });

  it("should display two DatePickers pre-filled with expected dates", async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { resourceType: "Measure", id: "measure-EXM104-8.2.000" },
          })}
        >
          <EvaluateMeasurePage />
        </RouterContext.Provider>,
      );
    });
    //DatePickers should pre-fill with the effective period dates from the Measure
    expect(screen.getByDisplayValue("January 1, 2019")).toBeInTheDocument();
    expect(screen.getByDisplayValue("December 31, 2019")).toBeInTheDocument();
  });

  it("DatePickers and request preview display value should changed when dates are updated", async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { resourceType: "Measure", id: "measure-EXM104-8.2.000" },
          })}
        >
          <EvaluateMeasurePage />
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

    //request preview should include the updated dates
    expect(
      screen.getByText(
        "/Measure/measure-EXM104-8.2.000/$evaluate-measure?periodStart=2018-02-02&periodEnd=2020-11-13&reportType=subject",
      ),
    ).toBeInTheDocument();
  });
});

describe("Test evaluate page render for measure without dates in effective period", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(MEASURE_BODY_NO_DATES);
  });

  it("should display DatePickers with default dates", async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { resourceType: "Measure", id: "measure-EXM104-8.4.000" },
          })}
        >
          <EvaluateMeasurePage />
        </RouterContext.Provider>,
      );
    });
    expect(await screen.findByDisplayValue("January 1, 2022")).toBeInTheDocument();
    expect(screen.getByDisplayValue("December 31, 2022")).toBeInTheDocument();
  });
});

describe("Test evaluate page render for measure without effective period", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(MEASURE_BODY_NO_EFFECTIVE_PERIOD);
  });

  it("should display DatePickers with default dates", async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { resourceType: "Measure", id: "measure-EXM104-8.4.000" },
          })}
        >
          <EvaluateMeasurePage />
        </RouterContext.Provider>,
      );
    });
    expect(await screen.findByDisplayValue("January 1, 2022")).toBeInTheDocument();
    expect(screen.getByDisplayValue("December 31, 2022")).toBeInTheDocument();
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
          <EvaluateMeasurePage />
        </RouterContext.Provider>,
      );
    });

    expect(screen.getByTestId("back-button")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Cannot evaluate on resourceType: DiagnosticReport, only on resourceType: Measure/,
      ),
    ).toBeInTheDocument();
  });
});

describe("Select component no practitioners", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(NO_RESOURCE_ID);
  });

  window.ResizeObserver = mockResizeObserver;

  it("should display no practioners", async () => {
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
  });

  expect(screen.findByText("No resources of type Practitioner found")).toBeInTheDocument;
});

describe("Select component, Radio button, and request preview render", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(RESOURCE_ID_BODY);
  });
  window.ResizeObserver = mockResizeObserver;

  it("tests for expected request preview and both Select Components", async () => {
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
    // Subject radio button should be pre-selected, so Select Patient component should appear
    const subjectRadio = screen.getByLabelText("Subject");
    expect(subjectRadio).toBeChecked();
    expect(screen.getByText("Select Patient")).toBeInTheDocument;
    expect(screen.getByText("Select Practitioner")).toBeInTheDocument;

    //mocks user typing into both SelectComponents to check for updating request preview
    const patientSelectComponent = screen.getByRole("searchbox", { name: "Select Patient" });
    await act(async () => {
      fireEvent.change(patientSelectComponent, { target: { value: "P" } });
    });
    const practitionerSelectComponent = screen.getByRole("searchbox", {
      name: "Select Practitioner",
    });
    await act(async () => {
      fireEvent.change(practitionerSelectComponent, { target: { value: "P" } });
    });
    expect(
      screen.getByText(
        "/Measure/Measure-12/$evaluate-measure?periodStart=2022-01-01&periodEnd=2022-12-31&reportType=subject&subject=P&practitioner=P",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Calculate" }) as HTMLButtonElement,
    ).not.toBeDisabled();
  });

  it("tests for expected request preview and absence of Patient Select Component", async () => {
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
    //click the population radio button to ensure the Patient autocomplete component doesn't appear
    const populationRadio = screen.getByLabelText("Population");
    //Population radio button should not be pre-selected
    expect(populationRadio).not.toBeChecked();
    await act(async () => {
      fireEvent.click(populationRadio);
    });
    expect(screen.findByText("Select Patient")).not.toBeInTheDocument;
    //expect the request preview to include reportType=population
    expect(
      screen.getByText(
        "/Measure/Measure-12/$evaluate-measure?periodStart=2022-01-01&periodEnd=2022-12-31&reportType=population",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Calculate" }) as HTMLButtonElement,
    ).not.toBeDisabled();
  });
});

describe("Error thrown during create test", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation("400 Bad Request");
  });

  it("Test for error notification when error is thrown", async () => {
    await act(async () => {
      render(
        mantineRecoilWrap(
          <RouterContext.Provider
            value={createMockRouter({
              query: { resourceType: "Measure", id: "Measure-12" },
            })}
          >
            <EvaluateMeasurePage />
          </RouterContext.Provider>,
        ),
      );
    });

    screen.debug(undefined, 30000);

    /* const submitButton = screen.getByRole("button", {
      name: "Submit Resource",
    }) as HTMLButtonElement;

    const codeEditor = screen.getByRole("textbox");

    const errorNotif = (await screen.findByRole("alert")) as HTMLDivElement;
    expect(errorNotif).toBeInTheDocument();

    expect(within(errorNotif).getByText(/Problem connecting to server:/)).toBeInTheDocument();
    expect(within(errorNotif).getByText(/400 Bad Request/)).toBeInTheDocument();
    */
  });
});

describe("non 20x response in evaluate measure page", () => {
  beforeEach(() => {
    global.fetch = getMockFetchImplementation(ERROR_400_RESPONSE_BODY, 400, "BadRequest");
  });

  it("error notification should appear with expected messages", async () => {
    await act(async () => {
      render(
        mantineRecoilWrap(
          <RouterContext.Provider
            value={createMockRouter({
              query: { resourceType: "Measure", id: "measure-EXM104-8.4.000" },
            })}
          >
            <EvaluateMeasurePage />
          </RouterContext.Provider>,
        ),
      );
    });

    const errorNotif = (await screen.findByRole("alert")) as HTMLDivElement;
    expect(errorNotif).toBeInTheDocument();

    expect(within(errorNotif).getByText(/400 BadRequest/)).toBeInTheDocument();
    expect(within(errorNotif).getByText(/Invalid resource ID/)).toBeInTheDocument();
    screen.debug(undefined, 30000);
  });
});

describe("Evaluate measure page fetch throws error", () => {
  beforeEach(() => {
    global.fetch = getMockFetchImplementationError("Problem connecting to server");
  });

  it("Server error notification should appear with expected messages", async () => {
    await act(async () => {
      render(
        mantineRecoilWrap(
          <RouterContext.Provider
            value={createMockRouter({
              query: { resourceType: "Measure", id: "measure-EXM104-8.4.000" },
            })}
          >
            <EvaluateMeasurePage />
          </RouterContext.Provider>,
        ),
      );
    });

    const errorNotif = (await screen.findByRole("alert")) as HTMLDivElement;
    expect(errorNotif).toBeInTheDocument();

    expect(within(errorNotif).getByText(/Not connected to server!/)).toBeInTheDocument();
    expect(screen.getByText("Something went wrong.")).toBeInTheDocument();

    screen.debug(undefined, 30000);
  });
});
