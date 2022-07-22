import { Button, Center, Stack } from "@mantine/core";
import Link from "next/link";
import { textGray } from "../styles/appColors";

export default function Home() {
  return (
    <div>
      <title> DEQM Test Server Frontend </title>
      <Center>
        <Stack align="center">
          <h2 style={{ color: textGray }}>Actions:</h2>
          <Link
            href={{
              pathname: "/transactionUpload",
            }}
            key={`transaction-bundle-upload`}
            passHref
          >
            <Button component="a" color="cyan" radius="md" size="lg" variant="filled">
              <div>Upload Transaction Bundle</div>
            </Button>
          </Link>
        </Stack>
      </Center>
    </div>
  );
}
