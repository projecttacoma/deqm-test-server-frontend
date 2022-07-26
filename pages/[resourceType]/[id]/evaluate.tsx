import { Center, Divider, RadioGroup, Radio } from "@mantine/core";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { DateTime } from "luxon";
import { textGray } from "../../../styles/appColors";
import BackButton from "../../../components/BackButton";
import SelectComponent from "../../../components/SelectComponent";
import MeasureDatePickers from "../../../components/MeasureDatePickers";

const DEFAULT_PERIOD_START = new Date(`${DateTime.now().year}-01-01T00:00:00`);
const DEFAULT_PERIOD_END = new Date(`${DateTime.now().year}-12-31T00:00:00`);

/**
 * EvaluateMeasurePage is a page that renders a back button and DatePickers that are pre-filled with
 * a Measure's effective period dates or default dates.
 * If the url resourceType is not a Measure, an error message is displayed.
 * @returns React node with a back button and MeasureDatePickers if on a valid Measure url
 */
const EvaluateMeasurePage = () => {
  const router = useRouter();
  const { resourceType, id } = router.query;
  const [radioValue, setRadioValue] = useState("react");
  const [practitionerValue, setPractitionerValue] = useState("");
  const [patientValue, setPatientValue] = useState("");
  const [periodStart, setPeriodStart] = useState<Date>(DEFAULT_PERIOD_START);
  const [periodEnd, setPeriodEnd] = useState<Date>(DEFAULT_PERIOD_END);

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
          <SelectComponent resourceType="Patient" setValue={setPatientValue} value={patientValue} />
        ) : null}
        <SelectComponent
          resourceType="Practitioner"
          setValue={setPractitionerValue}
          value={practitionerValue}
        />
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
