import { useEffect, useState } from "react";
/**
 * Retrieves all resources of a specified resource type from the test server than returns a JSX element of
 * the complete JSON body retrieved from the request
 * @param props includes resourceLink which is a string specifying which resource type to retrieve from the server
 * @returns JSX element
 */
const ResourcePage = (props) => {
  const [pageBody, setPageBody] = useState("");
  const resourceLink = props.resourceLink;
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/${resourceLink}`)
      .then((data) => {
        return data.json();
      })
      .then((resourcePageBody) => {
        setPageBody(JSON.stringify(resourcePageBody));
      });
  }, [resourceLink]);

  return <div> {pageBody} </div>;
};

export default ResourcePage;
