import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Prism } from "@mantine/prism";

/**
 * Component which displays the JSON body of an individual resource
 * @returns JSON content of the individual resource
 */
function ResourceIDPage() {
  const router = useRouter();
  const { resource, id } = router.query;

  const [pageBody, setPageBody] = useState("");
  useEffect(() => {
    if (resource && id) {
      fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/${resource}/${id}`)
        .then((data) => {
          return data.json();
        })
        .then((resourcePageBody) => {
          setPageBody(JSON.stringify(resourcePageBody, null, 2));
        });
    }
  }, [resource, id]);

  return (
    <Prism language="tsx" data-testid="prism-page-content">
      {pageBody}
    </Prism>
  );
}

export default ResourceIDPage;
