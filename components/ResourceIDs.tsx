import { Button } from "@mantine/core";
import Link from "next/link";
import { ReactElement, JSXElementConstructor, ReactFragment, ReactPortal } from "react";
import { ResourceTypeResponse, EntryKeyObject } from "./../pages/[resourceType]";

/*
    props: jsonbody of get resourceType request
*/
function ResourceIDs(props: { jsonBody: ResourceTypeResponse }) {
  //props: { jsonBody: { entry: any; }; jso: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | ReactFragment | ReactPortal | null | undefined; }) {
  const entryArray = props.jsonBody.entry;
  console.log("jsonBody.entry: ", props.jsonBody.entry);
  if (entryArray) {
    return (
      <div>
        <h2>Resource IDs:</h2> {getAllIDs(entryArray)}
      </div>
    );
  } else {
    return <div>No resources of type </div>;
  }
}

const getAllIDs = (entry: EntryKeyObject[]) => {
  return entry.map((el) => {
    return (
      <Link href={`/`} key={el.resource.id} passHref>
        <div>
          <Button
            color="cyan"
            radius="md"
            size="md"
            variant="subtle"
            style={{
              padding: "2px",
            }}
          >
            <div> {el.resource.id} </div>
          </Button>
          {"\n"}
        </div>
      </Link>
    );
  });
};

export default ResourceIDs;
