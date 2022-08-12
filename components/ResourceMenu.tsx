import { fhirJson } from "@fhir-typescript/r4-core";
import { Button, Menu } from "@mantine/core";
import Link from "next/link";

export interface MenuProps {
  resourceType: string;
  id: string | string[] | undefined;
  bundleEntry: (fhirJson.BundleEntry | null)[] | undefined;
  label: string;
  url: string;
}

/**
 * ResourceMenu provides a menu dropdown component of all the measures. When a
 * measure is selected, it redirects to the evaluate measure page prepopulated
 * with data based on the resourceType and ID values passed in to the menu component
 * @params MenuProps
 * @returns a Menu component populated with measure resource IDs
 */
export default function ResourceMenu({ resourceType, id, bundleEntry, label, url }: MenuProps) {
  return (
    <Menu
      size={300}
      style={{
        float: "right",
        marginRight: "8px",
        marginLeft: "8px",
      }}
      control={
        <Button component="a" color="cyan" radius="md" size="sm" variant="filled">
          {label}
        </Button>
      }
    >
      <div>
        {bundleEntry?.map((el) => {
          return el?.resource ? (
            <Menu.Item>
              <Link
                href={`/${el.resource.resourceType}/${
                  el.resource.id
                }/${url}?${resourceType.toLowerCase()}=${resourceType}/${id}`}
              >
                <div>
                  {" "}
                  {el.resource.resourceType}/{el.resource.id}{" "}
                </div>
              </Link>
            </Menu.Item>
          ) : (
            <Menu.Item> no available options because something went wrong </Menu.Item>
          );
        })}
      </div>
    </Menu>
  );
}
