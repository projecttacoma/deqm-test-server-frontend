import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ResourceIDs from "../../components/ResourceIDs";
import { Center, Loader, Pagination, Stack } from "@mantine/core";
import { fhirJson } from "@fhir-typescript/r4-core";
import { Button } from "@mantine/core";
import Link from "next/link";

/**
 * Component page that renders Buttons for all IDs of a resourceType. A request is made to
 * the test server to retrieve all resources of a specified type. Then a ResourceID component is
 * returned with the Buttons for each resourceID or a "No resources found" message is displayed, or if
 * the request to the server throws an error then a "Problem connecting to server" message is displayed.
 * Loader is displayed while http request is in progress
 * @returns Loader, ResourceIDs component, or error message depending on the status of the http request made.
 */
function ResourceTypeIDs() {
  //get resourceType from the current url with useRouter
  const router = useRouter();
  const { resourceType } = router.query;

  const [pageBody, setPageBody] = useState<fhirJson.Bundle>();
  const [activePageNum, setActivePageNum] = useState(0);
  //const [resourceIDList, setResourceIDList] = useState();
  const [fetchingError, setFetchingError] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);
  useEffect(() => {
    getResourcePage(activePageNum);
    console.log("ran useEffect");
  }, [activePageNum]);

  const getResourcePage = (pageNum: number) => {
    console.log("pageNum in getResourcePage: ", pageNum);
    const getUrl =
      activePageNum === 0
        ? `${process.env.NEXT_PUBLIC_DEQM_SERVER}/${resourceType}`
        : `${process.env.NEXT_PUBLIC_DEQM_SERVER}/${resourceType}?page=${activePageNum}`;
    if (resourceType) {
      setLoadingRequest(true);
      fetch(getUrl)
        .then((data) => {
          return data.json() as Promise<fhirJson.Bundle>;
        })
        .then((resourcePageBody) => {
          setPageBody(resourcePageBody);

          setFetchingError(false);
          setLoadingRequest(false);
        })
        .catch((error) => {
          console.log(error.message);
          setFetchingError(true);
          setLoadingRequest(false);
        });
    }
  };

  /* const allPageButtons = (pageNum: number) => {
    return pageBody?.link?.map((x, i) => {
      return (
        <Button
          key={`page-${i}-link`}
          color="cyan"
          onClick={() => getResourcePage(i)}
          radius="md"
          size="md"
          variant="filled"
          style={{
            float: "right",
          }}
        >
          <div>`${x?.relation}`</div>
        </Button>
      );
    });
  };

   const pageButton = (whichPage: string, pageNum: number) => {
    return (
      <Button
        color="cyan"
        onClick={() => getResourcePage(pageNum)}
        radius="md"
        size="md"
        variant="filled"
        style={{
          float: "right",
        }}
      >
        {whichPage}
      </Button>
    );
  }; */

  //console.log("pageBody:", pageBody);
  return loadingRequest ? ( //if loading, Loader object is returned
    <Center>
      <div>Loading content...</div>
      <Loader color="cyan"></Loader>
    </Center>
  ) : !fetchingError && pageBody ? ( //if http request was successful, ResourceID component is returned
    <div>
      <div
        style={{
          paddingRight: "20px",
        }}
      >
        <Stack
          style={{
            float: "right",
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
      </div>
      <ResourceIDs jsonBody={pageBody}></ResourceIDs>
      {/* <div>{allPageButtons}</div> */}
      <Pagination
        total={pageBody.total ? Math.ceil(pageBody.total / 10) : 1}
        onChange={(num) => {
          setActivePageNum(num);
        }}
        color="cyan"
        page={activePageNum}
        // styles={(theme) => ({
        //   item: {
        //     '.mantine-Pagination-item': {color: {textGray}}
        //   },
        // })}
      ></Pagination>
    </div>
  ) : (
    //if error occurs in http request, error message is returned
    <div>Problem connecting to server</div>
  );
}
//ceiling of pageBody?.total
export default ResourceTypeIDs;
