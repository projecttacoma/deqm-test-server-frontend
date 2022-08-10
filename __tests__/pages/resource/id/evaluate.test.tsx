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

    expect(screen.getByDisplayValue(`January 1, ${DateTime.now().year}`)).toBeInTheDocument();
    expect(screen.getByDisplayValue(`December 31, ${DateTime.now().year}`)).toBeInTheDocument();
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
    expect(
      await screen.findByDisplayValue(`January 1, ${DateTime.now().year}`),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue(`December 31, ${DateTime.now().year}`)).toBeInTheDocument();
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

describe("Select component, Radio button, and request preview render", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(RESOURCE_ID_BODY);
  });
  window.ResizeObserver = mockResizeObserver;

  it("tests for expected Select Components render and disabled calculate button", async () => {
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

    //Calculate button should be disabled if Subject radio button is selected with no Patient selected
    expect(screen.getByRole("button", { name: "Calculate" }) as HTMLButtonElement).toBeDisabled();
  });

  it("tests for expected request preview and calculate button behavior when user types into Select Components", async () => {
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

    //mocks user typing into Patient SelectComponent to check for updating request preview
    const patientSelectComponent = screen.getByRole("searchbox", { name: "Select Patient" });
    await act(async () => {
      fireEvent.change(patientSelectComponent, { target: { value: "P" } });
    });

    //Calculate button enables once Patient is selected
    expect(
      screen.getByRole("button", { name: "Calculate" }) as HTMLButtonElement,
    ).not.toBeDisabled();

    //mocks user typing into Practitioner SelectComponent to check for updating request preview
    const practitionerSelectComponent = screen.getByRole("searchbox", {
      name: "Select Practitioner",
    });
    await act(async () => {
      fireEvent.change(practitionerSelectComponent, { target: { value: "P" } });
    });
    expect(
      screen.getByText(
        `/Measure/Measure-12/$evaluate-measure?periodStart=${DateTime.now().year}-01-01&periodEnd=${
          DateTime.now().year
        }-12-31&reportType=subject&subject=P&practitioner=P`,
      ),
    ).toBeInTheDocument();
  });

  it("tests for expected request preview, absence of Patient Select Component, and enabled Calculate button", async () => {
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
    //click the population radio button to disable Patient autocomplete component
    const populationRadio = screen.getByLabelText("Population");

    //Population radio button should not be pre-selected
    expect(populationRadio).not.toBeChecked();
    await act(async () => {
      fireEvent.click(populationRadio);
    });

    const groupSelectComponent = screen.getByRole("searchbox", {
      name: "Select Group",
    });
    await act(async () => {
      fireEvent.change(groupSelectComponent, { target: { value: "G" } });
    });

    expect(
      screen.getByText(
        `/Measure/Measure-12/$evaluate-measure?periodStart=${DateTime.now().year}-01-01&periodEnd=${
          DateTime.now().year
        }-12-31&reportType=population&subject=G`,
      ),
    ).toBeInTheDocument();

    //Calculate button should be enabled
    expect(
      screen.getByRole("button", { name: "Calculate" }) as HTMLButtonElement,
    ).not.toBeDisabled();
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

    expect(screen.queryByTestId("prism-measure-report")).not.toBeInTheDocument();
    expect(within(errorNotif).getByText(/400 BadRequest/)).toBeInTheDocument();
    expect(within(errorNotif).getByText(/Invalid resource ID/)).toBeInTheDocument();
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

    expect(screen.queryByTestId("prism-measure-report")).not.toBeInTheDocument();
    expect(within(errorNotif).getByText(/Not connected to server!/)).toBeInTheDocument();
    expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
  });
});

describe("Evaluate measure successful request", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(MEASURE_BODY_NO_EFFECTIVE_PERIOD);
  });

  window.ResizeObserver = mockResizeObserver;

  it("should display success notif and Prism component with fetch response json body", async () => {
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
    //click the population radio button to ensure Calculate button is enbled
    const populationRadio = screen.getByLabelText("Population");
    await act(async () => {
      fireEvent.click(populationRadio);
    });

    const calculateButton = screen.getByRole("button", { name: "Calculate" }) as HTMLButtonElement;
    await act(async () => {
      fireEvent.click(calculateButton);
    });

    const errorNotif = (await screen.findByRole("alert")) as HTMLDivElement;
    expect(errorNotif).toBeInTheDocument();

    expect(within(errorNotif).getByText(/Evaluate Measure successful!/)).toBeInTheDocument();

    //parses out relevant information from the Prism HTML block and stores it in an array
    const spanText = [""];
    const spanElems = screen.getByTestId("prism-measure-report").querySelectorAll("span");
    spanElems.forEach((el) => {
      spanText.push(el.textContent || "");
    });

    //verifies that each piece of the JSON content is contained in the array
    expect(spanText.includes('"resourceType"')).toBe(true);
    expect(spanText.includes('"Measure"')).toBe(true);
    expect(spanText.includes('"id"')).toBe(true);
    expect(spanText.includes('"measure-EXM104-8.4.000"')).toBe(true);
    expect(spanText.includes('"meta"')).toBe(true);
    expect(spanText.includes('"lastUpdated"')).toBe(true);
    expect(spanText.includes('"2022-07-21T18:12:25.008Z"')).toBe(true);
  });
});

describe("Select component, Radio button, and request preview render", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(RESOURCE_ID_BODY);
  });
  window.ResizeObserver = mockResizeObserver;

  it("should display a patient value in the select patient component when a patient is provided in the router query", async () => {
    await act(async () => {
      render(
        mantineRecoilWrap(
          <RouterContext.Provider
            value={createMockRouter({
              query: { resourceType: "Measure", id: "measure-EXM104-8.4.000", patient: "Patient/denomexcl-EXM124", },
            })}
          >
            <EvaluateMeasurePage />
          </RouterContext.Provider>,
        ),
      );
    });

    const autocomplete = screen.getByRole("searchbox", {name: "Select Patient"}) as HTMLElement;
    expect(autocomplete).toHaveValue("Patient/denomexcl-EXM124");
    const subjectRadio = screen.getByLabelText("Subject");
    expect(subjectRadio).toBeChecked();
  });

  it("should display a practitioner value in the select practitioner component when a practitioner is provided in the router query", async () => {
    await act(async () => {
      render(
        mantineRecoilWrap(
          <RouterContext.Provider
            value={createMockRouter({
              query: { resourceType: "Measure", id: "measure-EXM104-8.4.000", practitioner: "Practitioner/123", },
            })}
          >
            <EvaluateMeasurePage />
          </RouterContext.Provider>,
        ),
      );
    });

    const autocomplete = screen.getByRole("searchbox", {name: "Select Practitioner"}) as HTMLElement;
    expect(autocomplete).toHaveValue("Practitioner/123");
  });

  it("should display a group value in the select group component when a group is provided in the router query", async () => {
    await act(async () => {
      render(
        mantineRecoilWrap(
          <RouterContext.Provider
            value={createMockRouter({
              query: { resourceType: "Measure", id: "measure-EXM104-8.4.000", group: "Group/123", },
            })}
          >
            <EvaluateMeasurePage />
          </RouterContext.Provider>,
        ),
      );
    });
    const populationRadio = screen.getByLabelText("Population");
    expect(populationRadio).toBeChecked();

    const autocomplete = screen.getByRole("searchbox", {name: "Select Group"}) as HTMLElement;
    expect(autocomplete).toHaveValue("Group/123");
  });

  
});
