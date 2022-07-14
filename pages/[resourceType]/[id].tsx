import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Prism } from "@mantine/prism";
import { Divider, MantineProvider, ScrollArea, Stack } from "@mantine/core";
import BackButton from "../../components/BackButton";
import {
  replaceDark,
  replaceGray,
  replaceTeal,
  replaceRed,
  replaceBlue,
} from "../../styles/codeColorScheme";

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

  return (
    <div>
      <Stack spacing="xs">
        <div
          style={{
            float: "left",
          }}
        >
          <BackButton />
        </div>
        <Divider my="sm" />
        <ScrollArea>
          <MantineProvider
            //changes hex values associated with each Mantine color name to improve UI
            theme={{
              colors: {
                gray: replaceGray,
                dark: replaceDark,
                teal: replaceTeal,
                red: replaceRed,
                blue: replaceBlue,
              },
            }}
          >
            <Prism
              language="json"
              data-testid="prism-page-content"
              colorScheme="dark"
              style={{ maxHeight: "80vh", backgroundColor: "#FFFFFF" }}
            >
              {pageBody}
            </Prism>
          </MantineProvider>
        </ScrollArea>
      </Stack>
    </div>
  );
}

export default ResourceIDPage;
