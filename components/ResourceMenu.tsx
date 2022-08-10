import { fhirJson } from "@fhir-typescript/r4-core";
import {
    Button,
    Menu
  } from "@mantine/core";
  import Link from "next/link";

  export interface MenuProps {
    resourceType: string 
    id: string | string[] | undefined;
    measureArray: (fhirJson.BundleEntry | null)[] | undefined;
    label: string;
    url: string
  }

export default function ResourceMenu({resourceType, id, measureArray, label, url}: MenuProps){
    return <Menu
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
        {measureArray?.map((el) => {
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
            <Menu.Item> something went wrong </Menu.Item>
            );
        })}
        </div>
    </Menu>
}