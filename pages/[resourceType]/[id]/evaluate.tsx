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
 * auto-complete boxes, a text preview of the measure request, and a display of the measure report response.
 * The DatePickers are pre-filled with a Measure's effective period dates or default dates.
 * The Patient SelectComponent only appears if the reportType selected is "Subject".
 * If the url resourceType is not a Measure, an error message is displayed.
 * If the Evaluate Measure request succeeds, a Prism component with the MeasureReport is rendered.
 * If the Evaluate Measure request fails, an error notification appears instead.
 * @returns React node with a back button, MeasureDatePickers, SelectComponents, a RadioGroup, and Text for the request preview
 */
const EvaluateMeasurePage = () => {
  const router = useRouter();
  const { resourceType, id } = router.query;
  const [fetchingError, setFetchingError] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [measureReportBody, setMeasureReportBody] = useState("");

  const [radioValue, setRadioValue] = useState("");
  const [practitionerValue, setPractitionerValue] = useState("");
  const [patientValue, setPatientValue] = useState("");
  const [periodStart, setPeriodStart] = useState<Date>(DEFAULT_PERIOD_START);
  const [periodEnd, setPeriodEnd] = useState<Date>(DEFAULT_PERIOD_END);

  /**
   * createRequestPreview builds the request preview with the evaluate measure state variables
   * @returns the request preview as a string
   */
  const createRequestPreview = () => {
    let requestPreview = `/Measure/${id}/$evaluate-measure?periodStart=${periodStart.toJSON()}&periodEnd=${periodEnd.toISOString()}`;
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

  const validSelections = () => {
    if (
      (periodStart && periodEnd && radioValue === "Population") ||
      (periodStart && periodEnd && radioValue === "Subject" && patientValue)
    ) {
      return true;
    } else return false;
  };

  if (resourceType === "Measure" && id) {
    if (!fetchingError) {
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
            Calculate
          </Button>
          {loadingRequest && (
            <Center>
              <div>Loading content...</div>
              <Loader color="cyan"></Loader>
            </Center>
          )}
          {measureReportBody && !loadingRequest && (
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
                    data-testid="prism-measure-report"
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

  //called when calculate button is clicked. Handles evaluate measure request and response
  function calculateHandler() {
    let customMessage = <Text weight={500}>Problem connecting to server:&nbsp;</Text>;
    let notifProps: NotificationProps = {
      message: customMessage,
      color: "red",
      icon: <X size={18} />,
      autoClose: false,
    };
    let fetchStatus = { status: 500, statusText: "Failed fetch request" };
    setLoadingRequest(true);

    fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/${createRequestPreview}`)
      .then((response) => {
        fetchStatus = { status: response.status, statusText: response.statusText };
        return response.json();
      })
      .then((responseBody) => {
        if (fetchStatus.status === 201 || fetchStatus.status === 200) {
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
          setMeasureReportBody(JSON.stringify(responseBody, null, 2));
          setFetchingError(false);
          setLoadingRequest(false);
        } else if (fetchStatus.status > 299) {
          customMessage = (
            <>
              <Text weight={500}>
                {fetchStatus.status} {fetchStatus.statusText}&nbsp;
              </Text>
              <Text color="red">
                {responseBody.issue
                  ? responseBody.issue[0]?.details?.text
                  : "Fetch Issue undefined."}
              </Text>
            </>
          );
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
