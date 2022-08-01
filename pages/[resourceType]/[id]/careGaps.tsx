import { useRouter } from "next/router";
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
import BackButton from "../../../components/BackButton";
import { textGray } from "../../../styles/appColors";

const EvaluateMeasurePage = () => {
  const router = useRouter();
  const { resourceType, id } = router.query;

  if (resourceType === "Measure" && id) {
    //for resourceType Measure, calculate care gaps components are rendered
    return (
      <div>
        <BackButton />
        <Center>
          <h2 style={{ color: textGray, marginTop: "0px", marginBottom: "4px" }}>
            Calculate Care Gaps: {id}
          </h2>
        </Center>
        <Divider my="md" />
        <Text>Coming soon</Text>
      </div>
    );
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

export default EvaluateMeasurePage;
