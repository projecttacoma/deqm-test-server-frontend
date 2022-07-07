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

  //handles what will happen once the submit button is clicked.
  //For now, it console.logs the contents of the ResourceCodeEditor
  function editorSubmitHandler() {
    console.log(`createNew${resourceType} function called`);
    console.log("submittedVal", codeEditorContents);
    fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/${resourceType}`, {
      method: "POST",
      body: codeEditorContents,
      headers: {
        "Content-Type": "application/json+fhir",
      },
    })
      .then((response) => {
        let notifProps;
        console.log(response.headers.get("Location"));
        if (response.status === 201 || response.status === 200) {
          const newID = resourceType
            ? response.headers.get("Location")?.substring(7 + resourceType.length)
            : "";

          notifProps = {
            message: response.status + ": New resource successfully created.",
            color: "green",
            icon: <Check size={18} />,
          };

          router.push({ pathname: `/${resourceType}`, query: { newResourceID: newID } });
        } else {
        }
        cleanNotifications();
        showNotification({
          message: response.status + ": " + response.statusText,
          color: "red",
          autoClose: false,
          ...notifProps,
        });
      })
      .catch((error) => {
        console.log(error);
        cleanNotifications();
        showNotification({
          message: "Problem connecting to server",
          icon: <X size={18} />,
          color: "red",
          autoClose: false,
        });
      });
  }
};

export default CreateResourcePage;
