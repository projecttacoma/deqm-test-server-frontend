import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "../../pages/index";
import { mantineRecoilWrap } from "../helpers/testHelpers";

describe("Test Home page rendering", () => {
  it("should display an Upload Transaction Bundle button", async () => {
    await act(async () => {
      render(mantineRecoilWrap(<Home></Home>));
    });
    expect(
      await screen.findByRole("link", { name: "Upload Transaction Bundle" }),
    ).toBeInTheDocument();
  });
});
