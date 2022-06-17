import { useEffect, useState } from "react";
import { Button } from "@mantine/core";
import { cleanNotifications, showNotification } from "@mantine/notifications";

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

function clickHandler(resourceKey: string, props) {
  props.clicked(true);
  props.setWhichResource(resourceKey);
}

function sortResourceArray(toSort: { [x: string]: number }) {
  return Object.keys(toSort).sort((a, b) => {
    return toSort[b] - toSort[a];
  });
}

export { ResourceCounts, sortResourceArray };
