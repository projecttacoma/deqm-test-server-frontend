import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import NewResource from "../../pages/[resourceType]/create";
import { createMockRouter } from "../helpers/testHelpers";
import { RouterContext } from "next/dist/shared/lib/router-context";

describe("create new resource page render", () => {
  it("should display a code editor component and a submit resource button", async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { resourceType: "Patient" },
          })}
        >
          <NewResource></NewResource>
        </RouterContext.Provider>,
      );
    });
    expect(await screen.findByRole("button", { name: "Submit Resource" })).toBeInTheDocument();
    expect(await screen.findByTestId("resourceCodeEditor")).toBeInTheDocument();
  });
});
