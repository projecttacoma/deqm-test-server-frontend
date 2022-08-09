import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ResourceIDs from "../../components/ResourceIDs";
import { Center, Divider, Loader, Pagination, Stack } from "@mantine/core";
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
  //get resourceType from the current url with useRouter
  const router = useRouter();
  const { resourceType } = router.query;
  const fullPath = router.asPath;
  const [pageBody, setPageBody] = useState<fhirJson.Bundle>();
  const [activePageNum, setActivePageNum] = useState(0);
  const [fetchingError, setFetchingError] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);

  const PAGE_IN_URL_REGEX = new RegExp(`${resourceType}\\?page=[0-9]{1,5}`);
  const UP_TO_5_DIGITS_REGEX = new RegExp(`[0-9]{1,5}`);
  //const PAGE_IN_URL_REGEX = new RegExp(`[0-9]{1,5}`);
  //${resourceType}\\?page=
  //?page=\d{1,5}
  //const NEW_ID_IN_HEADER_REGEX = new RegExp(`${resourceType}/[A-Za-z0-9\-\.]{1,64}`);

  useEffect(() => {
    console.log("activePageNum useEffect");
    getResourcePage();
  }, [activePageNum]);

  useEffect(() => {
    test();
    async function test() {
      console.log("resourceType useEffect");
      getResourcePage();
      if (await urlValidation()) {
        console.log("resourceType useEffect IF urlValidation");
        //getResourcePage();
      } else {
        setActivePageNum(0);
      }
    }
  }, [resourceType]);

  // useEffect(() => {
  //   //setActivePageNum(0);
  //   urlValidation();
  //   //getResourcePage();
  // }, [fullPath]);

  const getResourcePage = async () => {
    console.log("getReosurcePage");
    let successfulRequest = false;
    //urlValidation();
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
          successfulRequest = true;
          router.push(`/${resourceType}`, `/${pageUrl}`, {
            shallow: true,
          });
          //console.log("setting pageBody: ", pageBody);
        })
        .catch((error) => {
          console.log(error.message);
          setFetchingError(true);
          setLoadingRequest(false);
          successfulRequest = false;
        });
      console.log("setting pageBody: ", pageBody);
      return successfulRequest;
    }
  };

  async function urlValidation() {
    //console.log("pageBody.total: ", pageBody?.total);
    console.log("in url validation: ", pageBody);
    let validUrl = false;
    await getResourcePage(); //.finally(() => {
    if (pageBody?.total) {
      const currUrl = fullPath;
      console.log("currUrl: ", currUrl);
      const regexResponse = PAGE_IN_URL_REGEX.exec(currUrl);
      console.log("regexResponse: ", regexResponse);

      if (regexResponse && regexResponse[0]) {
        console.log("regexResponse[0]: ", regexResponse[0]);
        const pageNumRegexResponse = UP_TO_5_DIGITS_REGEX.exec(regexResponse[0]);
        const pageNumFromUrl = pageNumRegexResponse
          ? (pageNumRegexResponse[0] as unknown as number)
          : null;
        if (
          pageNumFromUrl &&
          pageNumFromUrl <= Math.ceil(pageBody.total / NUMBER_IDS_RENDERED_AT_A_TIME)
        ) {
          console.log("pageNumFromUrl: ", pageNumFromUrl);
          setActivePageNum(pageNumFromUrl);
        }
        //return true;
        validUrl = true;
      } else validUrl = false;
    } else validUrl = false;
    //});
    return validUrl;
  }

  console.log("activePageNum line 108: ", activePageNum);

  return (
    <div
      style={{
        paddingRight: "20px",
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
      <Center>
        <h2
          style={{ color: textGray, marginTop: "0px", marginBottom: "4px" }}
        >{`${resourceType} IDs`}</h2>
      </Center>
      <Divider my="md" />
      {loadingRequest ? ( //if loading, Loader object is returned
        <Center>
          <div>Loading content...</div>
          <Loader color="cyan"></Loader>
        </Center>
      ) : !fetchingError && pageBody ? ( //if http request was successful, ResourceID component is returned
        <div>
          <div
            style={{
              textAlign: "left",
              overflowWrap: "break-word",
              height: "450px",
              padding: "10px",
              paddingLeft: "20px",
              backgroundColor: "#FFFFFF",
              border: "1px solid",
              borderColor: "#DEE2E6",
              borderRadius: "20px",
              marginLeft: "150px",
              marginRight: "150px",
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
                    page={activePageNum === 0 ? 1 : activePageNum}
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
