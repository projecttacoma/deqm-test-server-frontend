import { fhirJson } from "@fhir-typescript/r4-core";
import { Button } from "@mantine/core";
import Link from "next/link";

/**
 * Component for displaying resource IDs as Links
 * @param props include jsonBody which is the response from a GET request to
 * a resourceType endpoint.
 * @returns an array of Links of resource IDs, or if none exist, a "No resource found" message, or if an
 * invalid response body is passed through, an error message
 */
function ResourceIDs(props: { jsonBody: fhirJson.Bundle }) {
  const entryArray = props.jsonBody.entry;

  if (props.jsonBody.total === 0 || entryArray == null || entryArray.length === 0) {
    return <div>No resources found</div>;
  } else if (props.jsonBody.total && props.jsonBody.total > 0) {
    return <div>{entryArray != null ? getAllIDs(entryArray) : <div>No resources</div>}</div>;
  } else {
    return <div>Invalid JSON Body</div>;
  }
}
/**
 * Maps an array of resource bodies to an array of Link-wrapped-Buttons, where each Button represents a resource ID
 * @param entry which is the entry key from a resource bundle. It is an array where each index is a resource's body
 * @returns an array of Resource ID Link-wrapped-Buttons
 */
const getAllIDs = (entry: (fhirJson.BundleEntry | null)[]) => {
  return entry.map((el) => {
    return el?.resource ? (
      <Link href={`/${el.resource.resourceType}/${el.resource.id}`} key={el.resource.id} passHref>
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
            <div>
              {el.resource.resourceType}/{el.resource.id}
            </div>
          </Button>
        </div>
      </Link>
    ) : (
      <div>Something went wrong</div>
    );
  });
};

export default ResourceIDs;
