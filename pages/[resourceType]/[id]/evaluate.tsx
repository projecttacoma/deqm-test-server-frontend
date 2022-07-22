import { Center, Divider, Grid, Text } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Calendar, X } from "tabler-icons-react";
import { cleanNotifications, showNotification } from "@mantine/notifications";
import { DateTime } from "luxon";
import { textGray } from "../../../styles/appColors";
import BackButton from "../../../components/BackButton";

const DEFAULT_PERIOD_START = new Date(`${DateTime.now().year}-01-01T00:00:00`);
const DEFAULT_PERIOD_END = new Date(`${DateTime.now().year}-12-31T00:00:00`);

/**
 * EvaluateMeasurePage is a page that renders a back button and DatePickers that are pre-filled with
 * a Measure's effective period dates or default dates.
 * If the url resourceType is not a Measure, an error message is displayed.
 * @returns React node with a back button and DatePickers if on a valid Measure url
 */
const EvaluateMeasurePage = () => {
  const router = useRouter();
  const { resourceType, id } = router.query;
  const [fetchingError, setFetchingError] = useState(false);
  const [periodStart, setPeriodStart] = useState<Date | null>(new Date());
  const [periodEnd, setPeriodEnd] = useState<Date | null>(new Date());
  useEffect(() => {
    if (resourceType === "Measure" && id) {
      let fetchStatus = { status: 500, statusText: "Failed fetch request" };
      //fetch the resource JSON content from the test server based on resourceType and id from url
      fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/${resourceType}/${id}`)
        .then((data) => {
          fetchStatus = { status: data.status, statusText: data.statusText };
          return data.json();
        })
        .then((resourcePageBody) => {
          if (fetchStatus.status === 200 || fetchStatus.status === 201) {
            setPeriodStart(
              resourcePageBody?.effectivePeriod?.start
                ? new Date(DateTime.fromISO(resourcePageBody.effectivePeriod.start).toISO())
                : DEFAULT_PERIOD_START,
            );
            setPeriodEnd(
              resourcePageBody?.effectivePeriod?.end
                ? new Date(DateTime.fromISO(resourcePageBody.effectivePeriod.end).toISO())
                : DEFAULT_PERIOD_END,
            );
            setFetchingError(false);
          } else {
            setFetchingError(true);
            cleanNotifications();
            showNotification({
              message: (
                <>
                  <Text weight={500}>
                    {fetchStatus.status} {fetchStatus.statusText}:&nbsp;
                  </Text>
                  <Text color="red">{resourcePageBody.issue[0].details.text}</Text>
                </>
              ),
              color: "red",
              icon: <X size={18} />,
              autoClose: false,
            });
          }
        })
        .catch((error) => {
          setFetchingError(true);
          console.log(error.message, "...start the server");
          cleanNotifications();
          showNotification({
            message: "Not connected to server!",
            color: "red",
            icon: <X size={18} />,
            autoClose: false,
          });
        });
    }
  }, [resourceType, id]);

  if (!fetchingError) {
    if (resourceType === "Measure") {
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
          <Grid gutter="lg" min-width="15px" style={{ margin: 10 }}>
            <Grid.Col md={4} lg={3} xl={2}>
              <DatePicker
                data-testid="period-start-datepicker"
                label={<Text>Period Start</Text>}
                icon={<Calendar size={16} color={"#40a5bf"} />}
                value={periodStart}
                onChange={setPeriodStart}
                allowFreeInput
              ></DatePicker>
            </Grid.Col>
            <Grid.Col md={4} lg={3} xl={2}>
              <DatePicker
                data-testid="period-end-datepicker"
                label={<Text>Period End</Text>}
                icon={<Calendar size={16} color={"#40a5bf"} />}
                value={periodEnd}
                onChange={setPeriodEnd}
                allowFreeInput
              ></DatePicker>
            </Grid.Col>
          </Grid>
        </>
      );
    } else {
      //if resourceType is not a Measure, an error message is displayed
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
  } else {
    //if fetch request throws an error, an error message is displayed
    return (
      <>
        <BackButton />
        <Center>
          <div>Something went wrong.</div>
        </Center>
      </>
    );
  }
};

export default EvaluateMeasurePage;
