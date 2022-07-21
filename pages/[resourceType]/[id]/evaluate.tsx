import { Center } from "@mantine/core";
import { useRouter } from "next/router";

/**
 * Page for evaluate measure functionality.
 * @returns JSX Element
 */
const EvaluateMeasurePage = () => {
  const router = useRouter();
  const { resourceType } = router.query;
  if (resourceType === "Measure") {
    return <div>Coming soon...</div>;
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
