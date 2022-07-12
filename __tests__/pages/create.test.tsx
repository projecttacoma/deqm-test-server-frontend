import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import CreateResourcePage from "../../pages/[resourceType]/create";
import { RouterContext } from "next/dist/shared/lib/router-context";
import {
  mantineRecoilWrap,
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

/*
  An issue arose when trying to mock user input of valid JSON into the code editor in order to enable the
  submit button for unit testing. So, testing of the create resource fetch implementation needs further investigation because 
  the behavior of the ResourceCodeEditor and submit button in a unit test diverges from that of the app in a browser.
*/
describe.skip("error response test", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementationError("Problem connecting to server");
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
      user.type(codeEditor, "{}");
      user.click(submitButton);
    });

    expect((await screen.findByRole("alert")) as HTMLDivElement).toBeInTheDocument();
  });
});
