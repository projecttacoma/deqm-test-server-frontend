import { useEffect, useState } from "react";
import { Badge, Button } from "@mantine/core";
import { cleanNotifications, showNotification } from "@mantine/notifications";

export interface ResourceCountResponse {
  [x: string]: number;
}

/**
 * Component which retrieves all resources and their counts, calls on helper functions to sort them by count and translate
 * them into buttons
 * @returns array of JSX Buttons
 */
const ResourceCounts = () => {
  const [resources, setResources] = useState<ResourceCountResponse>({});
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
  }, []);

  /**
   * Sorts the resource counts key:value pairs object, then returns them as an array of buttons
   * @returns array of JSX Buttons that are the sorted resources and their counts
   */
  const getResourceCountsNodes = () => {
    return sortResourceArray(resources).map((el) => (
      <Button
        color="cyan"
        radius="md"
        size="md"
        variant="subtle"
        styles={{
          inner: {
            padding: "3px",
            justifyContent: "flex-start",
          },
        }}
        rightIcon={
          <Badge color="cyan" data-testid={el}>
            {resources[el]}
          </Badge>
        }
        key={el}
      >
        {" "}
        {el}{" "}
      </Button>
    ));
  };

  return getResourceCountsNodes();
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
