import { AppShell, Navbar, Header } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { ResourceCounts } from "./ResourceCounts";
import ResourcePage from "./ResourcePage";
import { useEffect, useState } from "react";

function CreateShell() {
  const [isClicked, setIsClicked] = useState(false);
  const [resourceClicked, setResourceClicked] = useState("");
  return (
    <NotificationsProvider position="top-center">
      <AppShell
        padding="md"
        navbar={
          <Navbar width={{ base: 300 }} height={500} p="xs">
            <ResourceCounts
              clicked={setIsClicked}
              isitclicked={isClicked}
              setWhichResource={setResourceClicked}
            >
              {" "}
            </ResourceCounts>
          </Navbar>
        }
        header={
          <Header height={60} p="xs">
            {/* Header content */}
          </Header>
        }
        styles={(theme) => ({
          main: {
            backgroundColor:
              theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[0],
          },
        })}
      >
        {isClicked && <ResourcePage resourceLink={resourceClicked}></ResourcePage>}
      </AppShell>
    </NotificationsProvider>
  );
}
export default CreateShell;
