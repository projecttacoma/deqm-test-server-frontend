import { render, screen, act, within, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  mantineRecoilWrap,
  getMockFetchImplementation,
  getMockFetchImplementationError,
} from "../helpers/testHelpers";
import { ResourceCountResponse, ResourceCounts } from "../../components/ResourceCounts";

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

    expect(screen.getByRole("link", { name: "Patient 2" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Measure 5" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Account 0" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Appointment 0" })).toBeInTheDocument();
  });

  it("should display the search bar and searched resources", async () => {
    await act(async () => {
      render(mantineRecoilWrap(<ResourceCounts />));
    });

    const searchbar = screen.getByRole("textbox");

    //mocks user input to test filtering of resources
    await act(async () => {
      fireEvent.change(searchbar, { target: { value: "patient" } });

      expect(screen.getByRole("link", { name: "Patient 2" })).toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Account 0" })).not.toBeInTheDocument();
    });
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
