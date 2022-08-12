import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ResourceIDs from "../../components/ResourceIDs";
import { Center, Divider, Grid, Loader, Pagination } from "@mantine/core";
import { fhirJson } from "@fhir-typescript/r4-core";
import { Button } from "@mantine/core";
import Link from "next/link";
import { textGray } from "../../styles/appColors";

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
  const router = useRouter();
  const { resourceType, page } = router.query;
  const [pageBody, setPageBody] = useState<fhirJson.Bundle>();
  const [fetchingError, setFetchingError] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);

  const [activePageNum, setActivePageNum] = useState<number>(1);

  useEffect(() => {
    let pageUrl = `${resourceType}`;
    if (page) {
      setActivePageNum(parseInt(page as string));
      pageUrl = `${resourceType}?page=${page}`;
    }
    setLoadingRequest(true);
    fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/${pageUrl}`)
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
  }, [page, resourceType]);

  const updatePageRoute = (pageNum: number) => {
    router.push(
      {
        pathname: `/[resourceType]`,
        query: {
          resourceType,
          page: pageNum,
        },
      },
      `/${resourceType}?page=${pageNum}`,
      {
        shallow: true,
      },
    );
  };

  return (
    <div
      style={{
        paddingRight: "20px",
      }}
    >
      <Grid>
        <Grid.Col span={3} offset={9}>
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
        </Grid.Col>
      </Grid>
      <Divider my="md" style={{ marginTop: "15px" }} />
      {loadingRequest ? ( //if loading, Loader object is returned
        <Center>
          <div>Loading content...</div>
          <Loader color="cyan"></Loader>
        </Center>
      ) : !fetchingError && pageBody ? ( //if http request was successful, ResourceID component is returned
        <div>
          <div
            style={{
              textAlign: "center",
              overflowWrap: "break-word",
              height: "500px",
              padding: "10px",
              backgroundColor: "#FFFFFF",
              border: "1px solid",
              borderColor: "#DEE2E6",
              borderRadius: "20px",
              marginTop: "50px",
              marginBottom: "20px",
              marginLeft: "150px",
              marginRight: "150px",
            }}
          >
            <h2
              style={{ color: textGray, marginTop: "0px", marginBottom: "8px" }}
            >{`${resourceType} IDs`}</h2>
            <ResourceIDs jsonBody={pageBody}></ResourceIDs>
          </div>
          {pageBody && pageBody.total
            ? pageBody.total > NUMBER_IDS_RENDERED_AT_A_TIME && (
                <Center>
                  <Pagination
                    total={
                      pageBody.total ? Math.ceil(pageBody.total / NUMBER_IDS_RENDERED_AT_A_TIME) : 1
                    }
                    onChange={(num) => updatePageRoute(num)}
                    page={activePageNum}
                    color="cyan"
                    style={{ marginTop: "10px" }}
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
