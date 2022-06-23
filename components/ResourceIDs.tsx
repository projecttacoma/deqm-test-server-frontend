import { Button } from "@mantine/core";
import Link from "next/link";

/*
    props: jsonbody of get resourceType request
*/
function ResourceIDs(props) {
  const entryArray = props.jsonBody.entry;
  console.log(props.jsonBody);
  if (entryArray) {
    return (
      <div>
        <h2>Resource IDs:</h2> {getAllIDs(entryArray)}
      </div>
    );
  } else {
    return <div>No resources of type {props.jso} </div>;
  }
}

const getAllIDs = (entry) => {
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
