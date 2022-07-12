import { render, screen, act, fireEvent, within } from "@testing-library/react";
//import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import UpdateResourcePage from "../../../../pages/[resourceType]/[id]/update";
import {
  mantineRecoilWrap,
  createMockRouter,
  getMockFetchImplementation,
  getMockFetchImplementationError,
  createRectRange,
} from "../../../helpers/testHelpers";
import { RouterContext } from "next/dist/shared/lib/router-context";

const SINGLE_RESOURCE_BODY = {
  resourceType: "DiagnosticReport",
  id: "denom-EXM125-3",
  meta: {
    profile: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note",
  },
};

describe("update resource page render", () => {
  beforeEach(() => {
    global.fetch = getMockFetchImplementation(SINGLE_RESOURCE_BODY);
    document.createRange = createRectRange;
  });
  it("should display a code editor component, update resource button, and a back button", async () => {
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
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Update Resource" })).toBeInTheDocument();
    expect(await screen.findByTestId("resource-code-editor")).toBeInTheDocument();
  });
});

describe("error response test", () => {
  beforeEach(async () => {
    global.fetch = await getMockFetchImplementation({
      type: "cors",
      url: "http://localhost:3000/4_0_1/Patient/numer-EXM104",
      redirected: false,
      status: 200,
      ok: true,
    });

    document.createRange = createRectRange;
  });

  console.log(
    "mock: ",
    getMockFetchImplementation({
      type: "cors",
      url: "http://localhost:3000/4_0_1/Patient/numer-EXM104",
      redirected: false,
      status: 200,
      ok: true,
    }),
  );
});

/*
  {
      type: "cors",
      url: "http://localhost:3000/4_0_1/Patient/numer-EXM104",
      redirected: false,
      status: 200,
      ok: true,
    }
  */

it("test valid update", async () => {
  //const user = userEvent.setup();
  document.createRange = () => {
    const range = new Range();

    range.getBoundingClientRect = jest.fn();

    range.getClientRects = () => {
      return {
        item: () => null,
        length: 0,
        [Symbol.iterator]: jest.fn(),
      };
    };

    return range;
  };

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

  //const codeEditor = screen.getByRole("textbox");

  await act(async () => {
    //user.type(codeEditor, "{}");
    fireEvent.click(updateButton);
  });

  const errorNotif = (await screen.findByRole("alert")) as HTMLDivElement;
  expect(errorNotif).toBeInTheDocument();

  const errorMessage = within(errorNotif).getByText(/Resource successfully updated! /);
  expect(errorMessage).toBeInTheDocument();
});
