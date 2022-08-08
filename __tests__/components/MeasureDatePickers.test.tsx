import { render, screen, act, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  mantineRecoilWrap,
  createMockRouter,
  getMockFetchImplementation,
  getMockFetchImplementationError,
} from "../helpers/testHelpers";
import { RouterContext } from "next/dist/shared/lib/router-context";
import EvaluateMeasurePage from "../../pages/[resourceType]/[id]/evaluate";
import { DateTime } from "luxon";
import MeasureDatePickers from "../../components/MeasureDatePickers";

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
describe("Test evaluate page render for measure without dates in effective period", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(MEASURE_BODY_NO_DATES);
  });
  it("should display DatePickers with default dates", async () => {
    await act(async () => {
      render(
        <MeasureDatePickers
          measureID="measure-EXM104-8.2.000"
          periodStart={new Date(`${DateTime.now().year}-01-01T00:00:00`)}
          periodEnd={new Date(`${DateTime.now().year}-12-31T00:00:00`)}
          startOnUpdate={jest.fn()}
          endOnUpdate={jest.fn()}
        />,
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
        <MeasureDatePickers
          measureID="measure-EXM104-8.2.000"
          periodStart={new Date(`${DateTime.now().year}-01-01T00:00:00`)}
          periodEnd={new Date(`${DateTime.now().year}-12-31T00:00:00`)}
          startOnUpdate={jest.fn()}
          endOnUpdate={jest.fn()}
        />,
      );
    });
    expect(screen.getByDisplayValue(`January 1, ${DateTime.now().year}`)).toBeInTheDocument();
    expect(screen.getByDisplayValue(`December 31, ${DateTime.now().year}`)).toBeInTheDocument();
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
