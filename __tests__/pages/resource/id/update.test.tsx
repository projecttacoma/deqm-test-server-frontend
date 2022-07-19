import { render, screen, act, fireEvent, within, waitFor } from "@testing-library/react";
//import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import UpdateResourcePage from "../../../../pages/[resourceType]/[id]/update";
import {
  mantineRecoilWrap,
  createMockRouter,
  getMockFetchImplementation,
  createRectRange,
} from "../../../helpers/testHelpers";
import { RouterContext } from "next/dist/shared/lib/router-context";

const SINGLE_RESOURCE_BODY = {
  body: {
    resourceType: "DiagnosticReport",
    id: "denom-EXM125-3",
    meta: {
      profile: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note",
    },
  },
  status: 200,
};

const ERROR_400_RESPONSE_BODY = { issue: [{ details: { text: "Invalid resource body" } }] };

describe("update resource page render", () => {
  beforeEach(() => {
    global.fetch = getMockFetchImplementation(SINGLE_RESOURCE_BODY);
    document.createRange = createRectRange;
  });
  it("test for display of ResourceCode Editor component, update resource button, and back button", async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { resourceType: "DiagnosticReport", id: "denom-EXM125-3" },
          })}
        >
          <UpdateResourcePage />
        </RouterContext.Provider>,
      );
    });
    expect(await screen.findByTestId("back-button")).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Update Resource" })).toBeInTheDocument();
    expect(await screen.findByTestId("resource-code-editor")).toBeInTheDocument();
  });
});

describe("successful update test", () => {
  beforeEach(() => {
    global.fetch = getMockFetchImplementation(SINGLE_RESOURCE_BODY, 200);
    document.createRange = createRectRange;
  });

  it("test for success notification", async () => {
    document.createRange = createRectRange;

    await act(async () => {
      render(
        mantineRecoilWrap(
          <RouterContext.Provider
            value={createMockRouter({
              query: { resourceType: "DiagnosticReport", id: "denom-EXM125-3" },
            })}
          >
            <UpdateResourcePage />
          </RouterContext.Provider>,
        ),
      );
    });

    const updateButton = screen.getByRole("button", {
      name: "Update Resource",
    }) as HTMLButtonElement;

    await waitFor(() => expect(updateButton).not.toBeDisabled());
    fireEvent.click(updateButton);

    const errorNotif = (await screen.findByRole("alert")) as HTMLDivElement;
    expect(errorNotif).toBeInTheDocument();

    expect(within(errorNotif).getByText(/Resource successfully updated!/)).toBeInTheDocument();
  });
  afterAll(() => {
    jest.clearAllMocks();
  });
});

describe("invalid update test", () => {
  beforeEach(() => {
    global.fetch = getMockFetchImplementation(ERROR_400_RESPONSE_BODY, 400, "Bad Request");
    document.createRange = createRectRange;
  });

  it("test for error notification for 400 response", async () => {
    document.createRange = createRectRange;

    await act(async () => {
      render(
        mantineRecoilWrap(
          <RouterContext.Provider
            value={createMockRouter({
              query: { resourceType: "DiagnosticReport", id: "denom-EXM125-3" },
            })}
          >
            <UpdateResourcePage />
          </RouterContext.Provider>,
        ),
      );
    });

    const updateButton = screen.getByRole("button", {
      name: "Update Resource",
    }) as HTMLButtonElement;

    await waitFor(() => expect(updateButton).not.toBeDisabled());
    fireEvent.click(updateButton);

    const errorNotif = (await screen.findByRole("alert")) as HTMLDivElement;
    expect(errorNotif).toBeInTheDocument();

    expect(within(errorNotif).getByText(/400 Bad Request/)).toBeInTheDocument();
    expect(within(errorNotif).getByText(/Invalid resource body/)).toBeInTheDocument();
  });
});

describe("error thrown during update test", () => {
  beforeEach(() => {
    global.fetch = getMockFetchImplementation(SINGLE_RESOURCE_BODY, 500);
    document.createRange = createRectRange;
  });

  it("test for error notification when error is thrown", async () => {
    document.createRange = createRectRange;

    await act(async () => {
      render(
        mantineRecoilWrap(
          <RouterContext.Provider
            value={createMockRouter({
              query: { resourceType: "DiagnosticReport", id: "denom-EXM125-3" },
            })}
          >
            <UpdateResourcePage />
          </RouterContext.Provider>,
        ),
      );
    });

    const updateButton = screen.getByRole("button", {
      name: "Update Resource",
    }) as HTMLButtonElement;

    await waitFor(() => expect(updateButton).not.toBeDisabled());
    fireEvent.click(updateButton);

    const errorNotif = (await screen.findByRole("alert")) as HTMLDivElement;
    expect(errorNotif).toBeInTheDocument();

    expect(within(errorNotif).getByText(/Problem connecting to server:/)).toBeInTheDocument();
  });
});
