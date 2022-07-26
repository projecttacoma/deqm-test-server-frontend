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
  jsonBody?: fhirJson.Bundle;
}

/**
 * @param props include the type interface SelectComponentProps
 * @returns a component with a loading component, server error, or autocomplete select component populated with resource IDs
 */
export default function SelectComponent({ resourceType, setValue, value }: SelectComponentProps) {
  const [responseBody, setResponseBody] = useState<fhirJson.Bundle>();
  const [fetchingError, setFetchingError] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);

  useEffect(() => {
    if (resourceType) {
      setLoadingRequest(true);
      fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/${resourceType}`)
        .then((data) => {
          return data.json() as Promise<fhirJson.Bundle>;
        })
        .then((resourceResponseBody) => {
          setResponseBody(resourceResponseBody);
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
  ) : !fetchingError && responseBody ? (
    <PopulateIDHelper
      jsonBody={responseBody}
      resourceType={resourceType}
      setValue={setValue}
      value={value}
    />
  ) : (
    <div>Problem connecting to server</div>
  );
}

function PopulateIDHelper({ resourceType, setValue, value, jsonBody }: SelectComponentProps) {
  const entryArray = jsonBody?.entry;

  //makes sure there are resources to display in the dropdown
  if (jsonBody?.total && jsonBody?.total > 0 && entryArray != undefined) {
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
