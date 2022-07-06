import { useRouter } from "next/router";
import React, { useState } from "react";
import ResourceCodeEditor from "../../components/ResourceCodeEditor";
import { Button, Center, Text } from "@mantine/core";
import { cyanMainShade } from "../_app";
/**
 * CreateResourcePage is a page that renders a code editor and submit button for creating resources.
 * @returns React node with a ResourceCodeEditor component and a submit Button
 */
const CreateResourcePage = () => {
  const router = useRouter();
  const { resourceType } = router.query;
  const [codeEditorContents, setCodeEditorContents] = useState("");
  const [hasLintError, setHasLintError] = useState(true);

  //handles what will happen once the submit button is clicked.
  //For now, it console.logs the contents of the ResourceCodeEditor
  function editorSubmitHandler() {
    console.log(codeEditorContents);
  }

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
};

export default CreateResourcePage;
