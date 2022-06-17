import { useEffect, useState } from "react";

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
