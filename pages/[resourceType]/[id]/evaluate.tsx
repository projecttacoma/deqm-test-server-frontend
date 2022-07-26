import { Center } from "@mantine/core";
import { useRouter } from "next/router";
import SelectComponent from "../../../components/SelectComponent";
import { useState } from "react";
import { RadioGroup, Radio } from "@mantine/core";

/**
 * Page for evaluate measure functionality.
 * @returns JSX Element
 */
const EvaluateMeasurePage = () => {
  const router = useRouter();
  const { resourceType } = router.query;
  const [radioValue, setRadioValue] = useState("react");
  const [practitionerValue, setPractitionerValue] = useState("");
  const [patientValue, setPatientValue] = useState("");

  if (resourceType === "Measure") {
    return (
      <div>
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
      </div>
    );
  } else {
    return (
      <Center>
        <div>
          Cannot evaluate on resourceType: {`${resourceType}`}, only on resourceType: Measure
        </div>
      </Center>
    );
  }
};

export default EvaluateMeasurePage;
