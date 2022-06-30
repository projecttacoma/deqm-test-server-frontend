import { useRouter } from "next/router";
import React from "react";
import ResourceCodeEditor from "../../components/ResourceCodeEditor";

/**
 * NewResource is a page that renders a code editor for creating resources.
 * @returns React node with a ResourceCodeEditor component
 */
const NewResource = () => {
  const router = useRouter();
  const { resourceType } = router.query;
  return (
    <div style={{ padding: "10px" }}>
      <div style={{ padding: "10px", textAlign: "center" }}>
        <h2 style={{ color: "#4a4f4f" }}> Create New Resource </h2>
        Enter valid FHIR resource body for a new {`${resourceType}`} resource
      </div>
      <ResourceCodeEditor
        initialValue=""
        onClickFunction={(submittedVal) => console.log(submittedVal)}
      />
    </div>
  );
};

export default NewResource;
