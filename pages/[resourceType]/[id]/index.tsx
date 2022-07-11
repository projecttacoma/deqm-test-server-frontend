import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Prism } from "@mantine/prism";
import { Button, Divider, ScrollArea, Stack } from "@mantine/core";
import BackButton from "../../../components/BackButton";
import Link from "next/link";

/**
 * Component which displays the JSON body of an individual resource and a back button
 * @returns JSON content of the individual resource in a Prism component, and a back button
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
          setPageBody(JSON.stringify(resourcePageBody, null, 2));
        });
    }
  }, [resourceType, id]);

  const renderButtons = (
    <div>
      <BackButton />
      <Link
        href={{
          pathname: "/[resourceType]/[id]/update",
          query: { resourceType: resourceType, id: id },
        }}
        key={`update-${id}`}
        prefetch={true}
        passHref
      >
        <Button
          component="a"
          color="cyan"
          radius="md"
          size="sm"
          variant="filled"
          style={{
            float: "right",
          }}
        >
          <div> Update </div>
        </Button>
      </Link>
    </div>
  );

  return (
    <div>
      <Stack spacing="xs">
        <div
          style={{
            float: "left",
          }}
        >
          {renderButtons}
        </div>
        <Divider my="sm" />
        <ScrollArea>
          <Prism
            language="json"
            data-testid="prism-page-content"
            style={{ maxHeight: "100vh", backgroundColor: "#FFFFFF" }}
          >
            {pageBody}
          </Prism>
        </ScrollArea>
      </Stack>
    </div>
  );
}

export default ResourceIDPage;
