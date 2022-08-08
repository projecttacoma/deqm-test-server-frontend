import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ResourceIDs from "../../components/ResourceIDs";
import { Center, Loader, Pagination, Stack } from "@mantine/core";
import { fhirJson } from "@fhir-typescript/r4-core";
import { Button } from "@mantine/core";
import Link from "next/link";

const NUMBER_IDS_RENDERED_AT_A_TIME = 10;

/**
 * Component page that renders Buttons for all IDs of a resourceType. A request is made to
 * the test server to retrieve all resources of a specified type. Then a ResourceID component is
 * returned with the Buttons for each resourceID or a "No resources found" message is displayed, or if
 * the request to the server throws an error then a "Problem connecting to server" message is displayed.
 * Loader is displayed while http request is in progress. For resourceTypes with more than 10 resources,
 * Pagination component is implemented to allow for access to all resources.
 * @returns Loader, ResourceIDs and Pagination components, or error message depending on the status of the http request made.
 */
function ResourceTypeIDs() {
  //get resourceType from the current url with useRouter
  const router = useRouter();
  const { resourceType } = router.query;

  const [pageBody, setPageBody] = useState<fhirJson.Bundle>();
  const [activePageNum, setActivePageNum] = useState(0);
  const [fetchingError, setFetchingError] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);
  useEffect(() => {
    getResourcePage();
  }, [activePageNum]);

  useEffect(() => {
    setActivePageNum(0);
    getResourcePage();
  }, [resourceType]);

  const getResourcePage = () => {
    const pageUrl =
      activePageNum === 1 || activePageNum === 0
        ? `${resourceType}`
        : `${resourceType}?page=${activePageNum}`;

    if (resourceType) {
      setLoadingRequest(true);
      fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/${pageUrl}`)
        .then((data) => {
          return data.json() as Promise<fhirJson.Bundle>;
        })
        .then((resourcePageBody) => {
          setPageBody(resourcePageBody);
          setFetchingError(false);
          setLoadingRequest(false);
          router.push(`/${resourceType}`, `/${pageUrl}`, {
            shallow: true,
          });
        })
        .catch((error) => {
          console.log(error.message);
          setFetchingError(true);
          setLoadingRequest(false);
        });
    }
  };

  return (
    <div
      style={{
        paddingRight: "20px",
      }}
    >
      <Stack
        style={{
          float: "right",
          paddingTop: "2px",
        }}
      >
        <Link href={`${resourceType}/create`} key={`create-${resourceType}`} passHref>
          <Button
            component="a"
            color="cyan"
            radius="md"
            size="md"
            variant="filled"
            style={{
              float: "right",
            }}
          >
            <div> Create New {`${resourceType}`} </div>
          </Button>
        </Link>
      </Stack>
      {loadingRequest ? ( //if loading, Loader object is returned
        <Center>
          <div>Loading content...</div>
          <Loader color="cyan"></Loader>
        </Center>
      ) : !fetchingError && pageBody ? ( //if http request was successful, ResourceID component is returned
        <div>
          <div
            style={{
              paddingLeft: "20px",
            }}
          >
            <ResourceIDs jsonBody={pageBody}></ResourceIDs>
          </div>
          {pageBody.total && pageBody.link
            ? pageBody.total > NUMBER_IDS_RENDERED_AT_A_TIME && (
                <Center>
                  <Pagination
                    total={
                      pageBody.total ? Math.ceil(pageBody.total / NUMBER_IDS_RENDERED_AT_A_TIME) : 1
                    }
                    onChange={(num) => {
                      setActivePageNum(num);
                    }}
                    color="cyan"
                    page={activePageNum > 0 ? activePageNum : 1}
                  ></Pagination>
                </Center>
              )
            : null}
        </div>
      ) : (
        //if error occurs in http request, error message is returned
        <div>Problem connecting to server</div>
      )}
    </div>
  );
}

export default ResourceTypeIDs;
