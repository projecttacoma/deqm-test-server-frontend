import { Button } from "@mantine/core";
import Link from "next/link";
import { ResourceTypeResponse, EntryKeyObject } from "./../pages/[resourceType]";

/**
 * Component for displaying resource IDs as Links
 * @param props include jsonBody which is the response from a GET request to
 * a resourceType endpoint.
 * @returns an array of Links of resource IDs, or if none exist, a "No resource found" message
 */
function ResourceIDs(props: { jsonBody: ResourceTypeResponse }) {
  const entryArray = props.jsonBody.entry;

  if (entryArray) {
    return (
      <div>
        <h2>Resource IDs:</h2> {getAllIDs(entryArray)}
      </div>
    );
  } else {
    return <div>No resources found</div>;
  }
}

//maps each element in entry, an array of all the resources of a resourceType, to a Link
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
