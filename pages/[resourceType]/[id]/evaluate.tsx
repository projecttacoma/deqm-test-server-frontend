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
} from "@mantine/core";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { DateTime } from "luxon";
import { textGray } from "../../../styles/appColors";
import BackButton from "../../../components/BackButton";
import SelectComponent from "../../../components/SelectComponent";
import MeasureDatePickers from "../../../components/MeasureDatePickers";
import { Grid } from "@mantine/core";
import {
  replaceBackground,
  replaceOutline,
  replaceSecondRed,
} from "../../../styles/codeColorScheme";
import { cleanNotifications, showNotification, NotificationProps } from "@mantine/notifications";
import { Check, X } from "tabler-icons-react";
import { Prism } from "@mantine/prism";
import {
  replaceDark,
  replaceGray,
  replaceTeal,
  replaceRed,
  replaceBlue,
} from "../../../styles/codeColorScheme";

const DEFAULT_PERIOD_START = new Date(`${DateTime.now().year}-01-01T00:00:00`);
const DEFAULT_PERIOD_END = new Date(`${DateTime.now().year}-12-31T00:00:00`);

/**
 * EvaluateMeasurePage is a page that renders a back button pre-filled DatePickers, radio buttons,
 * auto-complete boxes, and a text preview of the measure request.
 * The DatePickers are pre-filled with a Measure's effective period dates or default dates.
 * The Patient SelectComponent only appears if the reportType selected is "Subject".
 * If the url resourceType is not a Measure, an error message is displayed.
 * @returns React node with a back button, MeasureDatePickers, SelectComponents, a RadioGroup, and Text for the request preview
 */
