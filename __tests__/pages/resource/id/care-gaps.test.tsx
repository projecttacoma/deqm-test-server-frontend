import { render, screen, act, within, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  mantineRecoilWrap,
  createMockRouter,
  getMockFetchImplementation,
  mockResizeObserver,
  getMockFetchImplementationError,
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

const SHORT_RESOURCE_ID_BODY: fhirJson.Bundle = {
  resourceType: "Bundle",
  meta: {
    lastUpdated: "2022-06-23T19:52:58.721Z",
  },
  type: "searchset",
  total: 1,
  entry: [
    {
      resource: {
        resourceType: "Practitioner",
        id: "denom-EXM125-3",
      },
    },
  ],
};

const ERROR_400_RESPONSE_BODY = { issue: [{ details: { text: "Invalid resource ID" } }] };

describe("Test evaluate page render for measure", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(MEASURE_BODY_WITH_DATES);
  });

  it("should display back button, expected title, two pre-filled DatePickers, and disabled Calculate button", async () => {
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

    expect(screen.getByText("Request Preview:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Calculate" })).toBeDisabled();
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

    //request preview should include the updated dates
    expect(
      screen.getByText(
        "/Measure/$care-gaps?measureId=measure-EXM104-8.2.000&periodStart=2018-02-02&periodEnd=2020-11-13&status=open-gap",
      ),
    ).toBeInTheDocument();
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

    //Calculate button is disabled when no inputs are entered
    expect(screen.getByRole("button", { name: "Calculate" }) as HTMLButtonElement).toBeDisabled();

    //Request preview should include default dates (curr year Jan 1, Dec 31)
    expect(
      screen.getByText(
        `/Measure/$care-gaps?measureId=Measure-12&periodStart=${
          DateTime.now().year
        }-01-01&periodEnd=${DateTime.now().year}-12-31&status=open-gap`,
      ),
    ).toBeInTheDocument();
  });
});

describe("Calculate button behavior and request preview", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(RESOURCE_ID_BODY);
  });
  window.ResizeObserver = mockResizeObserver;

  it("tests for expected calculate button and request preview behavior when subject is selected", async () => {
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

    const patientSelectComponent = screen.getByRole("searchbox", { name: "Select Patient" });
    await act(async () => {
      fireEvent.change(patientSelectComponent, { target: { value: "P" } });
    });

    //Calculate button enables once Patient is inputed
    expect(
      screen.getByRole("button", { name: "Calculate" }) as HTMLButtonElement,
    ).not.toBeDisabled();

    //request preview should include a Patient value
    expect(
      screen.getByText(
        `/Measure/$care-gaps?measureId=Measure-12&periodStart=${
          DateTime.now().year
        }-01-01&periodEnd=${DateTime.now().year}-12-31&status=open-gap&subject=P`,
      ),
    ).toBeInTheDocument();
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

    //click the organization radio button
    await act(async () => {
      fireEvent.click(screen.getByLabelText("Organization"));
    });

    const organizationSelectComponent = screen.getByRole("searchbox", {
      name: "Select Organization",
    });
    await act(async () => {
      fireEvent.change(organizationSelectComponent, { target: { value: "O" } });
    });

    //Calculate button enables once Organization is inputed
    expect(
      screen.getByRole("button", { name: "Calculate" }) as HTMLButtonElement,
    ).not.toBeDisabled();

    const practitionerSelectComponent = screen.getByRole("searchbox", {
      name: "Select Practitioner",
    });
    await act(async () => {
      fireEvent.change(practitionerSelectComponent, { target: { value: "P" } });
    });

    //Request preview should include default dates (curr year Jan 1, Dec 31)
    expect(
      screen.getByText(
        `/Measure/$care-gaps?measureId=Measure-12&periodStart=${
          DateTime.now().year
        }-01-01&periodEnd=${
          DateTime.now().year
        }-12-31&status=open-gap&organization=O&practitioner=P`,
      ),
    ).toBeInTheDocument();
  });

  it("tests for expected calculate button and request preview behavior when Program is inputted", async () => {
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

    const programInput = screen.getByRole("textbox", { name: "Program" });
    await act(async () => {
      fireEvent.change(programInput, { target: { value: "P" } });
    });

    //Calculate button is still disabled
    expect(screen.getByRole("button", { name: "Calculate" }) as HTMLButtonElement).toBeDisabled();

    //request preview should include a Program value
    expect(
      screen.getByText(
        `/Measure/$care-gaps?measureId=Measure-12&periodStart=${
          DateTime.now().year
        }-01-01&periodEnd=${DateTime.now().year}-12-31&status=open-gap&program=P`,
      ),
    ).toBeInTheDocument();
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
            <CareGapsPage />
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
            <CareGapsPage />
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
    global.fetch = getMockFetchImplementation(SHORT_RESOURCE_ID_BODY);
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
            <CareGapsPage />
          </RouterContext.Provider>,
        ),
      );
    });

    //enable calculate button by typing into Select Patient
    const patientSelectComponent = screen.getByRole("searchbox", { name: "Select Patient" });
    await act(async () => {
      fireEvent.change(patientSelectComponent, { target: { value: "P" } });
    });

    const calculateButton = screen.getByRole("button", { name: "Calculate" }) as HTMLButtonElement;
    await act(async () => {
      fireEvent.click(calculateButton);
    });

    const successNotif = (await screen.findByRole("alert")) as HTMLDivElement;
    expect(successNotif).toBeInTheDocument();

    expect(
      within(successNotif).getByText(/Gaps in care calculation successful!/),
    ).toBeInTheDocument();

    //parses out relevant information from the Prism HTML block and stores it in an array
    const spanText = [""];
    const spanElems = screen.getByTestId("prism-measure-report").querySelectorAll("span");
    spanElems.forEach((el) => {
      spanText.push(el.textContent || "");
    });

    //verifies that each piece of the JSON content is contained in the array
    expect(spanText.includes('"resourceType"')).toBe(true);
    expect(spanText.includes('"Bundle"')).toBe(true);
    expect(spanText.includes('"total"')).toBe(true);
    expect(spanText.includes("1")).toBe(true);
    expect(spanText.includes('"resource"')).toBe(true);
    expect(spanText.includes('"Practitioner"')).toBe(true);
    expect(spanText.includes('"id"')).toBe(true);
    expect(spanText.includes('"denom-EXM125-3"')).toBe(true);
  });
});



describe.only("Select component, Radio button, and request preview render", () => {
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
            <CareGapsPage />
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
            <CareGapsPage />
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
              query: { resourceType: "Measure", id: "measure-EXM104-8.4.000", organization: "Organization/123", },
            })}
          >
            <CareGapsPage />
          </RouterContext.Provider>,
        ),
      );
    });

    const populationRadio = screen.getByLabelText("Organization");
    expect(populationRadio).toBeChecked();

  });

  
});
