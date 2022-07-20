import { render, screen, act, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import CreateResourcePage from "../../../pages/[resourceType]/create";
import { RouterContext } from "next/dist/shared/lib/router-context";
import {
  mantineRecoilWrap,
  createMockRouter,
  getMockFetchImplementationError,
  createRectRange,
  getMockFetchImplementation,
} from "../../helpers/testHelpers";
import userEvent from "@testing-library/user-event";

const ERROR_400_RESPONSE_BODY = { issue: [{ details: { text: "Invalid resource body" } }] };

describe("Create new resource page render", () => {
  it("should display a code editor component, submit resource button, and a back button", async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { resourceType: "Patient" },
          })}
        >
          <CreateResourcePage />
        </RouterContext.Provider>,
      );
    });
    expect(screen.getByTestId("back-button")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit Resource" })).toBeInTheDocument();
    expect(screen.getByTestId("resource-code-editor")).toBeInTheDocument();
  });
});

describe("Successful resource creation", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(
      "",
      200,
      "Resource created!!",
      new Headers({ Location: "4_0_1/DiagnosticReport/123456789" }),
    );
    document.createRange = createRectRange;
  });

  it("Test for success notification", async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(
        mantineRecoilWrap(
          <RouterContext.Provider
            value={createMockRouter({
              query: { resourceType: "DiagnosticReport" },
            })}
          >
            <CreateResourcePage />
          </RouterContext.Provider>,
        ),
      );
    });

    const submitButton = screen.getByRole("button", {
      name: "Submit Resource",
    }) as HTMLButtonElement;

    const codeEditor = screen.getByRole("textbox");

    //CodeMirror autocloses brackets, so only one is necessary to type
    await user.type(codeEditor, "{{");
    user.click(submitButton);

    const errorNotif = (await screen.findByRole("alert")) as HTMLDivElement;
    expect(errorNotif).toBeInTheDocument();

    expect(within(errorNotif).getByText(/Resource successfully created:/)).toBeInTheDocument();
    expect(within(errorNotif).getByText(/DiagnosticReport\/123456789/)).toBeInTheDocument();
  });
});

describe("Invalid resource creation", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(ERROR_400_RESPONSE_BODY, 400, "Bad Request");
    document.createRange = createRectRange;
  });

  it("Test for error notification for 400 response", async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(
        mantineRecoilWrap(
          <RouterContext.Provider
            value={createMockRouter({
              query: { resourceType: "DiagnosticReport" },
            })}
          >
            <CreateResourcePage />
          </RouterContext.Provider>,
        ),
      );
    });

    const submitButton = screen.getByRole("button", {
      name: "Submit Resource",
    }) as HTMLButtonElement;

    const codeEditor = screen.getByRole("textbox");

    await user.type(codeEditor, "{{");
    user.click(submitButton);

    const errorNotif = (await screen.findByRole("alert")) as HTMLDivElement;
    expect(errorNotif).toBeInTheDocument();

    expect(within(errorNotif).getByText(/400 Bad Request/)).toBeInTheDocument();
    expect(within(errorNotif).getByText(/Invalid resource body/)).toBeInTheDocument();
  });
});

describe("Error thrown during create test", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementationError("400 Bad Request");
    document.createRange = createRectRange;
  });

  it("Test for error notification when error is thrown", async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(
        mantineRecoilWrap(
          <RouterContext.Provider
            value={createMockRouter({
              query: { resourceType: "Patient" },
            })}
          >
            <CreateResourcePage />
          </RouterContext.Provider>,
        ),
      );
    });

    const submitButton = screen.getByRole("button", {
      name: "Submit Resource",
    }) as HTMLButtonElement;

    const codeEditor = screen.getByRole("textbox");

    await user.type(codeEditor, "{{");
    user.click(submitButton);

    const errorNotif = (await screen.findByRole("alert")) as HTMLDivElement;
    expect(errorNotif).toBeInTheDocument();

    expect(within(errorNotif).getByText(/Problem connecting to server:/)).toBeInTheDocument();
    expect(within(errorNotif).getByText(/400 Bad Request/)).toBeInTheDocument();
  });
});
