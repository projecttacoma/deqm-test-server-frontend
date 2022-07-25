import { fhirJson } from "@fhir-typescript/r4-core";
import { useState, useEffect } from "react";
import { Autocomplete } from "@mantine/core";

/**
 * @param props include the string resourceType
 * @returns a component with a loading component, server error, or autocomplete select component populated with resource IDs
 */
export default function SelectComponent(props: { resourceType: string }) {
  const resourceType = props.resourceType;
  const [pageBody, setPageBody] = useState<fhirJson.Bundle>();
  const [fetchingError, setFetchingError] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);

  useEffect(() => {
    if (resourceType) {
      //setLoadingRequest(true);
      fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/${resourceType}`)
        .then((data) => {
          return data.json() as Promise<fhirJson.Bundle>;
        })
        .then((resourcePageBody) => {
          setPageBody(resourcePageBody);
          setFetchingError(false);
          setLoadingRequest(false);
        })
        .catch((error) => {
          console.log(error.message);
          setFetchingError(true);
          setLoadingRequest(false);
        });
    }
  }, [resourceType]);

  return loadingRequest ? (
    <div>Loading content...</div>
  ) : !fetchingError && pageBody ? (
    <PopulateIDHelper jsonBody={pageBody} resourceType={resourceType}></PopulateIDHelper>
  ) : (
    <div>Problem connecting to server</div>
  );
}

/**
 * @param props include a fhirJson.Bundle jsonBody, and a string resourceType
 * @returns a component with an error message that resources don't exist or autocomplete select component populated with resource IDs
 */
function PopulateIDHelper(props: { jsonBody: fhirJson.Bundle; resourceType: string }) {
  const entryArray = props.jsonBody.entry;
  if (props.jsonBody.total && props.jsonBody.total > 0 && entryArray != undefined) {
    return PopulateSelect(entryArray, props.resourceType);
  } else {
    return <div> {`No resources of type ${props.resourceType} found`} </div>;
  }
}

/**
 * @param fhirJson.BundleEntry
 * @returns an autocomplete select component populated with resource IDs
 */
const PopulateSelect = (entry: (fhirJson.BundleEntry | null)[], resourceType: string) => {
  const myArray = entry.map((el) => {
    return el?.resource ? `${el.resource.resourceType}/${el.resource.id}` : "";
  });
  const [value, setValue] = useState("");

  return (
    <Autocomplete
      value={value}
      onChange={setValue}
      label={`Select ${resourceType}`}
      placeholder="Start typing to see options"
      data={myArray}
      limit={10}
    />
  );
};
