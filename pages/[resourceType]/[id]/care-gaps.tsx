import {
  Center,
  Divider,
  RadioGroup,
  Radio,
  Text,
  Button,
  Loader,
  ScrollArea,
  MantineProvider,
  TextInput,
} from "@mantine/core";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { textGray } from "../../../styles/appColors";
import BackButton from "../../../components/BackButton";
import SelectComponent from "../../../components/SelectComponent";
import MeasureDatePickers from "../../../components/MeasureDatePickers";
import { Grid } from "@mantine/core";
import { shadesOfGray, shadesOfCyan, shadesOfStrawberry } from "../../../styles/codeColorScheme";
import { Prism } from "@mantine/prism";
import { cleanNotifications, showNotification, NotificationProps } from "@mantine/notifications";
import { Check, X } from "tabler-icons-react";
import { allWhite, AllDarkGray, allGreen, allCobalt } from "../../../styles/codeColorScheme";
import { fhirJson } from "@fhir-typescript/r4-core";

const DEFAULT_PERIOD_START = new Date(`${DateTime.now().year}-01-01T00:00:00`);
const DEFAULT_PERIOD_END = new Date(`${DateTime.now().year}-12-31T00:00:00`);

/**
 * CareGapsPage is a page that renders a back button, pre-filled DatePickers, radio buttons,
 * auto-complete boxes, a text preview of the request, a calculate button, and a display of the gaps in care evaluation.
 * The DatePickers are pre-filled with a Measure's effective period dates or default dates.
 * The Patient SelectComponent is enabled if the selected radio button is "Subject".
 * The Organization and Practitioner SelectComponents are enabled if the selected radio button is "Organization".
 * If the url resourceType is not a Measure, an error message is displayed.
 * If the Gaps in Care request succeeds, a Prism component with the evaluation is rendered. Otherwise,
 * an error notification appears.
 * @returns React node with a back button, MeasureDatePickers, SelectComponents, a RadioGroup, a request preview as Text, and a calculate Button
 */
