import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Prism } from "@mantine/prism";
import { Button, Divider, ScrollArea, Stack, Center, Loader, MantineProvider } from "@mantine/core";
import BackButton from "../../../components/BackButton";
import Link from "next/link";
import { cleanNotifications, showNotification } from "@mantine/notifications";
import DeleteButton from "../../../components/DeleteButton";
import { ModalsProvider } from "@mantine/modals";
import {
  replaceDark,
  replaceGray,
  replaceTeal,
  replaceRed,
  replaceBlue,
  replaceDelete,
} from "../../../styles/codeColorScheme";
import { textGray } from "../../../styles/appColors";
import { fhirJson } from "@fhir-typescript/r4-core";
import ResourceMenu from "../../../components/ResourceMenu";
/**
 * Component which displays the JSON body of an individual resource and a back button.
 * If the resource is a Measure, an evaluate measure button is also displayed.
 * @returns JSON content of the individual resource in a Prism component, and a back button
 */
function ResourceIDPage() {
  const router = useRouter();
  const { resourceType, id } = router.query;
  const [fetchingError, setFetchingError] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [pageBody, setPageBody] = useState("");
  const [measureArray, setMeasureArray] = useState<(fhirJson.BundleEntry | null)[]>();

  useEffect(() => {
    if (resourceType && id) {
      setLoadingRequest(true);
      //fetch the resource JSON content from the test server based on given resource and id
      fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/${resourceType}/${id}`)
        .then((data) => {
          return data.json();
        })
        .then((resourcePageBody) => {
          setPageBody(JSON.stringify(resourcePageBody, null, 2));
          setFetchingError(false);
          setLoadingRequest(false);
        })
        .catch((error) => {
          console.log(error.message, "...start the server");
          setFetchingError(true);
          setLoadingRequest(false);
          cleanNotifications();
          showNotification({
            message: "Not connected to server!",
            color: "red",
            autoClose: false,
          });
        });
      //fetches measure resource list from the server
      if (resourceType) {
        setLoadingRequest(true);
        fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/Measure`)
          .then((data) => {
            return data.json() as Promise<fhirJson.Bundle>;
          })
          .then((resourcePageBody) => {
            setMeasureArray(resourcePageBody.entry);
            setFetchingError(false);
            setLoadingRequest(false);
          })
          .catch((error) => {
            console.log(error.message);
            setFetchingError(true);
            setLoadingRequest(false);
          });
      }
    }
  }, [resourceType, id]);

  const renderButtons = (
    <div>
      <BackButton />
      <MantineProvider
        //changes hex values associated with each Mantine color name to improve UI
        theme={{
          colors: {
            pink: replaceDelete,
          },
        }}
      >
        <ModalsProvider>
          <DeleteButton />
        </ModalsProvider>
      </MantineProvider>
      <Link href={`/${resourceType}/${id}/update`} key={`update-${id}`} passHref>
        <Button
          component="a"
          color="cyan"
          radius="md"
          size="sm"
          variant="filled"
          style={{
            float: "right",
            marginRight: "8px",
            marginLeft: "8px",
          }}
          key={`update-${id}`}
        >
          <div> Update </div>
        </Button>
      </Link>

      {resourceType === "Measure" && (
        <div>
          <Link href={`/${resourceType}/${id}/care-gaps`} key={`care-gaps-${id}`} passHref>
            <Button
              component="a"
              color="cyan"
              radius="md"
              size="sm"
              variant="filled"
              style={{
                float: "right",
                marginRight: "8px",
                marginLeft: "8px",
              }}
            >
              <div>Calculate Care Gaps</div>
            </Button>
          </Link>
          <Link href={`/${resourceType}/${id}/evaluate`} key={`evaluate-measure-${id}`} passHref>
            <Button
              component="a"
              color="cyan"
              radius="md"
              size="sm"
              variant="filled"
              style={{
                float: "right",
                marginRight: "8px",
                marginLeft: "8px",
              }}
            >
              <div>Evaluate Measure</div>
            </Button>
          </Link>
        </div>
      )}
      {/** limits which pages display evaluate measure and care gap buttons */}
      {/** both buttons display a drop down menu with measure resource options */}
      {(resourceType === "Patient" || resourceType === "Practitioner") && (
        <div>
          <ResourceMenu
            resourceType={resourceType}
            id={id}
            measureArray={measureArray}
            url="evaluate"
            label="Evaluate Measure"
          />
          <ResourceMenu
            resourceType={resourceType}
            id={id}
            measureArray={measureArray}
            url="care-gaps"
            label="Care Gaps"
          />
        </div>
      )}
      {resourceType === "Organization" && (
        <div>
          <ResourceMenu
            resourceType={resourceType}
            id={id}
            measureArray={measureArray}
            url="care-gaps"
            label="Care Gaps"
          />
        </div>
      )}
      {resourceType === "Group" && (
        <div>
          <ResourceMenu
            resourceType={resourceType}
            id={id}
            measureArray={measureArray}
            url="evaluate"
            label="Evaluate Measure"
          />
        </div>
      )}
    </div>
  );

  return loadingRequest ? ( //if loading, Loader object is returned
    <Center>
      <div>Loading content...</div>
      <Loader color="cyan"></Loader>
    </Center>
  ) : !fetchingError && pageBody ? ( //if http get request was successful, a full ResourceIDPage is returned
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
              style={{ maxWidth: "78vw", height: "80vh", backgroundColor: "#FFFFFF" }}
            >
              {pageBody}
            </Prism>
          </MantineProvider>
        </ScrollArea>
      </Stack>
    </div>
  ) : (
    //if error occurs in http request, empty tag returned
    <div />
  );
}

export default ResourceIDPage;
