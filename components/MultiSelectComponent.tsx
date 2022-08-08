import { fhirJson } from "@fhir-typescript/r4-core";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { MultiSelect, Text } from "@mantine/core";

/**
 * interface for the props that a ResourceCodeEditor component takes in.
 * @resourceType is a string containing the resourceType
 * @setValue is a state variable function that is used to pass the code editor's current contents to a parent component
 * @value is a state variable string that is used to update the value of the select component textbox
 */
export interface MultiSelectProps {
  resourceType: string;
  setValue: Dispatch<SetStateAction<string[]>>;
  value: string[];
  disabled?: boolean;
  jsonBody?: fhirJson.Bundle;
  required?: boolean;
}

/**
 * @param props include the type interface MultiSelectComponentProps
 * @returns a component with a loading component, server error, or MultiSelect component populated with resource IDs
 */
export default function MultiSelectComponent({
  resourceType,
  setValue,
  value,
  disabled,
  required,
}: MultiSelectProps) {
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
    <div>
      <PopulateIDHelper
        jsonBody={responseBody}
        resourceType={resourceType}
        setValue={setValue}
        value={value}
        disabled={disabled}
        required={required}
      />
    </div>
  ) : (
    <div>Problem connecting to server</div>
  );
}

function PopulateIDHelper({
  resourceType,
  setValue,
  value,
  jsonBody,
  required = false,
  disabled = true,
}: MultiSelectProps) {
  const entryArray = jsonBody?.entry;
  let placeholder = `No resources of type ${resourceType} found`;
  let myArray: string[] = [];

  if (jsonBody?.total && jsonBody?.total > 0 && entryArray != undefined) {
    placeholder = `Click to see ${resourceType} options`;
    disabled = false;
    myArray = entryArray.map((el) => {
      return `${el?.resource?.resourceType}/${el?.resource?.id}` || "";
    });
  }
  //makes sure there are resources to display in the dropdown and populate the multiSelect component
  // with patient data if availavle
  return (
    <MultiSelect
      value={value}
      onChange={setValue}
      label={
        <Text weight={400} size="md">
          Select {resourceType}(s)
        </Text>
      }
      placeholder={placeholder}
      data={myArray}
      limit={10}
      required={required}
      disabled={disabled}
    />
  );
}
