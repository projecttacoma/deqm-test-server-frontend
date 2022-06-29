import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ResourceIDs from "../components/ResourceIDs";
import { Center, Loader } from "@mantine/core";
import { fhirJson } from "@fhir-typescript/r4-core";

/**
 * Component page that renders Buttons for all IDs of a resourceType. A request is made to
 * the test server to retrieve all resources of a specified type. Then a ResourceID component is
 * returned with the Buttons for each resourceID or a "No resources found" message is displayed, or if
 * the request to the server throws an error then a "Problem connecting to server" message is displayed.
 * Loader is displayed while http request is in progress
 * @returns Loader, ResourceIDs component, or error message depending on the status of the http request made.
 */
function ResourceTypeIDs() {
  //get resourceType from the current url with useRouter
  const router = useRouter();
  const { resourceType } = router.query;

  const [pageBody, setPageBody] = useState<fhirJson.Bundle>();
  const [fetchingError, setFetchingError] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);
  useEffect(() => {
    if (resourceType) {
      setLoadingRequest(true);
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

  return loadingRequest ? ( //if loading, Loader object is returned
    <Center>
      <div>Loading content...</div>
      <Loader color="cyan"></Loader>
    </Center>
  ) : !fetchingError && pageBody ? ( //if http request was successful, ResourceID component is returned
    <ResourceIDs jsonBody={pageBody}></ResourceIDs>
  ) : (
    //if error occurs in http request, error message is returned
    <div>Problem connecting to server</div>
  );
}
export default ResourceTypeIDs;
