import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Prism } from "@mantine/prism";
import { Button, Divider, ScrollArea, Stack, Center, Loader } from "@mantine/core";
import BackButton from "../../../components/BackButton";
import Link from "next/link";
import { cleanNotifications, showNotification } from "@mantine/notifications";

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
  const [evaluateMeasureButton, setEvaluateMeasureButton] = useState(<></>);

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
          console.log("resourceType: ", resourceType);
          //if resource is a measure, an evaluate measure button will be rendered
          if (resourceType === "Measure") {
            setEvaluateMeasureButton(
              <Link
                href={`/${resourceType}/${id}/evaluate`}
                key={`evaluate-measure-${id}`}
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
                    marginRight: "8px",
                    marginLeft: "8px",
                  }}
                >
                  <div>Evaluate Measure</div>
                </Button>
              </Link>,
            );
          }
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
    }
  }, [resourceType, id]);

  const renderButtons = (
    <div>
      <BackButton />
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
        >
          <div> Update </div>
        </Button>
      </Link>
      {evaluateMeasureButton}
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
          <Prism
            language="json"
            data-testid="prism-page-content"
            style={{ maxWidth: "77vw", height: "80vh" }}
          >
            {pageBody}
          </Prism>
        </ScrollArea>
      </Stack>
    </div>
  ) : (
    //if error occurs in http request, empty tag returned
    <div />
  );
}

export default ResourceIDPage;
