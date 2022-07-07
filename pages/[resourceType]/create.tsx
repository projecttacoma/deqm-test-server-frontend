import { useRouter } from "next/router";
import React, { useState } from "react";
import ResourceCodeEditor from "../../components/ResourceCodeEditor";
import { Button, Center, Text } from "@mantine/core";
import { cyanMainShade } from "../_app";
import { cleanNotifications, showNotification } from "@mantine/notifications";
import Link from "next/link";
import { Check, X } from "tabler-icons-react";
/**
 * CreateResourcePage is a page that renders a code editor and submit button for creating resources.
 * When the submit button is clicked, a POST request is sent to the test server. If the request is
 * successful, a success notification with the new ID as a Link appears. Otherwise, an error notification appears.
 * @returns React node with a ResourceCodeEditor component and a submit Button
 */
const CreateResourcePage = () => {
  const router = useRouter();
  const { resourceType } = router.query;
  const [codeEditorContents, setCodeEditorContents] = useState("");
  const [hasLintError, setHasLintError] = useState(true);

  return (
    <div>
      <Center>
        <h2 style={{ color: cyanMainShade }}> Create New Resource</h2>
      </Center>
      <Center>
        <Text size="md" color={cyanMainShade}>
          Enter valid FHIR resource body for a new {resourceType} resource
        </Text>
      </Center>
      <div style={{ padding: "20px" }}>
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

  //handles what will happen when the submit button is clicked.
  function editorSubmitHandler() {
    let notifProps = {
      message: <div>Problem connecting to server</div>,
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
          newID = resourceType
            ? response.headers.get("Location")?.substring(7 + resourceType.length)
            : "";

          notifProps = {
            ...notifProps,
            //new ID rendered as a Link that navigates to page displaying the resource's body
            message: (
              <>
                <Text>Resource successfully created:&nbsp;</Text>
                <Link href={`/${resourceType}/${newID}`} key={`${resourceType}/${newID}`} passHref>
                  <Text component="a" color="cyan">
                    {resourceType}/{newID}
                  </Text>
                </Link>
              </>
            ),
            color: "green",
            icon: <Check size={18} />,
          };
          //redirects user to the resourceType home page
          router.push({ pathname: `/${resourceType}` });
        } else {
          notifProps = {
            ...notifProps,
            message: <>{`${response.status}: ${response.statusText}`}</>,
          };
        }
        cleanNotifications();
        showNotification(notifProps);
      })
      .catch((error) => {
        console.log(error);
        cleanNotifications();
        showNotification({
          ...notifProps,
          message: (
            <>
              <Text weight={500}>Problem connecting to server:&nbsp;</Text>
              <Text color="red">{error.message}</Text>
            </>
          ),
        });
      });
  }
};

export default CreateResourcePage;
