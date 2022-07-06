import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import ResourceCodeEditor from "../../components/ResourceCodeEditor";

describe("Test ResourceCodeEditor component render", () => {
  it("should display a CodeMirror component", async () => {
    await act(async () => {
      render(<ResourceCodeEditor initialValue=""></ResourceCodeEditor>);
    });
    expect(await screen.findByTestId("resource-code-editor")).toBeInTheDocument();
  });
});
