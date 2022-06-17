import { render, screen, act, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  mantineRecoilWrap,
  getMockFetchImplementation,
  getMockFetchImplementationError,
} from "../helpers/testHelpers";
import { ResourceCounts, sortResourceArray } from "../components/ResourceCounts";

const resourceCountsBody = {
  Account: 0,
  Appointment: 0,
  Measure: 5,
  Patient: 2,
};

describe("resource Counts render", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(resourceCountsBody);
  });

  it("should display all resources and counts fetched by mock fetch", async () => {
    await act(async () => {
      render(mantineRecoilWrap(<ResourceCounts />));
    });

    const text = screen.getByText("Patient (2)");
    expect(text).toBeInTheDocument();
    const text1 = screen.getByText("Measure (5)");
    expect(text1).toBeInTheDocument();
    const text2 = screen.getByText("Account (0)");
    expect(text2).toBeInTheDocument();
    const text3 = screen.getByText("Appointment (0)");
    expect(text3).toBeInTheDocument();
  });

  it("the retrieved resources should be sorted by count, then alphabetically", async () => {
    let sortedArray;
    await act(async () => {
      sortedArray = sortResourceArray(resourceCountsBody);
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
