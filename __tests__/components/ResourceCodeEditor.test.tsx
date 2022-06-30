import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import ResourceCodeEditor from "../../components/ResourceCodeEditor";

describe("Test ResourceCodeEditor component render", () => {
  it("should display a CodeMirror component and Submit button", async () => {
    await act(async () => {
      render(
        <ResourceCodeEditor
          initialValue=""
          onClickFunction={() => {
            console.log("");
          }}
          buttonName="Submit"
        ></ResourceCodeEditor>,
      );
    });
    expect(await screen.findByRole("button", { name: "Submit" })).toBeInTheDocument();
    expect(await screen.findByTestId("resourceCodeEditor")).toBeInTheDocument();
  });
});
