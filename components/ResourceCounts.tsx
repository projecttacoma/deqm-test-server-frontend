import { useEffect, useState, useContext } from "react";
import { Badge, Button, Stack } from "@mantine/core";
import { cleanNotifications, showNotification } from "@mantine/notifications";
import Link from "next/link";
import { CountContext } from "./CountContext";

/**
 * interface for object that is returned from a request to the resourceCunt endpoint.
 * key:value pairs of resourceType:resourceCount
 */
export interface ResourceCountResponse {
  [resourceType: string]: number;
}

/**
 * Component which retrieves all resources and their counts, calls on helper functions to sort them by count, then
 * translates them into buttons
 * @returns array of JSX Buttons
 */
const ResourceCounts = () => {
  const [resources, setResources] = useState<ResourceCountResponse>({});
  const context = useContext(CountContext);
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/resourceCount`)
      .then((data) => {
        return data.json() as Promise<ResourceCountResponse>;
      })
      .then((resourceCountBody) => {
        setResources(resourceCountBody);
      })
      .catch((error) => {
        console.log(error.message, "...start the server");
        cleanNotifications();
        showNotification({
          message: "Not connected to server",
          color: "red",
          autoClose: false,
        });
      });
  }, [context.countChange]);

  /**
   * Sorts the resource counts key:value pairs object, then returns them as an array of buttons
   * @returns array of JSX Buttons that are the sorted resources and their counts
   */
  const getResourceCountsNodes = () => {
    return sortResourceArray(resources).map((resourceType) => (
      <Link href={`/${resourceType}`} key={resourceType} passHref>
        <Button
          fullWidth
          compact
          component="a"
          color="cyan"
          radius="md"
          size="md"
          variant="subtle"
          styles={{
            inner: {
              paddingLeft: "15px",
              justifyContent: "flex-start",
            },
          }}
          rightIcon={<Badge color="cyan">{resources[resourceType]}</Badge>}
          key={resourceType}
        >
          {resourceType}
        </Button>
      </Link>
    ));
  };

  return (
    <Stack align="flex-start" spacing="xs" style={{ marginBottom: 30 }}>
      {getResourceCountsNodes()}
    </Stack>
  );
};

/**
 * Sorts an object of string:number key:value pairs by the value of number
 * @param toSort is the object that is to be sorted
 * @returns string[] a sorted array of the string keys
 */
function sortResourceArray(toSort: { [x: string]: number }): string[] {
  return Object.keys(toSort).sort((a, b) => {
    return toSort[b] - toSort[a];
  });
}

export { ResourceCounts, sortResourceArray };
