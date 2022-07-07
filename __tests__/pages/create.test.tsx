import { render, screen, act, within, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CreateResourcePage from "../../pages/[resourceType]/create";
import { RouterContext } from "next/dist/shared/lib/router-context";
import {
  mantineRecoilWrap,
  getMockFetchImplementation,
  createMockRouter,
  getMockFetchImplementationError,
} from "../helpers/testHelpers";
import userEvent from "@testing-library/user-event";

describe("create new resource page render", () => {
  it("should display a code editor component and a submit resource button", async () => {
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
    expect(await screen.findByRole("button", { name: "Submit Resource" })).toBeInTheDocument();
    expect(await screen.findByTestId("resource-code-editor")).toBeInTheDocument();
  });
});

describe.only("error response test", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementationError("Problem connecting to server");
  });

  it("should show error notification when not connected to server", async () => {
    const user = userEvent.setup();
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

    const submitButton = screen.getByRole("button", {
      name: "Submit Resource",
    }) as HTMLButtonElement;

    const codeEditor = screen.getByRole("textbox");
    user.click(submitButton);

    /* await act(async () => {
      //user.type(codeEditor, "{}");
      user.click(submitButton);
    });*/

    const errorNotif = (await screen.findByRole("alert")) as HTMLDivElement;
    expect(errorNotif).toBeInTheDocument();

    //const errorMessage = within(errorNotif).getByText(/Problem connecting to server/);
    //expect(errorMessage).toBeInTheDocument();

    //expect(await screen.findByText("Problem connecting to server")).toBeInTheDocument();
  });
});
