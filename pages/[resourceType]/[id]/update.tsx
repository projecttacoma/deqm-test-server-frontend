import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import ResourceCodeEditor from "../../../components/ResourceCodeEditor";
import { Button, Center, Stack, Text, Loader, Divider } from "@mantine/core";
import { textGray } from "../../../styles/appColors";
import BackButton from "../../../components/BackButton";
import { cleanNotifications, showNotification, NotificationProps } from "@mantine/notifications";
import { Check, X } from "tabler-icons-react";

/**
 * UpdateResourcePage is a page that renders a code editor pre-filled with the resource's body,
 * a "submit" button for updating resources, and a back button. When the "submit" button is clicked,
 * a PUT request is sent to the test server. If the request is successful, a success notification
 * appears and the user is redirected to the resource's home. Otherwise, an error notification appears.
 * @returns React node with a ResourceCodeEditor component, a "submit" Button, and a back button
 */
const UpdateResourcePage = () => {
  const router = useRouter();
  const { resourceType, id } = router.query;
  const [fetchingError, setFetchingError] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [codeEditorContents, setCodeEditorContents] = useState("");
  const [hasLintError, setHasLintError] = useState(true);

  const [pageBody, setPageBody] = useState("");
  useEffect(() => {
    if (resourceType && id) {
      setLoadingRequest(true);
      //fetch the resource JSON content from the test server based on resource and id from url
      fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/${resourceType}/${id}`)
        .then((data) => {
          return data.json();
        })
        .then((resourcePageBody) => {
          setPageBody(JSON.stringify(resourcePageBody, null, 2));
          setLoadingRequest(false);
          setFetchingError(false);
        })
        .catch((error) => {
          console.log(error.message, "...start the server");
          setFetchingError(true);
          setLoadingRequest(false);
          cleanNotifications();
          showNotification({
            message: "Not connected to server!",
            color: "red",
            autoClose: false,
          });
        });
    }
  }, [resourceType, id]);

  return loadingRequest ? ( //if loading, Loader object is returned
    <Center>
      <div>Loading content...</div>
      <Loader color="cyan"></Loader>
    </Center>
  ) : !fetchingError && pageBody ? ( //if http get request was successful, UpdateResourcePage component is returned
    <div style={{ paddingLeft: "15px", paddingRight: "15px" }}>
      <BackButton />
      <Stack spacing="xs">
        <Center>
          <h2 style={{ color: textGray, marginTop: "2px", marginBottom: "0px" }}>
            Update Resource
          </h2>
        </Center>
        <Divider my="sm" />
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
  ) : (
    //if error occurs in http request, empty tag returned
    <div />
  );

  //called when submit button is clicked. Handles PUT request and response
  function editorSubmitHandler() {
    let customMessage = <Text weight={500}>Problem connecting to server:&nbsp;</Text>;
    let notifProps: NotificationProps = {
      message: customMessage,
      color: "red",
      icon: <X size={18} />,
      autoClose: false,
    };

    fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/${resourceType}/${id}`, {
      method: "PUT",
      body: codeEditorContents,
      headers: {
        "Content-Type": "application/json+fhir",
      },
    })
      .then((response) => {
        if (response.status === 201 || response.status === 200) {
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
          customMessage = (
            <Text weight={500}>
              {response.status} {response.statusText}&nbsp;
            </Text>
          );
          return response.json();
        }
      })
      .then((responseBody) => {
        if (responseBody) {
          customMessage = (
            <>
              {customMessage}
              <Text color="red">{responseBody.issue[0].details.text}</Text>
            </>
          );
        }
      })
      .catch((error) => {
        customMessage = (
          <>
            {customMessage}
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