const CareGapsPage = () => {
  const router = useRouter();
  const { resourceType, id, patient, practitioner, organization } = router.query;
  const [radioValue, setRadioValue] = useState("Subject");
  const [fetchingError, setFetchingError] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [careGapsResultsBody, setCareGapsResultsBody] = useState("");
  const [gridColSpans, setGridColSpans] = useState([3, 3, 0]);
  const [patientValue, setPatientValue] = useState("");
  const [practitionerValue, setPractitionerValue] = useState("");
  const [organizationValue, setOrganizationValue] = useState("");
  const [programValue, setProgramValue] = useState("");
  const [periodStart, setPeriodStart] = useState<Date>(DEFAULT_PERIOD_START);
  const [periodEnd, setPeriodEnd] = useState<Date>(DEFAULT_PERIOD_END);

  //fetches patient, organization, and practitioner values from url and populates state variables accordingly
  useEffect(() => {
    setPatientValue(patient ? patient.toString() : "");
    setRadioValue("Subject");
  }, [patient]);

  useEffect(() => {
    if (organization || practitioner) {
      setRadioValue("Organization");
    }
    setOrganizationValue(organization ? organization.toString() : "");
    setPractitionerValue(practitioner ? practitioner.toString() : "");
  }, [organization, practitioner]);

  /**
   * createRequestPreview builds the request preview with the care-gaps state variables
   * @returns the request preview as a string
   */
  const createRequestPreview = () => {
    //dates are formatted to be in the form "YYYY-MM-DD", with no timezone info
    let requestPreview = `/Measure/$care-gaps?measureId=${id}&periodStart=${DateTime.fromISO(
      periodStart.toISOString(),
    ).toISODate()}&periodEnd=${DateTime.fromISO(
      periodEnd.toISOString(),
    ).toISODate()}&status=open-gap`;
    if (radioValue) {
      if (radioValue.toLowerCase() === "subject" && patientValue) {
        requestPreview += `&subject=${patientValue}`;
      } else if (radioValue.toLowerCase() === "organization" && organizationValue) {
        requestPreview += `&organization=${organizationValue}`;
        practitionerValue
          ? (requestPreview += `&practitioner=${practitionerValue}`)
          : requestPreview;
      }
      programValue ? (requestPreview += `&program=${programValue}`) : requestPreview;
    }

    return requestPreview;
  };

  //true if user has selected/entered a correct combination of inputs
  const validSelections = () => {
    if (
      (periodStart && periodEnd && radioValue === "Subject" && patientValue) ||
      (periodStart && periodEnd && radioValue === "Organization" && organizationValue)
    ) {
      return true;
    } else return false;
  };

  //handles sending the care-gaps request and processes the response
  const calculateCareGapsHandler = () => {
    let customMessage = <Text weight={500}>Problem connecting to server:&nbsp;</Text>;
    let notifProps: NotificationProps = {
      message: customMessage,
      color: "red",
      icon: <X size={18} />,
      autoClose: false,
    };
    let fetchStatus = { status: 500, statusText: "Failed fetch request" };
    setLoadingRequest(true);

    fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}${createRequestPreview()}`)
      .then((response) => {
        fetchStatus = { status: response.status, statusText: response.statusText };
        return response.json() as Promise<fhirJson.Measure | fhirJson.OperationOutcome>;
      })
      .then((responseBody) => {
        if (fetchStatus.status === 201 || fetchStatus.status === 200) {
          customMessage = (
            <>
              <Text>Gaps in care calculation successful!&nbsp;</Text>
            </>
          );
          notifProps = {
            ...notifProps,
            color: "green",
            icon: <Check size={18} />,
          };
          setCareGapsResultsBody(JSON.stringify(responseBody, null, 2));
          setGridColSpans([8, 3, 5]);
          setFetchingError(false);
          setLoadingRequest(false);
        } else if (fetchStatus.status > 299) {
          const operationOutcomeBody = responseBody as fhirJson.OperationOutcome;
          customMessage = (
            <>
              <Text weight={500}>
                {fetchStatus.status} {fetchStatus.statusText}&nbsp;
              </Text>
              <Text color="red">
                {operationOutcomeBody.issue
                  ? operationOutcomeBody.issue[0]?.details?.text
                  : "Fetch Issue undefined."}
              </Text>
            </>
          );
          setCareGapsResultsBody("");
          setGridColSpans([3, 3, 0]);
          setFetchingError(false);
          setLoadingRequest(false);
        } else {
          throw {
            name: "FetchingError",
            message: "Bad status returned",
          };
        }
      })
      .catch((error) => {
        setCareGapsResultsBody("");
        setGridColSpans([3, 3, 0]);
        setFetchingError(true);
        customMessage = (
          <>
            {customMessage}
            <Text color="red">{error.message}</Text>
          </>
        );
      })
      .finally(() => {
        cleanNotifications();
        showNotification({ ...notifProps, message: customMessage });
      });
  };

  if (resourceType === "Measure" && id) {
    if (!fetchingError) {
      //for resourceType Measure, calculate care gaps components are rendered
      return (
        <div>
          <BackButton />
          <Center>
            <h2 style={{ color: textGray, marginTop: "0px", marginBottom: "4px" }}>
              Gaps in Care: {id}
            </h2>
          </Center>
          <Divider my="md" />
          <Grid columns={gridColSpans[0]}>
            <MantineProvider
              // changes hex values associated with each Mantine color name to improve UI
              theme={{
                colors: {
                  gray: shadesOfGray,
                  blue: shadesOfCyan,
                  red: shadesOfStrawberry,
                },
              }}
            >
              <Grid.Col span={gridColSpans[1]}>
                <Grid.Col>
                  <Grid.Col style={{ minHeight: 90 }}>
                    <MeasureDatePickers
                      measureID={id as string}
                      periodStart={periodStart}
                      periodEnd={periodEnd}
                      startOnUpdate={setPeriodStart}
                      endOnUpdate={setPeriodEnd}
                    />
                  </Grid.Col>
                  <Grid.Col>
                    <RadioGroup
                      value={radioValue}
                      onChange={setRadioValue}
                      size="lg"
                      style={{ marginTop: "10px", marginBottom: "20px" }}
                    >
                      <Radio
                        value="Subject"
                        label={
                          <Text size="xl" color={textGray} weight={500}>
                            Subject
                          </Text>
                        }
                      />
                      <Radio
                        value="Organization"
                        label={
                          <Text size="xl" color={textGray} weight={500}>
                            Organization
                          </Text>
                        }
                      />
                    </RadioGroup>
                    {radioValue === "Subject" ? (
                      <SelectComponent
                        resourceType="Patient"
                        setValue={setPatientValue}
                        value={patientValue}
                        required
                      />
                    ) : (
                      <SelectComponent
                        resourceType="Patient"
                        setValue={setPatientValue}
                        value={patientValue}
                        disabled
                        placeholder="Patient selection disabled when 'Organization' is selected"
                      />
                    )}
                  </Grid.Col>
                  <Grid.Col>
                    {radioValue === "Organization" ? (
                      <SelectComponent
                        resourceType="Organization"
                        setValue={setOrganizationValue}
                        value={organizationValue}
                        required
                      />
                    ) : (
                      <SelectComponent
                        resourceType="Organization"
                        setValue={setOrganizationValue}
                        value={organizationValue}
                        disabled
                        placeholder="Organization selection disabled when 'Subject' is selected"
                      />
                    )}
                  </Grid.Col>
                  <Grid.Col>
                    {radioValue === "Organization" ? (
                      <SelectComponent
                        resourceType="Practitioner"
                        setValue={setPractitionerValue}
                        value={practitionerValue}
                      />
                    ) : (
                      <SelectComponent
                        resourceType="Practitioner"
                        setValue={setPractitionerValue}
                        value={practitionerValue}
                        disabled
                        placeholder="Practitioner selection disabled when 'Subject' is selected"
                      />
                    )}
                  </Grid.Col>
                  <Grid.Col>
                    <TextInput
                      placeholder="Enter a program"
                      onChange={(event) => setProgramValue(event.currentTarget.value)}
                      label="Program"
                      variant="filled"
                      radius="xl"
                      size="lg"
                    ></TextInput>
                  </Grid.Col>
                </Grid.Col>
                <Grid.Col>
                  <h3
                    style={{
                      color: textGray,
                      marginTop: "5px",
                      marginBottom: "2px",
                      textAlign: "center",
                    }}
                  >
                    Request Preview:
                  </h3>
                  <div
                    style={{
                      textAlign: "center",
                      overflowWrap: "break-word",
                      padding: "8px",
                      paddingLeft: "20px",
                      backgroundColor: "#F1F3F5",
                      border: "1px solid",
                      borderColor: "#4a4f4f",
                      borderRadius: "20px",
                      marginLeft: "10px",
                      marginRight: "10px",
                    }}
                  >
                    <Text size="md" style={{ color: textGray, textAlign: "left" }}>
                      {createRequestPreview()}
                    </Text>
                  </div>
                </Grid.Col>
                <Grid.Col>
                  <div
                    style={{
                      textAlign: "center",
                    }}
                  >
                    <MantineProvider
                      theme={{
                        colors: {
                          cyan: shadesOfCyan,
                        },
                      }}
                    >
                      <Button
                        disabled={!validSelections()}
                        color="cyan"
                        radius="md"
                        size="sm"
                        variant="filled"
                        onClick={calculateCareGapsHandler}
                      >
                        Calculate
                      </Button>
                    </MantineProvider>
                  </div>
                </Grid.Col>
              </Grid.Col>
              <Grid.Col span={gridColSpans[2]}>
                {loadingRequest && (
                  <Center>
                    <div>Loading content...</div>
                    <Loader color="cyan"></Loader>
                  </Center>
                )}
                {careGapsResultsBody && !loadingRequest && (
                  <>
                    <ScrollArea>
                      <MantineProvider
                        //changes hex values associated with each Mantine color name to improve UI
                        theme={{
                          colors: {
                            gray: AllDarkGray,
                            dark: allWhite,
                            teal: shadesOfStrawberry,
                            red: allGreen,
                            blue: allCobalt,
                          },
                        }}
                      >
                        <Prism
                          language="json"
                          data-testid="prism-measure-report"
                          colorScheme="dark"
                          style={{ maxWidth: "77vw", height: "80vh", backgroundColor: "#FFFFFF" }}
                        >
                          {careGapsResultsBody}
                        </Prism>
                      </MantineProvider>
                    </ScrollArea>
                  </>
                )}
              </Grid.Col>
            </MantineProvider>
          </Grid>
        </div>
      );
    } else {
      return <div>Something went wrong.</div>;
    }
  } else {
    return (
      <>
        <BackButton />
        <Center>
          <div>
            Cannot calculate care gaps on resourceType: {`${resourceType}`}, only on resourceType:
            Measure
          </div>
        </Center>
      </>
    );
  }
};

export default CareGapsPage;
