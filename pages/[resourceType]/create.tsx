import { useRouter } from "next/router";
import React, { useState } from "react";
import ResourceCodeEditor from "../../components/ResourceCodeEditor";
import { Button, Center, Stack, Text } from "@mantine/core";
import { cleanNotifications, showNotification, NotificationProps } from "@mantine/notifications";
import Link from "next/link";
import { Check, X } from "tabler-icons-react";
import { textGray } from "../_app";
/**
 * CreateResourcePage is a page that renders a code editor, a submit button for creating resources, and a back button.
 * When the submit button is clicked, a POST request is sent to the test server. If the request is
 * successful, a success notification with the new ID as a Link appears. Otherwise, an error notification appears.
 * @returns React node with a ResourceCodeEditor component, a submit Button, and a back button
 */
const CreateResourcePage = () => {
  const router = useRouter();
  const { resourceType } = router.query;
  const [codeEditorContents, setCodeEditorContents] = useState("");
  const [hasLintError, setHasLintError] = useState(true);
  const NEW_ID_IN_HEADER_REGEX = new RegExp(`${resourceType}/[A-Za-z0-9\-\.]{1,64}`);

  return (
    <div style={{ paddingLeft: "15px", paddingRight: "15px" }}>
      <Button
        onClick={() => router.back()}
        color="cyan"
        radius="md"
        size="md"
        variant="filled"
        style={{
          float: "left",
        }}
      >
        Back
      </Button>
      <Stack spacing="xs">
        <Center>
          <h2 style={{ color: textGray, marginTop: "2px" }}> Create New Resource</h2>
        </Center>
        <Center>
          <Text size="md" color={textGray}>
            Enter valid FHIR resource body for a new {resourceType} resource
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
          disabled={hasLintError}
          onClick={editorSubmitHandler}
          color="cyan"
          variant="filled"
          size="lg"
        >
          Submit Resource
        </Button>
      </Center>
    </div>
  );

  //called when the submit button is clicked. Handles POST request and response
  async function editorSubmitHandler() {
    let customMessage: NotificationProps["message"] = <div>Problem connecting to server</div>;
    let notifProps: NotificationProps = {
      message: customMessage,
      color: "red",
      icon: <X size={18} />,
      autoClose: false,
    };

    fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/${resourceType}`, {
      method: "POST",
      body: codeEditorContents,
      headers: {
        "Content-Type": "application/json+fhir",
      },
    })
      .then((response) => {
        let newID;

        if (response.status === 201 || response.status === 200) {
          const regexResponse = NEW_ID_IN_HEADER_REGEX.exec(
            response.headers.get("Location") as string,
          );

          if (regexResponse == null) {
            throw {
              name: "RegexError",
              message:
                "Invalid regexResponse: couldn't find resource ID in response header.\nLocation Header: " +
                response.headers.get("Location"),
            };
          }

          newID = regexResponse[0];
          customMessage = (
            <>
              <Text>Resource successfully created:&nbsp;</Text>
              <Link href={`/${newID}`} key={`${newID}`} passHref>
                <Text component="a" color="cyan">
                  {newID}
                </Text>
              </Link>
            </>
          );
          notifProps = {
            ...notifProps,
            color: "green",
            icon: <Check size={18} />,
          };

          //redirects user to the resourceType home page
          router.push({ pathname: `/${resourceType}` });
        } else {
          customMessage = `${response.status} ${response.statusText}`;
          return response.json();
        }
      })
      .then((responseBody) => {
        if (responseBody) {
          customMessage = (
            <>
              <Text weight={500}>{customMessage}&nbsp;</Text>
              <Text color="red">{responseBody.issue[0].details.text}</Text>
            </>
          );
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
      })
      .finally(() => {
        cleanNotifications();
        showNotification({ ...notifProps, message: customMessage });
      });
  }
};

export default CreateResourcePage;

/*
<Center>
        <h2 style={{ color: cyanMainShade }}> Create New Resource</h2>
      </Center>
      <Center>
        <Text size="md" color={cyanMainShade}>
          Enter valid FHIR resource body for a new {resourceType} resource
        </Text>
      </Center>
*/
