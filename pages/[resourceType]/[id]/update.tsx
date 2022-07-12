import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import ResourceCodeEditor from "../../../components/ResourceCodeEditor";
import { Button, Center, Stack, Text } from "@mantine/core";
import { textGray } from "../../_app";
import BackButton from "../../../components/BackButton";
import { cleanNotifications, showNotification, NotificationProps } from "@mantine/notifications";
import { Check, X } from "tabler-icons-react";

const UpdateResourcePage = () => {
  const router = useRouter();
  const { resourceType, id } = router.query;
  const [codeEditorContents, setCodeEditorContents] = useState("");
  const [hasLintError, setHasLintError] = useState(true);

  const [pageBody, setPageBody] = useState("");
  useEffect(() => {
    if (resourceType && id) {
      //fetch the resource JSON content from the test server based on resource and id from url
      fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/${resourceType}/${id}`)
        .then((data) => {
          return data.json();
        })
        .then((resourcePageBody) => {
          console.log("resourcePageBody: ", resourcePageBody);
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

  //called when submit button is clicked. Handles PUT request and response
  function editorSubmitHandler() {
    let customMessage: NotificationProps["message"] = <div>Problem connecting to server</div>;
    let notifProps: NotificationProps = {
      message: customMessage,
      color: "red",
      icon: <X size={18} />,
      autoClose: false,
    };

    console.log("codeEditorContents: ", codeEditorContents);

    fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/${resourceType}/${id}`, {
      method: "PUT",
      body: codeEditorContents,
      headers: {
        "Content-Type": "application/json+fhir",
      },
    })
      .then((response) => {
        console.log("response: ", response.status, response);
        if (response.status === 201 || response.status === 200) {
          console.log("201");
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

          //redirects user to page with the resource's body
          router.push({ pathname: `/${resourceType}/${id}` });
        } else {
          console.log("non 201: ", response);
          customMessage = `${response.status} ${response.statusText}`;
          return response.json();
        }
      })
      .then((responseBody) => {
        console.log("non 201 CONT: ", responseBody);
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
        console.log("catch block");
        customMessage = (
          <>
            <Text weight={500}>Problem connecting to server:&nbsp;</Text>
            <Text color="red">{error.message}</Text>
          </>
        );
      })
      .finally(() => {
        cleanNotifications();
        showNotification({ ...notifProps, message: customMessage });
      });
  }
};

export default UpdateResourcePage;
