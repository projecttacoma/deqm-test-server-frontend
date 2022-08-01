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
  TextInput,
} from "@mantine/core";
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
import { Prism } from "@mantine/prism";
import {
  replaceDark,
  replaceGray,
  replaceTeal,
  replaceRed,
  replaceBlue,
} from "../../../styles/codeColorScheme";

const DEFAULT_PERIOD_START = new Date(`${DateTime.now().year}-01-01T00:00:00`);
const DEFAULT_PERIOD_END = new Date(`${DateTime.now().year}-12-31T00:00:00`);

const CareGapsPage = () => {
  const router = useRouter();
  const { resourceType, id } = router.query;
  const [radioValue, setRadioValue] = useState("Subject");
  const [fetchingError, setFetchingError] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [measureReportBody, setMeasureReportBody] = useState("");
  const [gridColSpans, setGridColSpans] = useState([3, 3, 0]);
  const [patientValue, setPatientValue] = useState("");
  const [practitionerValue, setPractitionerValue] = useState("");
  const [organizationValue, setOrganizationValue] = useState("");
  const [periodStart, setPeriodStart] = useState<Date>(DEFAULT_PERIOD_START);
  const [periodEnd, setPeriodEnd] = useState<Date>(DEFAULT_PERIOD_END);

  if (resourceType === "Measure" && id) {
    if (!fetchingError) {
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
          <Grid columns={gridColSpans[0]}>
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
              <Grid.Col span={gridColSpans[1]}>
                <Grid.Col>
                  <Grid.Col style={{ minHeight: 100 }}>
                    <MeasureDatePickers
                      measureID={id as string}
                      periodStart={periodStart}
                      periodEnd={periodEnd}
                      startOnUpdate={setPeriodStart}
                      endOnUpdate={setPeriodEnd}
                    />
                  </Grid.Col>
                  <Grid.Col>
                    <RadioGroup
                      value={radioValue}
                      onChange={setRadioValue}
                      size="lg"
                      style={{ marginBottom: "25px" }}
                    >
                      <Radio
                        value="Subject"
                        label={
                          <Text size="lg" color={textGray} weight={500}>
                            Subject
                          </Text>
                        }
                      />
                      <Radio
                        value="Organization"
                        label={
                          <Text size="lg" color={textGray} weight={500}>
                            Organization
                          </Text>
                        }
                      />
                    </RadioGroup>
                    {radioValue === "Subject" ? (
                      <SelectComponent
                        resourceType="Patient"
                        setValue={setPatientValue}
                        value={patientValue}
                        required
                      />
                    ) : (
                      <SelectComponent
                        resourceType="Patient"
                        setValue={setPatientValue}
                        value={patientValue}
                        disabled
                        placeholder="Patient selection disabled when 'Organization' is selected"
                      />
                    )}
                  </Grid.Col>
                  <Grid.Col>
                    {radioValue === "Organization" ? (
                      <SelectComponent
                        resourceType="Organization"
                        setValue={setOrganizationValue}
                        value={organizationValue}
                        required
                      />
                    ) : (
                      <SelectComponent
                        resourceType="Organization"
                        setValue={setPatientValue}
                        value={patientValue}
                        disabled
                        placeholder="Organization selection disabled when 'Subject' is selected"
                      />
                    )}
                  </Grid.Col>
                  <Grid.Col>
                    {radioValue === "Organization" ? (
                      <SelectComponent
                        resourceType="Practitioner"
                        setValue={setPractitionerValue}
                        value={practitionerValue}
                      />
                    ) : (
                      <SelectComponent
                        resourceType="Practitioner"
                        setValue={setPractitionerValue}
                        value={practitionerValue}
                        disabled
                        placeholder="Practitioner selection disabled when 'Subject' is selected"
                      />
                    )}
                  </Grid.Col>
                  <Grid.Col>
                    <TextInput
                      placeholder="Enter a program"
                      label="Program"
                      variant="filled"
                      radius="xl"
                      size="lg"
                    ></TextInput>
                  </Grid.Col>
                </Grid.Col>
                <Grid.Col>
                  <h3
                    style={{
                      color: textGray,
                      marginTop: "20px",
                      marginBottom: "2px",
                      textAlign: "center",
                    }}
                  >
                    Request Preview:
                  </h3>
                  <div
                    style={{
                      textAlign: "center",
                      overflowWrap: "break-word",
                      padding: "10px",
                      backgroundColor: "#F1F3F5",
                      border: "1px solid",
                      borderColor: "#4a4f4f",
                      borderRadius: "20px",
                      marginLeft: "30px",
                      marginRight: "30px",
                    }}
                  >
                    <Text
                      size="md"
                      style={{ color: textGray, textAlign: "left" }}
                    >{`Placeholder`}</Text>
                  </div>
                </Grid.Col>
                <Grid.Col style={{ minHeight: 100 }}>
                  <div
                    style={{
                      textAlign: "center",
                    }}
                  >
                    <MantineProvider
                      theme={{
                        colors: {
                          cyan: replaceOutline,
                        },
                      }}
                    >
                      <Button
                        disabled
                        color="cyan"
                        radius="md"
                        size="sm"
                        variant="filled"
                        onClick={() => console.log("calculate button clicked")}
                      >
                        Calculate
                      </Button>
                    </MantineProvider>
                  </div>
                </Grid.Col>
              </Grid.Col>
              <Grid.Col span={gridColSpans[2]}>
                {loadingRequest && (
                  <Center>
                    <div>Loading content...</div>
                    <Loader color="cyan"></Loader>
                  </Center>
                )}
                {measureReportBody && !loadingRequest && (
                  <>
                    <ScrollArea>
                      <MantineProvider
                        //changes hex values associated with each Mantine color name to improve UI
                        theme={{
                          colors: {
                            gray: replaceGray,
                            dark: replaceDark,
                            teal: replaceTeal,
                            red: replaceRed,
                            blue: replaceBlue,
                          },
                        }}
                      >
                        <Prism
                          language="json"
                          data-testid="prism-measure-report"
                          colorScheme="dark"
                          style={{ maxWidth: "77vw", height: "80vh", backgroundColor: "#FFFFFF" }}
                        >
                          Placeholder
                        </Prism>
                      </MantineProvider>
                    </ScrollArea>
                  </>
                )}
              </Grid.Col>
            </MantineProvider>
          </Grid>
        </div>
      );
    } else {
      return <div>Something went wrong.</div>;
    }
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

export default CareGapsPage;
