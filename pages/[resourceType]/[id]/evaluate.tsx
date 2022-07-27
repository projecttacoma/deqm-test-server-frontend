import { Center, Divider, RadioGroup, Radio, Text, MantineProvider } from "@mantine/core";
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

  if (resourceType === "Measure" && id) {
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

        <Grid columns={8} style={{ margin: 10 }}>
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
            <Grid.Col span={8} style={{ minHeight: 100 }}>
              <MeasureDatePickers
                measureID={id as string}
                periodStart={periodStart}
                periodEnd={periodEnd}
                startOnUpdate={setPeriodStart}
                endOnUpdate={setPeriodEnd}
              />
            </Grid.Col>

            <Grid.Col span={4} style={{ minHeight: 100 }}>
              <RadioGroup
                value={radioValue}
                onChange={setRadioValue}
                label="Select a reportType"
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
                  required={true}
                />
              ) : null}
            </Grid.Col>

            <Grid.Col span={4} style={{ minHeight: 100 }}>
              <SelectComponent
                resourceType="Practitioner"
                setValue={setPractitionerValue}
                value={practitionerValue}
              />
            </Grid.Col>

            <Grid.Col span={8} style={{ minHeight: 100 }}>
              <h3 style={{ color: textGray, marginTop: "20px", marginBottom: "2px" }}>
                Request Preview:{" "}
              </h3>
              <Text size="md" style={{ color: textGray }}>{`${createRequestPreview()}`}</Text>{" "}
            </Grid.Col>
          </MantineProvider>
        </Grid>
      </>
    );
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
};

export default EvaluateMeasurePage;
