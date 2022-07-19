import { render, screen, act, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  getMockFetchImplementation,
  createMockRouter,
  mockResizeObserver,
} from "../../../helpers/testHelpers";
import ResourceIDPage from "../../../../pages/[resourceType]/[id]";
import { RouterContext } from "next/dist/shared/lib/router-context";

const SINGLE_RESOURCE_BODY = {
  resourceType: "DiagnosticReport",
  id: "denom-EXM125-3",
  meta: {
    profile: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note",
  },
};

describe.only("resource ID render", () => {
  window.ResizeObserver = mockResizeObserver;
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(SINGLE_RESOURCE_BODY);
  });

  it("should display the JSON content of a single resource, a back button, and an update button", async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { resourceType: "DiagnosticReport", id: "denom-EXM125-3" },
          })}
        >
          <ResourceIDPage />
        </RouterContext.Provider>,
      );
    });

    //check for the expected buttons on the page
    expect(await screen.findByTestId("back-button")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Update" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();

    //parses out relevant information from the Prism HTML block and stores it in an array
    const spanText = [""];
    const spanElems = screen.getByTestId("prism-page-content").querySelectorAll("span");
    spanElems.forEach((el) => {
      spanText.push(el.textContent || "");
    });

    //verifies that each piece of the JSON content is contained in the array
    expect(spanText.includes('"resourceType"')).toBe(true);
    expect(spanText.includes('"DiagnosticReport"')).toBe(true);
    expect(spanText.includes('"id"')).toBe(true);
    expect(spanText.includes('"denom-EXM125-3"')).toBe(true);
    expect(spanText.includes('"meta"')).toBe(true);
    expect(spanText.includes('"profile"')).toBe(true);
    expect(
      spanText.includes(
        '"http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"',
      ),
    ).toBe(true);

    const deleteButton = screen.getByRole("button", {
      name: "Delete",

    }) as HTMLButtonElement;
    // fireEvent.click(deleteButton);
    const mypromise = new Promise((resolve, reject) => setTimeout("3000"));
    mypromise.finally(() => {fireEvent.click(deleteButton);})

    const errorNotif = (await screen.findByTitle("Delete Resource!!!!!"));
    expect(errorNotif).toBeInTheDocument();
    // screen.debug()

    // expect(within(errorNotif).getByText(/Resource successfully updated!/)).toBeInTheDocument();

  });
});
