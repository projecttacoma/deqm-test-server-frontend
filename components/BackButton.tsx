import { useRouter } from "next/router";
import { Button } from "@mantine/core";

/**
 * BackButton is a component for rendering a back button
 * @returns Button that routes user back when clicked
 */
const BackButton = () => {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.back()}
      color="cyan"
      radius="md"
      size="sm"
      variant="filled"
      style={{
        float: "left",
      }}
    >
      Back
    </Button>
  );
};

export default BackButton;