const EvaluateMeasurePage = () => {
  const router = useRouter();
  const { resourceType, id } = router.query;
  const [radioValue, setRadioValue] = useState("Subject");
  const [fetchingError, setFetchingError] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [measureReportBody, setMeasureReportBody] = useState("");

  const [practitionerValue, setPractitionerValue] = useState("");
  const [patientValue, setPatientValue] = useState("");
  const [periodStart, setPeriodStart] = useState<Date>(DEFAULT_PERIOD_START);
  const [periodEnd, setPeriodEnd] = useState<Date>(DEFAULT_PERIOD_END);

  /**
   * createRequestPreview builds the request preview with the evaluate measure state variables
   * @returns the request preview as a string
   */
  const createRequestPreview = () => {
    //dates are formatted to be in the form "YYYY-MM-DD", with no timezone info
    let requestPreview = `/Measure/${id}/$evaluate-measure?periodStart=${DateTime.fromISO(
      periodStart.toISOString(),
    ).toISODate()}&periodEnd=${DateTime.fromISO(periodEnd.toISOString()).toISODate()}`;
    if (radioValue) {
      requestPreview += `&reportType=${radioValue.toLowerCase()}`;
      if (radioValue.toLowerCase() === "subject" && patientValue) {
        requestPreview += `&subject=${patientValue}`;
      }
    }
    if (practitionerValue) {
      requestPreview += `&practitioner=${practitionerValue}`;
    }
    return requestPreview;
  };

  //only appears on the measure page
  const validSelections = () => {
    if (
      (periodStart && periodEnd && radioValue === "Population" && practitionerValue) ||
      (periodStart && periodEnd && radioValue === "Subject" && practitionerValue && patientValue)
    ) {
      return true;
    } else return false;
  };

  if (resourceType === "Measure" && id) {
    if (!loadingRequest && !fetchingError) {
      //for resourceType Measure, evaluate measure components are rendered
      return (
        <>
          <BackButton />
          <Center>
            <h2 style={{ color: textGray, marginTop: "0px", marginBottom: "4px" }}>
              Evaluate Measure: {id}
            </h2>
          </Center>
          <Divider my="md" />
          <MeasureDatePickers
            measureID={id as string}
            periodStart={periodStart}
            periodEnd={periodEnd}
            startOnUpdate={setPeriodStart}
            endOnUpdate={setPeriodEnd}
          />
          <RadioGroup
            value={radioValue}
            onChange={setRadioValue}
            label="Select Subject or Population"
            required
          >
            <Radio value="Subject" label="Subject" />
            <Radio value="Population" label="Population" />
          </RadioGroup>
          {/* only displays autocomplete component if radio value is Patient */}
          {radioValue === "Subject" ? (
            <SelectComponent
              resourceType="Patient"
              setValue={setPatientValue}
              value={patientValue}
            />
          ) : null}
          <SelectComponent
            resourceType="Practitioner"
            setValue={setPractitionerValue}
            value={practitionerValue}
          />
          <h3 style={{ color: textGray, marginTop: "20px", marginBottom: "2px" }}>
            Request Preview:
          </h3>
          <Text
            size="md"
            style={{ backgroundColor: "#e3fafc", color: textGray }}
          >{`${createRequestPreview()}`}</Text>

          <Button
            disabled={!validSelections()}
            color="cyan"
            radius="md"
            size="sm"
            variant="filled"
            style={{
              marginRight: "8px",
              marginLeft: "8px",
            }}
            onClick={calculateHandler}
          >
            <div>Calculate</div>
          </Button>
          {measureReportBody && (
            <>
              <Divider my="sm" />
              <ScrollArea>
                <MantineProvider
                  //changes hex values associated with each Mantine color name to improve UI
                  theme={{
                    colors: {
                      gray: replaceGray,
                      dark: replaceDark,
                      teal: replaceTeal,
                      red: replaceRed,
                      blue: replaceBlue,
                    },
                  }}
                >
                  <Prism
                    language="json"
                    data-testid="prism-page-content"
                    colorScheme="dark"
                    style={{ maxWidth: "77vw", height: "80vh", backgroundColor: "#FFFFFF" }}
                  >
                    {measureReportBody}
                  </Prism>
                </MantineProvider>
              </ScrollArea>
            </>
          )}
        </>
      );
    } else if (loadingRequest && !fetchingError) {
      return (
        // <Center>
        //   <div>Loading content...</div>
        //   <Loader color="cyan"></Loader>
        // </Center>
        // <Divider my="md" />
        <div>
          <Grid columns={3} style={{ margin: 15 }}>
            <MantineProvider
              // changes hex values associated with each Mantine color name to improve UI
              theme={{
                colors: {
                  gray: replaceBackground,
                  blue: replaceOutline,
                  red: replaceSecondRed,
                },
              }}
            >
              <Grid.Col span={3}>
                <Grid.Col span={3} style={{ minHeight: 100, margin: 5 }}>
                  <MeasureDatePickers
                    measureID={id as string}
                    periodStart={periodStart}
                    periodEnd={periodEnd}
                    startOnUpdate={setPeriodStart}
                    endOnUpdate={setPeriodEnd}
                  />
                </Grid.Col>
                <Grid.Col span={3} style={{ margin: 5 }}>
                  <RadioGroup
                    value={radioValue}
                    onChange={setRadioValue}
                    label={<Text size="lg">Select a reportType</Text>}
                    style={{ marginBottom: "25px" }}
                  >
                    <Radio value="Subject" label="Subject" />
                    <Radio value="Population" label="Population" />
                  </RadioGroup>

                  {/* only displays autocomplete component if radio value is Patient */}
                  {radioValue === "Subject" ? (
                    <SelectComponent
                      resourceType="Patient"
                      setValue={setPatientValue}
                      value={patientValue}
                      required={true}
                    />
                  ) : (
                    <SelectComponent
                      resourceType="Patient"
                      setValue={setPatientValue}
                      value={patientValue}
                      disabled={true}
                      placeholder="Patient selection disabled when 'Population' is selected"
                    />
                  )}
                </Grid.Col>

                <Grid.Col span={3} style={{ margin: 5 }}>
                  <SelectComponent
                    resourceType="Practitioner"
                    setValue={setPractitionerValue}
                    value={practitionerValue}
                  />
                </Grid.Col>
              </Grid.Col>
              <Grid.Col span={3} style={{ margin: 5 }}>
                <h3
                  style={{
                    color: textGray,
                    marginTop: "20px",
                    marginBottom: "2px",
                    textAlign: "center",
                  }}
                >
                  Request Preview:{" "}
                </h3>
                <div
                  style={{
                    textAlign: "center",
                    overflowWrap: "break-word",
                    padding: "10px",
                    backgroundColor: "#F1F3F5",
                    border: "1px solid",
                    borderColor: "#4a4f4f",
                    borderRadius: "20px",
                    marginLeft: "30px",
                    marginRight: "30px",
                  }}
                >
                  <Text
                    size="md"
                    style={{ color: textGray, textAlign: "left" }}
                  >{`${createRequestPreview()}`}</Text>
                </div>
              </Grid.Col>
              <Grid.Col span={3} style={{ minHeight: 100, margin: 5 }}>
                <div
                  style={{
                    textAlign: "center",
                  }}
                >
                  <Button
                    color="cyan"
                    radius="lg"
                    size="md"
                    style={{
                      textAlign: "center",
                    }}
                  >
                    Sample Submit Button
                  </Button>
                </div>
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
            Cannot evaluate on resourceType: {`${resourceType}`}, only on resourceType: Measure
          </div>
        </Center>
      </>
    );
  }

  //called when submit button is clicked. Handles PUT request and response
  function calculateHandler() {
    let customMessage = <Text weight={500}>Problem connecting to server:&nbsp;</Text>;
    let notifProps: NotificationProps = {
      message: customMessage,
      color: "red",
      icon: <X size={18} />,
      autoClose: false,
    };

    setLoadingRequest(true);
    //${process.env.NEXT_PUBLIC_DEQM_SERVER}/${createRequestPreview}
    fetch(
      `${process.env.NEXT_PUBLIC_DEQM_SERVER}/Measure/measure-EXM104-8.2.000/$evaluate-measure?periodStart=2022-01-12T05:00:00.000Z&periodEnd=2019-05-02T04:00:00.000Z&reportType=individual`,
    )
      .then((response) => {
        //console.log("response: ", response);
        if (response.status === 201 || response.status === 200) {
          customMessage = (
            <>
              <Text>Evaluate Measure successful!&nbsp;</Text>
            </>
          );
          notifProps = {
            ...notifProps,
            color: "green",
            icon: <Check size={18} />,
          };

          //redirects user to page with the resource's body
          //router.push({ pathname: `/${resourceType}/${id}` });
        } else {
          customMessage = (
            <Text weight={500}>
              {response.status} {response.statusText}&nbsp;
            </Text>
          );
        }
        return response.json();
      })
      .then((responseBody) => {
        //console.log("responseBody: ", responseBody);
        if (responseBody) {
          setMeasureReportBody(JSON.stringify(responseBody, null, 2));
          console.log("measureReport: ", measureReportBody);
          setFetchingError(false);
          setLoadingRequest(false);
        } else {
          throw {
            name: "FetchingError",
            message: "No response.json returned from fetch.",
          };
        }
      })
      .catch((error) => {
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
  }
};

export default EvaluateMeasurePage;
