import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import ResourceCodeEditor from "../../../components/ResourceCodeEditor";
import { Button, Center, Stack, Text } from "@mantine/core";
import { textGray } from "../../_app";
import BackButton from "../../../components/BackButton";
import { cleanNotifications, showNotification, NotificationProps } from "@mantine/notifications";
import { Check, X } from "tabler-icons-react";
//import Link from "next/link";

const UpdateResourcePage = () => {
  const router = useRouter();
  const { resourceType, id } = router.query;
  const [codeEditorContents, setCodeEditorContents] = useState("");
  const [hasLintError, setHasLintError] = useState(true);

  const [pageBody, setPageBody] = useState("");
  useEffect(() => {
    if (resourceType && id) {
      //fetch the resource JSON content from the test server based on given resource and id
      fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/${resourceType}/${id}`)
        .then((data) => {
          return data.json();
        })
        .then((resourcePageBody) => {
          setPageBody(JSON.stringify(resourcePageBody, null, 2));
        });
    }
  }, [resourceType, id]);

  return (
    <div style={{ paddingLeft: "15px", paddingRight: "15px" }}>
      <BackButton />
      <Stack spacing="xs">
        <Center>
          <h2 style={{ color: textGray, marginTop: "2px" }}> Update Resource</h2>
        </Center>
        <Center>
          <Text size="md" color={textGray}>
            Edit the FHIR resource body with valid JSON. Click Update Resource to update.
          </Text>
        </Center>
      </Stack>
      <div style={{ paddingTop: "20px", paddingBottom: "20px" }}>
        <ResourceCodeEditor
          initialValue={pageBody}
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
          Update Resource
        </Button>
      </Center>
    </div>
  );

  //handles what will happen when the submit button is clicked.
  async function editorSubmitHandler() {
    let customMessage: NotificationProps["message"] = <div>Problem connecting to server</div>;
    let notifProps: NotificationProps = {
      message: customMessage,
      color: "red",
      icon: <X size={18} />,
      autoClose: false,
    };

    await fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/${resourceType}/${id}`, {
      method: "PUT",
      body: codeEditorContents,
      headers: {
        "Content-Type": "application/json+fhir",
      },
    })
      .then((response) => {
        if (response.status === 201 || response.status === 200) {
          /*const regexResponse = NEW_ID_IN_HEADER_REGEX.exec(
            response.headers.get("Location") as string,
          ) as RegExpExecArray;

          newID = regexResponse[0];*/
          customMessage = (
            <>
              <Text>Resource successfully updated!&nbsp;</Text>
            </>
          );
          notifProps = {
            ...notifProps,
            color: "green",
            icon: <Check size={18} />,
          };

          //redirects user to the resourceType home page
          router.push({ pathname: `/${resourceType}/${id}` });
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
        customMessage = (
          <>
            <Text weight={500}>Problem connecting to server:&nbsp;</Text>
            <Text color="red">{error.message}</Text>
          </>
        );
      });
    cleanNotifications();
    showNotification({ ...notifProps, message: customMessage });
  }
};

export default UpdateResourcePage;
