import { useRouter } from "next/router";
import { Button } from "@mantine/core";

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
