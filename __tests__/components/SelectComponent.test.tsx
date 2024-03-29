import { render, screen, act, within, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  mantineRecoilWrap,
  getMockFetchImplementation,
  mockResizeObserver,
} from "../helpers/testHelpers";
import { fhirJson } from "@fhir-typescript/r4-core";
import SelectComponent from "../../components/SelectComponent";

const RESOURCE_ID_BODY: fhirJson.Bundle = {
  resourceType: "Bundle",
  meta: {
    lastUpdated: "2022-06-23T19:52:58.721Z",
  },
  type: "searchset",
  total: 2,
  entry: [
    {
      fullUrl: "http://localhost:3000/4_0_1/Practitioner/denom-EXM125-3",
      resource: {
        resourceType: "Practitioner",
        id: "denom-EXM125-3",
        meta: {
          profile: ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-Practitioner-note"],
        },
      },
    },
    {
      fullUrl: "http://localhost:3000/4_0_1/Practitioner/numer-EXM125-3",
      resource: {
        resourceType: "Practitioner",
        id: "numer-EXM125-3",
        meta: {
          profile: ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-Practitioner-note"],
        },
      },
    },
  ],
};

const NO_RESOURCE_ID: fhirJson.Bundle = {
  resourceType: "Bundle",
  meta: {
    lastUpdated: "2022-06-23T19:52:58.721Z",
  },
  type: "searchset",
  total: 0,
  entry: [],
};

describe("Select component render", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(RESOURCE_ID_BODY);
  });

  window.ResizeObserver = mockResizeObserver;

  it("should display a dropdown menu populated with resource ID's when prompted by user key presses", async () => {
    await act(async () => {
      render(
        mantineRecoilWrap(
          <SelectComponent resourceType="Practitioner" value="" setValue={jest.fn()} />,
        ),
      );
    });

    //retrieves the combobox (role of the select component) and the input field within the combobox
    const autocomplete = screen.getByRole("combobox");
    const input = within(autocomplete).getByRole("searchbox");
    autocomplete.focus();

    //mocks user key clicks to test the input fields and drop down menus
    await act(async () => {
      fireEvent.change(input, { target: { value: "P" } });
      fireEvent.keyDown(autocomplete, { key: "ArrowDown" });
      fireEvent.keyDown(autocomplete, { key: "Enter" });
    });

    //verifies that the drop down autocomplete menu is populated with the resource IDs fetched from the server
    const options = screen.getAllByRole("option");
    expect(options[0].textContent).toBe("Practitioner/denom-EXM125-3");
    expect(options[1].textContent).toBe("Practitioner/numer-EXM125-3");
  });

  it("tests for SelectComponent that is required", async () => {
    await act(async () => {
      render(
        mantineRecoilWrap(
          <SelectComponent
            resourceType="Practitioner"
            value=""
            setValue={jest.fn()}
            required={true}
          />,
        ),
      );
    });

    expect(within(screen.getByRole("combobox")).getByRole("searchbox")).toBeRequired();
  });
});

describe("MultiSelect component render with no resources", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(NO_RESOURCE_ID);
  });

  window.ResizeObserver = mockResizeObserver;

  it("should display a disabled select component when no resources are available", async () => {
    await act(async () => {
      render(
        mantineRecoilWrap(
          <SelectComponent resourceType="Practitioner" value="" setValue={jest.fn()} />,
        ),
      );
    });

    //makes sure component doesn't offer resource options if the resoureType is empty
    const autocomplete = screen.getByRole("combobox");
    expect(within(autocomplete).getByPlaceholderText("No resources of type Practitioner found"));
  });
});
