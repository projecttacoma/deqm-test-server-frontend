import { useRouter } from "next/router";
import React from "react";
import ResourceCodeEditor from "../../components/ResourceCodeEditor";
import { Center, Text } from "@mantine/core";
import { cyanMainShade } from "../_app";
/**
 * CreateResourcePage is a page that renders a code editor for creating resources.
 * @returns React node with a ResourceCodeEditor component
 */
const CreateResourcePage = () => {
  const router = useRouter();
  const { resourceType } = router.query;
  return (
    <div style={{ padding: "10px" }}>
      <div style={{ padding: "10px" }}>
        <Center>
          <h2 style={{ color: cyanMainShade }}> Create New Resource</h2>
        </Center>
        <Center>
          <Text size="md" color={cyanMainShade}>
            Enter valid FHIR resource body for a new {resourceType} resource
          </Text>
        </Center>
      </div>
      <ResourceCodeEditor
        initialValue=""
        onClickFunction={(submittedVal) => console.log(submittedVal)}
        buttonName="Submit Resource"
      />
    </div>
  );
};

export default CreateResourcePage;
