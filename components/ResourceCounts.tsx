import { useEffect, useState } from "react";
import { Button } from "@mantine/core";
import { cleanNotifications, showNotification } from "@mantine/notifications";

/**
 * Component which retrieves all resources and their counts, calls on helper functions to sort them by count and translate
 * them into buttons
 * @param props the properties of a ResourceCounts component which includes state variables/functions
 * @returns array of JSX Buttons
 */
const ResourceCounts = (props) => {
  const [resources, setResources] = useState<{ [x: string]: number }>({});
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/resourceCount`)
      .then((data) => {
        return data.json();
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
        style={{
          padding: "2px",
        }}
        onClick={() => clickHandler(el, props)}
        key={el}
      >
        {" "}
        {el} ({resources[el]}){" "}
      </Button>
    ));
  };

  return getResourceCountsNodes();
};

/**
 * Sets state variables
 * @param resourceKey is a string that specifies which resource button in the NavBar has been clicked on
 * @param props the props from ResourceCount component are passed. Contains the functions for changing state variables
 */
function clickHandler(resourceKey: string, props) {
  props.clicked(true);
  props.setWhichResource(resourceKey);
}

/**
 * Sorts an object of string:number key:value pairs by the value of number
 * @param toSort is the object that is to be sorted
 * @returns string[] a sorted array of the string keys
 */
function sortResourceArray(toSort: { [x: string]: number }) {
  return Object.keys(toSort).sort((a, b) => {
    return toSort[b] - toSort[a];
  });
}

export { ResourceCounts, sortResourceArray };
