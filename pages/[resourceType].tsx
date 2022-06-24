import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ResourceIDs from "../components/ResourceIDs";

/**
 * interface for the response body of a request to a resourceType endpoint
 * Includes a key with a value that is an array of EntryKeyObjects
 */
export interface ResourceTypeResponse {
  [responseAttribute: string]: EntryKeyObject[];
}

/**
 * interface for the contents of the "entry" key in a resourceType bundle JSON object.
 * Includes a resource key with a value that is the id of a resource
 */
export interface EntryKeyObject {
  resource: { id: string };
}

/**
 * Component page that renders Buttons for all IDs of a resourceType. A request is made to
 * the test server to retrieve all resources of a specified type. Then a ResourceID component is
 * returned with the Buttons for each resourceID or a "No resources found" message is displayed
 * @returns
 */
function ResourceTypeIDs() {
  //get resourceType from the current url with useRouter
  const router = useRouter();
  const { resourceType } = router.query;

  const [pageBody, setPageBody] = useState<ResourceTypeResponse>({});
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/${resourceType}`)
      .then((data) => {
        return data.json() as Promise<ResourceTypeResponse>;
      })
      .then((resourcePageBody) => {
        setPageBody(resourcePageBody);
      });
  }, [resourceType]);

  return pageBody ? <ResourceIDs jsonBody={pageBody}></ResourceIDs> : null;
}
export default ResourceTypeIDs;
