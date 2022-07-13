import { render, screen, act, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import CreateResourcePage from "../../../pages/[resourceType]/create";
import { RouterContext } from "next/dist/shared/lib/router-context";
import {
  mantineRecoilWrap,
  createMockRouter,
  getMockFetchImplementationError,
  createRectRange,
} from "../../helpers/testHelpers";
import userEvent from "@testing-library/user-event";

describe.skip("create new resource page render", () => {
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
    expect(await screen.findByTestId("back-button")).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Submit Resource" })).toBeInTheDocument();
    expect(await screen.findByTestId("resource-code-editor")).toBeInTheDocument();
  });
});

describe("error response test", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementationError("400 Bad Request");
    document.createRange = createRectRange;
  });

  it("should show error notification when not connected to server", async () => {
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

    await act(async () => {
      user.type(codeEditor, "{{");
    });

    const doneTyping = new Promise((resolve, reject) => {
      setTimeout(() => resolve("value"), 500);
    });
    doneTyping.finally(() => {
      console.log("clicking button");
      user.click(submitButton);
    });

    const errorNotif = (await screen.findByRole("alert")) as HTMLDivElement;
    expect(errorNotif).toBeInTheDocument();

    expect(within(errorNotif).getByText(/Problem connecting to server:/)).toBeInTheDocument();
    expect(within(errorNotif).getByText(/400 Bad Request/)).toBeInTheDocument();
  });
});
