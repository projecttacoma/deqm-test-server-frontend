import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMockRouter } from "../../../helpers/testHelpers";
import { RouterContext } from "next/dist/shared/lib/router-context";
import EvaluateMeasurePage from "../../../../pages/[resourceType]/[id]/evaluate";

describe("Test evaluate page render for measure", () => {
  it("should display expected text", async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { resourceType: "Measure", id: "Measure-12" },
          })}
        >
          <EvaluateMeasurePage />
        </RouterContext.Provider>,
      );
    });

    expect(screen.getByText(/Coming soon.../)).toBeInTheDocument();
  });
});

describe("Test evaluate page render for non-measure", () => {
  it("should display an error message", async () => {
    await act(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            query: { resourceType: "DiagnosticReport", id: "denom-EXM125-3" },
          })}
        >
          <EvaluateMeasurePage />
        </RouterContext.Provider>,
      );
    });

    expect(
      screen.getByText(
        /Cannot evaluate on resourceType: DiagnosticReport, only on resourceType: Measure/,
      ),
    ).toBeInTheDocument();
  });
});
