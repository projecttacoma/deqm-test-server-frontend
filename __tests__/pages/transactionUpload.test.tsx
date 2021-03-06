import { render, screen, act, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import TransactionUploadPage from "../../pages/transactionUpload";
import {
  mantineRecoilWrap,
  getMockFetchImplementationError,
  getMockFetchImplementation,
  createRectRange,
} from "../helpers/testHelpers";
import userEvent from "@testing-library/user-event";

const SUCCESSFUL_UPLOAD_RESPONSE_JSON = {
  resourceType: "Bundle",
  id: "0dcba414-6519-4b33-85ec-c623e9c2c7e7",
  type: "transaction-response",
  link: [
    {
      relation: "self",
      url: "http://localhost:3000",
    },
  ],
  entry: [
    {
      response: {
        status: "200 OK",
        location: "4_0_1/MeasureReport/Measure12",
      },
    },
    {
      response: {
        status: "400 BadRequest",
        outcome: {
          resourceType: "OperationOutcome",
          issue: [
            {
              severity: "error",
              code: "BadRequest",
              details: {
                text: "resourceType: Pxatient is not a supported resourceType",
              },
            },
          ],
        },
      },
    },
    {
      response: {
        status: "201 Created",
        location: "4_0_1/Patient/823487ad-13d8-4806-bec7-069839b0255c",
      },
    },
  ],
};

const ERROR_400_RESPONSE_BODY = { issue: [{ details: { text: "Invalid resource body" } }] };

describe("Upload transaction bundle page render", () => {
  it("should display a code editor component, upload bundle button, and a back button", async () => {
    await act(async () => {
      render(<TransactionUploadPage />);
    });
    expect(await screen.findByTestId("back-button")).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Upload Bundle" })).toBeInTheDocument();
    expect(await screen.findByTestId("resource-code-editor")).toBeInTheDocument();
  });
  afterAll(() => {
    jest.clearAllMocks();
  });
});

describe("Error thrown during create test", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementationError("Try restarting the server");
    document.createRange = createRectRange;
  });

  it("Test for error notification when error is thrown", async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(mantineRecoilWrap(<TransactionUploadPage />));
    });

    const submitButton = screen.getByRole("button", {
      name: "Upload Bundle",
    }) as HTMLButtonElement;

    const codeEditor = screen.getByRole("textbox");

    await user.type(codeEditor, "{{");
    await user.click(submitButton);

    const errorNotif = (await screen.findByRole("alert")) as HTMLDivElement;
    expect(errorNotif).toBeInTheDocument();

    expect(within(errorNotif).getByText(/Problem connecting to server:/)).toBeInTheDocument();
    expect(within(errorNotif).getByText(/Try restarting the server/)).toBeInTheDocument();
  });
  afterAll(() => {
    jest.clearAllMocks();
  });
});

describe("Invalid bundle upload", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(ERROR_400_RESPONSE_BODY, 400, "Bad Request");
    document.createRange = createRectRange;
  });

  it("Test for error notification for 400 response", async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(mantineRecoilWrap(<TransactionUploadPage />));
    });

    const submitButton = await screen.findByTestId("upload-button");

    const codeEditor = (await screen.findByRole("textbox")) as HTMLDivElement;

    await user.type(codeEditor, "{{");
    await user.click(submitButton);

    const errorNotif = (await screen.findByRole("alert")) as HTMLDivElement;
    expect(errorNotif).toBeInTheDocument();
    expect(within(errorNotif).getByText(/400 Bad Request/)).toBeInTheDocument();
    expect(within(errorNotif).getByText(/Invalid resource body/)).toBeInTheDocument();
  });
  afterAll(() => {
    jest.clearAllMocks();
  });
});

describe("Successful bundle upload", () => {
  beforeAll(() => {
    global.fetch = getMockFetchImplementation(SUCCESSFUL_UPLOAD_RESPONSE_JSON, 200);
    document.createRange = createRectRange;
  });

  it("Test for modal popping up containing responses for each entry in the bundle", async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<TransactionUploadPage />);
    });

    const submitButton = screen.getByRole("button", {
      name: "Upload Bundle",
    }) as HTMLButtonElement;

    const codeEditor = screen.getByRole("textbox");

    await user.type(codeEditor, "{{");
    await user.click(submitButton);

    const responseModal = await screen.findByTestId("transaction-response-modal");

    expect(responseModal).toBeInTheDocument();
    expect(
      within(responseModal).getByText(/Transaction Bundle Upload Successful!/),
    ).toBeInTheDocument();
    expect(within(responseModal).getByText(/201 Created/)).toBeInTheDocument();
    expect(
      within(responseModal).getByRole("link", {
        name: "Patient/823487ad-13d8-4806-bec7-069839b0255c",
      }),
    ).toBeInTheDocument();
    expect(within(responseModal).getByText(/200 OK/)).toBeInTheDocument();
    expect(
      within(responseModal).getByRole("link", { name: "MeasureReport/Measure12" }),
    ).toBeInTheDocument();
    expect(within(responseModal).getByText(/400 BadRequest:/)).toBeInTheDocument();
  });
  afterAll(() => {
    jest.clearAllMocks();
  });
});
