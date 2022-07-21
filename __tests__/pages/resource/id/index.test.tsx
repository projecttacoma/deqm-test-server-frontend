import { render, screen, act, fireEvent, within } from "@testing-library/react";
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

describe("resource ID render", () => {
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
    expect(screen.queryByRole("link", { name: "Evaluate Measure" })).toBeNull();
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

    // click the identified delete button
    fireEvent.click(deleteButton);

    //make sure a modal with the correct information shows up. Mantine modals are classified as dialogs.
    const deleteModal = await screen.findByRole("dialog");
    expect(deleteModal).toBeInTheDocument();
    expect(within(deleteModal).getByText(/DiagnosticReport/)).toBeInTheDocument();
    expect(within(deleteModal).getByText(/denom-EXM125-3/)).toBeInTheDocument();
    expect(within(deleteModal).getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(within(deleteModal).getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });
});

describe("measure resource ID render", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation("");
  });

  it("should display an evaluate measure button", async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { resourceType: "Measure", id: "Measure12" },
          })}
        >
          <ResourceIDPage />
        </RouterContext.Provider>,
      );
    });

    //for Measure resources, an additional button named "Evaluate Measure" will be in the document
    expect(screen.getByRole("link", { name: "Evaluate Measure" })).toBeInTheDocument();
  });
});
