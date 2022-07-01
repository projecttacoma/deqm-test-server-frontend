import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Prism } from "@mantine/prism";

/**
 * Component which displays the JSON body of an individual resource
 * @returns JSON content of the individual resource
 */
function ResourceIDPage() {
  const router = useRouter();
  const { resourceType, id } = router.query;

  const [pageBody, setPageBody] = useState("");
  useEffect(() => {
    if (resourceType && id) {
      //fetch the resource JSON content from the test server based on given resource and id
      fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/${resourceType}/${id}`)
        .then((data) => {
          return data.json();
        })
        .then((resourcePageBody) => {
          console.log(JSON.stringify(resourcePageBody, null, 2));
          setPageBody(JSON.stringify(resourcePageBody, null, 2));
        });
    }
  }, [resourceType, id]);

  return (
    //render the JSON content on the page
    <Prism language="json" data-testid="prism-page-content">
      {pageBody}
    </Prism>
  );
}

export default ResourceIDPage;
