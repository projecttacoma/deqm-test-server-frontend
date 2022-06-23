import { useEffect, useState } from "react";
import { Button } from "@mantine/core";
import ResourcePage from "./../components/ResourcePage";
import { useRouter } from "next/router";
import ResourceIDs from "../components/ResourceIDs";

function ResourceTypeIDs() {
  const router = useRouter();
  const { resourceType } = router.query;

  const [pageBody, setPageBody] = useState("");
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/${resourceType}`)
      .then((data) => {
        return data.json();
      })
      .then((resourcePageBody) => {
        setPageBody(resourcePageBody); //resourcePageBody["entry"][0].resource.id
      });
  }, [resourceType]);

  //return <div>{JSON.stringify(pageBody)}</div>;
  console.log(pageBody);
  return pageBody ? <ResourceIDs jsonBody={pageBody}></ResourceIDs> : null;
}
export default ResourceTypeIDs;
