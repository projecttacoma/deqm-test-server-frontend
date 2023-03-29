import { Button, Center, Divider, Stack } from "@mantine/core";
import Link from "next/link";
import { textGray } from "../styles/appColors";

export default function Home() {
  return (
    <div>
      <title> DEQM Test Server Frontend </title>
      <Stack spacing="xs">
        <Center>
          <h2 style={{ color: textGray, marginTop: "4px", marginBottom: "0px", height: "40px" }}>
            Actions:
          </h2>
        </Center>
        <Divider my="sm" />
        <Center>
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
        </Center>
      </Stack>
    </div>
  );
}
