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

describe("measure resource ID render", () => {
  window.ResizeObserver = mockResizeObserver;
  beforeAll(() => {
    global.fetch = getMockFetchImplementation("");
  });

  it("should display button for evaluate measure and for care gaps", async () => {
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

    //for Measure resources, "Evaluate Measure" and "Calculate Care Gaps" buttons will be in the document
    expect(await screen.findByRole("link", { name: "Evaluate Measure" })).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "Calculate Care Gaps" })).toBeInTheDocument();
  });
});

describe("resource ID render", () => {
  window.ResizeObserver = mockResizeObserver;
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(SINGLE_RESOURCE_BODY);
  });

  it("should display the back-button, update-button, and delete-button", async () => {
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
    expect(screen.queryByRole("link", { name: "Evaluate Measure" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Calculate Care Gaps" })).toBeNull();
  });

  it("should display the JSON content of a single resource", async () => {
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
  });

  it("should display the delete modal when the delete button is pressed", async () => {
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
