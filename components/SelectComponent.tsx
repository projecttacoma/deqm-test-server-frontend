import { fhirJson } from "@fhir-typescript/r4-core";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Autocomplete } from "@mantine/core";

/**
 * interface for the props that a ResourceCodeEditor component takes in.
 * @resourceType is a string containing the resourceType
 * @setValue is a state variable function that is used to pass the code editor's current contents to a parent component
 * @value is a state variable string that is used to update the value of the select component textbox
 */
export interface SelectComponentProps {
  resourceType: string;
  setValue: Dispatch<SetStateAction<string>>;
  value: string;
}

/**
 * @param props include the type interface SelectComponentProps
 * @returns a component with a loading component, server error, or autocomplete select component populated with resource IDs
 */
export default function SelectComponent(props: SelectComponentProps) {
  const resourceType = props.resourceType;
  const setValue = props.setValue;
  const value = props.value;

  const [pageBody, setPageBody] = useState<fhirJson.Bundle>();
  const [fetchingError, setFetchingError] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);

  useEffect(() => {
    if (resourceType) {
      fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/${resourceType}`)
        .then((data) => {
          return data.json() as Promise<fhirJson.Bundle>;
        })
        .then((resourcePageBody) => {
          setPageBody(resourcePageBody);
          setFetchingError(false);
          setLoadingRequest(false);
        })
        .catch(() => {
          setFetchingError(true);
          setLoadingRequest(false);
        });
    }
  }, [resourceType]);

  return loadingRequest ? (
    <div>Loading content...</div>
  ) : !fetchingError && pageBody ? (
    <PopulateIDHelper jsonBody={pageBody} />
  ) : (
    <div>Problem connecting to server</div>
  );

  function PopulateIDHelper(props: { jsonBody: fhirJson.Bundle }) {
    const entryArray = props.jsonBody.entry;

    //makes sure there are resources to display in the dropdown
    if (props.jsonBody.total && props.jsonBody.total > 0 && entryArray != undefined) {
      const myArray = entryArray.map((el) => {
        return el?.resource ? `${el.resource.resourceType}/${el.resource.id}` : "";
      });
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
    } else {
      return <div> {`No resources of type ${resourceType} found`} </div>;
    }
  }
}
