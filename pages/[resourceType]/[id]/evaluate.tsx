import { Center } from "@mantine/core";
import { useRouter } from "next/router";
import SelectComponent from "../../../components/SelectComponent";
import { useState, useEffect } from "react";
import { RadioGroup, Radio } from "@mantine/core";

/**
 * Page for evaluate measure functionality.
 * @returns JSX Element
 */
const EvaluateMeasurePage = () => {
  const router = useRouter();
  const { resourceType } = router.query;
  const [value, setValue] = useState("react");
  useEffect(() => {
    console.log(value);
    //if (value === subject)
    <div style={{ margin: "30px" }}></div>;
  }, [value]);

  if (resourceType === "Measure") {
    return (
      <div>
        <RadioGroup
          value={value}
          onChange={setValue}
          label="Select your favorite framework/library"
          description="This is anonymous"
          required
        >
          <Radio value="Subject" label="Subject" />
          <Radio value="Population" label="Population" />
        </RadioGroup>
        {value === "Subject" ? <SelectComponent resourceType="Patient"></SelectComponent> : null}
        <SelectComponent resourceType="Practitioner"> </SelectComponent>
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
