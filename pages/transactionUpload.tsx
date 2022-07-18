import React, { useState } from "react";
import ResourceCodeEditor from "../components/ResourceCodeEditor";
import { Button, Center, Modal, Stack, Text, Title } from "@mantine/core";
import { cleanNotifications, showNotification, NotificationProps } from "@mantine/notifications";
import { Check, X } from "tabler-icons-react";
import { textGray } from "../styles/appColors";
import BackButton from "../components/BackButton";
import { fhirJson } from "@fhir-typescript/r4-core";
import Link from "next/link";

/**
 * TransactionUploadPage is a page that renders a code editor, a "submit" button for uploading transaction bundles, and a back button.
 * When the upload button is clicked, a POST request is sent to the test server. If the upload is
 * successful, a Modal pops up with a response for each request in the transaction bundle. Otherwise, an error notification appears.
 * @returns React node with a ResourceEditor Component, upload button, back button, and a Modal
 */
const TransactionUploadPage = () => {
  const [codeEditorContents, setCodeEditorContents] = useState("");
  const [hasLintError, setHasLintError] = useState(true);
  const [openResponseModal, setOpenResponseModal] = useState(false);
  const [modalContents, setModalContents] = useState<fhirJson.BundleEntry[] | null>(null);

  return (
    <div style={{ paddingLeft: "15px", paddingRight: "15px" }}>
      <Modal
        data-testid="transaction-response-modal"
        opened={openResponseModal}
        onClose={() => setOpenResponseModal(false)}
        size="60%"
        centered
        overflow="inside"
        title={
          <Title order={1} align="center" key="modal-title">
            <Check color="green" size={36} key="green-check" />
            Transaction Bundle Upload Successful!
          </Title>
        }
      >
        <Stack align="center" justify="space-between" spacing="xl" key="modal=contents">
          {processBundleResponse(modalContents)}
        </Stack>
      </Modal>
      <BackButton />
      <Stack spacing="xs">
        <Center key="Center-1">
          <h2 style={{ color: textGray, marginTop: "2px" }}>Upload Transaction Bundle</h2>
        </Center>
        <Center key="Center-2">
          <Text size="md" color={textGray}>
            Enter valid transaction bundle body. Then click the Upload button.
          </Text>
        </Center>
        <Center key="Center-3">
          <Text size="xs" color={textGray}>
            Note: Only PUT and POST requests are supported in a TransactionBundle at this time.
          </Text>
        </Center>
      </Stack>
      <div style={{ paddingTop: "20px", paddingBottom: "20px" }}>
        <ResourceCodeEditor
          initialValue=""
          onUpdate={(submittedVal) => setCodeEditorContents(submittedVal)}
          onValidate={(hasError) => setHasLintError(hasError)}
        />
      </div>
      <Center>
        <Button
          data-testid="upload-button"
          disabled={hasLintError}
          onClick={editorSubmitHandler}
          color="cyan"
          variant="filled"
          size="lg"
        >
          Upload Bundle
        </Button>
      </Center>
    </div>
  );

  //called when the submit button is clicked. Handles POST request and response
  async function editorSubmitHandler() {
    let customMessage: NotificationProps["message"] = <div>Problem connecting to server</div>;
    const notifProps: NotificationProps = {
      message: customMessage,
      color: "red",
      icon: <X size={18} />,
      autoClose: false,
    };
    let uploadSuccessful = false;

    fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/`, {
      method: "POST",
      body: codeEditorContents,
      headers: {
        "Content-Type": "application/json+fhir",
      },
    })
      .then((response) => {
        return response;
      })
      .then((response) => {
        if (response.status === 201 || response.status === 200) {
          customMessage = "Transaction Bundle Upload Successful";
          uploadSuccessful = true;
        } else {
          customMessage = `${response.status} ${response.statusText}`;
          uploadSuccessful = false;
        }
        return response.json();
      })
      .then((responseJSON) => {
        if (uploadSuccessful) {
          setOpenResponseModal(true);
          setModalContents(responseJSON.entry);
        } else {
          customMessage = (
            <>
              <Text weight={500}>{customMessage}&nbsp;</Text>
              <Text color="red">{responseJSON.issue[0].details.text}</Text>
            </>
          );
          cleanNotifications();
          showNotification({ ...notifProps, message: customMessage });
        }
      })
      .catch((error) => {
        if (error.name === "RegexError") {
          customMessage = <Text color="red">{error.message}</Text>;
        } else {
          customMessage = (
            <>
              <Text weight={500}>Problem connecting to server:&nbsp;</Text>
              <Text color="red">{error.message}</Text>
            </>
          );
        }
        cleanNotifications();
        showNotification({ ...notifProps, message: customMessage });
      });
  }

  //parses the response array from a transaction bundle upload and returns each response as an appropriate JSX Element
  function processBundleResponse(responseArray: fhirJson.BundleEntry[] | null) {
    return responseArray?.map((el, index) => {
      if (el?.response?.location) {
        const FHIR_VERSION_LENGTH = 6;
        const resourceLocation = el.response.location.substring(FHIR_VERSION_LENGTH);
        return (
          <div key={`${index}-${el.response.location}`}>
            {el.response.status}:&nbsp;
            <Link href={`/${resourceLocation}`} passHref>
              <Text component="a" color="cyan">
                {resourceLocation}
              </Text>
            </Link>
          </div>
        );
      } else if (el?.response?.outcome?.resourceType === "OperationOutcome") {
        const responseAsAny = el?.response?.outcome as fhirJson.OperationOutcome;
        if (responseAsAny.issue != null) {
          const issueArray = responseAsAny?.issue[0] as fhirJson.OperationOutcomeIssue;
          return (
            <Text
              key={`response-${index}`}
            >{`${el?.response?.status}: ${issueArray.details?.text}`}</Text>
          );
        } else {
          return el?.response?.status ? (
            <Text key={`response-${index}`}>{el?.response?.status}</Text>
          ) : (
            <Text key={`response-${index}`}>Unexpected response</Text>
          );
        }
      } else {
        return <Text key={`response-${index}`}>Unexpected response</Text>;
      }
    });
  }
};

export default TransactionUploadPage;
