import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import NewResource from "../../pages/[resourceType]/create";

describe("resource ID button render", () => {
    
    it("should display the create resource button and textbox", async () => {
        await act(async () => {
        render(
            < NewResource />
        );
        });
        expect(await screen.findByRole("button", { name: "Submit Resource" })).toBeInTheDocument();
        expect(await screen.findByTestId("codeBlock")).toBeInTheDocument();
    });
});