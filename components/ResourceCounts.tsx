import { useEffect, useState, useContext, SetStateAction } from "react";
import { Badge, Button, Grid, Input, Stack } from "@mantine/core";
import { cleanNotifications, showNotification } from "@mantine/notifications";
import Link from "next/link";
import { CountContext } from "./CountContext";
import { Search } from "tabler-icons-react";

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
  const [searchValue, setSearchValue] = useState("");
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
   * sorts the keys in descending order based on their count, and filters out keys based on the value from the searchbar
   * @params an object with a string: number key value pair
   * @returns array of sorted and filtered keys
   */
  const sortResourceArray = (toSort: { [x: string]: number }): string[] => {
    if (searchValue) {
      //filters the array based on searchValue
      const filteredArray = Object.keys(toSort).filter((el) =>
        el.toLowerCase().includes(searchValue.toLowerCase()),
      );
      return filteredArray.sort((a, b) => {
        return toSort[b] - toSort[a];
      });
    }

    //sorts keys in descending order based on their value
    return Object.keys(toSort).sort((a, b) => {
      return toSort[b] - toSort[a];
    });
  };

  /**
   * Sorts the resource counts key:value pairs object, then returns them as an array of buttons
   * @returns array of JSX Buttons that are the sorted resources and their counts
   */
  const ResourceButtonsGroup = () => {
    const buttonArray = sortResourceArray(resources).map((resourceType) => (
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
    return <div> {buttonArray} </div>;
  };

  return (
    <Stack align="flex-start" spacing="xs" style={{ marginBottom: 30 }}>
      <Grid>
        <Grid.Col xs={10} sm={10}>
          <Input
            value={searchValue}
            onChange={(event: { currentTarget: { value: SetStateAction<string> } }) =>
              setSearchValue(event.currentTarget.value)
            }
            icon={<Search size={18} />}
            placeholder="Search"
            size="sm"
            width="fullWidth"
            style={{ marginLeft: "1.5vw", width: "16vw" }}
          />
        </Grid.Col>
        <Grid.Col xs={2} sm={2}></Grid.Col>
      </Grid>
      <ResourceButtonsGroup />
    </Stack>
  );
};

export { ResourceCounts };
