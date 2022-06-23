import { render, screen, act, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  mantineRecoilWrap,
  getMockFetchImplementation,
  getMockFetchImplementationError,
} from "../helpers/testHelpers";
import {
  ResourceCountResponse,
  ResourceCounts,
  sortResourceArray,
} from "../../components/ResourceCounts";

const RESOURCE_COUNTS_BODY: ResourceCountResponse = {
  Account: 0,
  Appointment: 0,
  Measure: 5,
  Patient: 2,
};

describe("resource Counts render", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(RESOURCE_COUNTS_BODY);
  });

  it("should display all resources and counts fetched by mock fetch", async () => {
    await act(async () => {
      render(mantineRecoilWrap(<ResourceCounts />));
    });

    //Expect badge component with data-testid=resourceType to contain correct resource count
    expect(within(screen.getByTestId("Patient")).getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Patient")).toBeInTheDocument();

    expect(within(screen.getByTestId("Measure")).getByText("5")).toBeInTheDocument();
    expect(screen.getByText("Measure")).toBeInTheDocument();

    expect(within(screen.getByTestId("Account")).getByText("0")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();

    expect(within(screen.getByTestId("Appointment")).getByText("0")).toBeInTheDocument();
    expect(screen.getByText("Appointment")).toBeInTheDocument();
  });

  it("the retrieved resources should be sorted by count, then alphabetically", async () => {
    let sortedArray;
    await act(async () => {
      sortedArray = sortResourceArray(RESOURCE_COUNTS_BODY);
    });
    expect(sortedArray).toEqual(["Measure", "Patient", "Account", "Appointment"]);
  });
});

describe("error response tests", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementationError("server");
  });

  it("should show error notification when not connected to server", async () => {
    await act(async () => {
      render(mantineRecoilWrap(<ResourceCounts />));
    });

    const errorNotif = screen.getByRole("alert") as HTMLDivElement;
    expect(errorNotif).toBeInTheDocument();

    const errorMessage = within(errorNotif).getByText(/Not connected to server/);
    expect(errorMessage).toBeInTheDocument();
  });
});
