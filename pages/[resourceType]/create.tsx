import { useRouter } from "next/router";
import ResourceCodeEditor from "../../components/ResourceCodeEditor";
import { Button, Center, Divider, MantineProvider, Text } from "@mantine/core";
import { cleanNotifications, showNotification, NotificationProps } from "@mantine/notifications";
import Link from "next/link";
import { Check, X } from "tabler-icons-react";
import { textGray } from "../../styles/appColors";
import BackButton from "../../components/BackButton";
import React, { useContext, useState } from "react";
import { CountContext } from "../../components/CountContext";
import MultiSelectComponent from "../../components/MultiSelectComponent";
import { fhirJson } from "@fhir-typescript/r4-core";
import { replaceBackground } from "../../styles/codeColorScheme";

/**
 * CreateResourcePage is a page that renders a code editor, a submit button for creating resources, and a back button.
 * When the submit button is clicked, a POST request is sent to the test server. If the request is
 * successful, a success notification with the new ID as a Link appears. Otherwise, an error notification appears.
 * @returns React node with a ResourceCodeEditor component, a submit Button, and a back button
 */
const CreateResourcePage = () => {
  const router = useRouter();
  const { resourceType } = router.query;
  const [codeEditorContents, setCodeEditorContents] = useState("");
  const [patientValue, setPatientValue] = useState<string[]>([]);
  const [hasLintError, setHasLintError] = useState(true);
  const NEW_ID_IN_HEADER_REGEX = new RegExp(`${resourceType}/[A-Za-z0-9\-\.]{1,64}`);
  const context = useContext(CountContext);

  //called when the create group button is clicked. Converts patient list into a group resource, then
  //calls editorSubmitHandler to handle the POST request
  const convertToJSON = () => {
    const groupMember: fhirJson.GroupMember[] = patientValue.map((el) => {
      return { entity: { reference: el } };
    });

    //if groupMember array is empty, the group resource should not contain a member field
    const group: fhirJson.Group = { resourceType: "Group", type: "person", actual: true };

    //if groupMembers have been selected, populates the member field
    //if groupMembers have been selected, populates the member field
    if (groupMember.length > 0) {
      group.member = groupMember;
    }

    editorSubmitHandler(JSON.stringify(group));
  };

  return (
    <div style={{ paddingLeft: "15px", paddingRight: "15px" }}>
      <BackButton />
      <Center>
        <h2 style={{ color: textGray, marginTop: "0px", marginBottom: "4px" }}>
          Create New {resourceType}
        </h2>
      </Center>
      <Divider my="md" />
      <Center>
        <Text size="md" color={textGray}>
          Enter valid FHIR resource body for a new {resourceType} resource
        </Text>
      </Center>
      <div style={{ paddingTop: "20px", paddingBottom: "20px" }}>
        <ResourceCodeEditor
          initialValue=""
          onUpdate={(submittedVal) => setCodeEditorContents(submittedVal)}
          onValidate={(hasError) => setHasLintError(hasError)}
        />
      </div>
      <Center>
        <Button
          disabled={hasLintError}
          onClick={() => {
            editorSubmitHandler(codeEditorContents);
          }}
          color="cyan"
          variant="filled"
          size="lg"
          radius="md"
        >
          Submit Resource
        </Button>
      </Center>
      {resourceType === "Group" && (
        <div style={{ textAlign: "center", marginTop: "30px", marginBottom: "20px" }}>
          <Divider my="md" />
          <div>
            <Text weight={600} size="xl" color={textGray} style={{ marginBottom: "20px" }}>
              OR
            </Text>
          </div>

          <div style={{ margin: "auto", width: "85vh" }}>
            <MantineProvider
              // changes hex values associated with each Mantine color name to improve UI
              theme={{
                colors: {
                  gray: replaceBackground,
                },
              }}
            >
              <MultiSelectComponent
                resourceType="Patient"
                setValue={setPatientValue}
                value={patientValue}
              />
            </MantineProvider>
          </div>
          <Button
            style={{ marginTop: "30px" }}
            onClick={convertToJSON}
            color="cyan"
            variant="filled"
            size="lg"
            radius="md"
          >
            Create Group
          </Button>
        </div>
      )}
    </div>
  );

  //called when the submit button is clicked. Handles POST request and response
  async function editorSubmitHandler(submitContent: string) {
    let customMessage = <Text weight={500}>Problem connecting to server:&nbsp;</Text>;
    let notifProps: NotificationProps = {
      message: customMessage,
      color: "red",
      icon: <X size={18} />,
      autoClose: false,
    };

    fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/${resourceType}`, {
      method: "POST",
      body: submitContent,
      headers: {
        "Content-Type": "application/json+fhir",
      },
    })
      .then((response) => {
        let newID;

        if (response.status === 201 || response.status === 200) {
          const regexResponse = NEW_ID_IN_HEADER_REGEX.exec(
            response.headers.get("Location") as string,
          );

          if (regexResponse == null) {
            throw {
              name: "RegexError",
              message:
                "Invalid regexResponse: couldn't find resource ID in response header.\nLocation Header: " +
                response.headers.get("Location"),
            };
          }

          newID = regexResponse[0];
          customMessage = (
            <>
              <Text>Resource successfully created:&nbsp;</Text>
              <Link href={`/${newID}`} key={`${newID}`} passHref>
                <Text component="a" color="cyan">
                  {newID}
                </Text>
              </Link>
            </>
          );
          notifProps = {
            ...notifProps,
            color: "green",
            icon: <Check size={18} />,
          };

          //updates state to reflect that a resource count has been changed
          context.setCountChange(!context.countChange);

          //redirects user to the resourceType home page
          router.push({ pathname: `/${resourceType}` });
        } else {
          customMessage = (
            <Text weight={500}>
              {response.status} {response.statusText}&nbsp;
            </Text>
          );
          return response.json();
        }
      })
      .then((responseBody) => {
        if (responseBody) {
          customMessage = (
            <>
              {customMessage}
              <Text color="red">{responseBody.issue[0].details.text}</Text>
            </>
          );
        }
      })
      .catch((error) => {
        if (error.name === "RegexError") {
          customMessage = <Text color="red">{error.message}</Text>;
        } else {
          customMessage = (
            <>
              {customMessage}
              <Text color="red">{error.message}</Text>
            </>
          );
        }
      })
      .finally(() => {
        cleanNotifications();
        showNotification({ ...notifProps, message: customMessage });
      });
  }
};

export default CreateResourcePage;
