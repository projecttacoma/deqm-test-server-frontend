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
import SelectComponent from "../../../../components/SelectComponent";

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

  it("should display back button and expected title", async () => {
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

  it("DatePickers display value should changed when value is updated", async () => {
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
  });
});

describe("Test evaluate page render for measure", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(RESOURCE_ID_BODY);
  });
  it("should display expected text", async () => {
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

    expect(screen.getByTestId("back-button")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Cannot evaluate on resourceType: DiagnosticReport, only on resourceType: Measure/,
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
        mantineRecoilWrap(
          <SelectComponent resourceType="Practitioner" value="" setValue={jest.fn()} />,
        ),
      );
    });
  });
  expect(screen.findByText("No resources of type Practitioner found")).toBeInTheDocument;
});

describe("Select component render", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(RESOURCE_ID_BODY);
  });

  it("should display a dropdown menu populated with resource ID's when prompted by user key presses", async () => {
    await act(async () => {
      render(
        mantineRecoilWrap(
          <SelectComponent resourceType="Practitioner" value="" setValue={jest.fn()} />,
        ),
      );
    });

    const autocomplete = screen.getByRole("combobox");
    const input = within(autocomplete).getByRole("searchbox");
    autocomplete.focus();
    //mocks user key clicks to test the input fields and drop down menus
    await act(async () => {
      fireEvent.change(input, { target: { value: "P" } });
      fireEvent.keyDown(autocomplete, { key: "ArrowDown" });
      fireEvent.keyDown(autocomplete, { key: "Enter" });
    });

    //verifies that the drop down autocomplete menu is populated with the resource IDs fetched from the server
    const options = screen.getAllByRole("option");
    expect(options[0].textContent).toBe("Practitioner/denom-EXM125-3");
    expect(options[1].textContent).toBe("Practitioner/numer-EXM125-3");
  });
});
