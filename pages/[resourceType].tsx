import { useEffect, useState } from "react";
import { Button } from "@mantine/core";
import ResourcePage from "./../components/ResourcePage";
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

function ResourceTypeIDs() {
  const router = useRouter();
  const { resourceType } = router.query;

  const [pageBody, setPageBody] = useState<ResourceTypeResponse>({});
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/${resourceType}`)
      .then((data) => {
        return data.json() as Promise<ResourceTypeResponse>;
      })
      .then((resourcePageBody) => {
        setPageBody(resourcePageBody); //resourcePageBody["entry"][0].resource.id
      });
  }, [resourceType]);

  //return <div>{JSON.stringify(pageBody)}</div>;
  console.log("pageBody: ", pageBody);
  return pageBody ? <ResourceIDs jsonBody={pageBody}></ResourceIDs> : null;
}
export default ResourceTypeIDs;
