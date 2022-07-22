import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "../../pages/index";
import { mantineRecoilWrap } from "../helpers/testHelpers";

describe("Test Home page rendering", () => {
  it("should display an Upload Transaction Bundle button", () => {
    render(mantineRecoilWrap(<Home></Home>));
    expect(screen.getByRole("link", { name: "Upload Transaction Bundle" })).toBeInTheDocument();
  });
});
