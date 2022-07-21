import { Center, Divider, Grid, Text } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Calendar } from "tabler-icons-react";
import { cleanNotifications, showNotification } from "@mantine/notifications";
import { DateTime } from "luxon";
import { textGray } from "../../../styles/appColors";

const DEFAULT_PERIOD_START = new Date(`${DateTime.now().year}-01-01T00:00:00`);
const DEFAULT_PERIOD_END = new Date(`${DateTime.now().year}-12-31T00:00:00`);

/**
 * Page for evaluate measure functionality.
 * @returns JSX Element
 */
const EvaluateMeasurePage = () => {
  const router = useRouter();
  const { resourceType, id } = router.query;
  const [fetchingError, setFetchingError] = useState(false);
  const [periodStart, setPeriodStart] = useState<Date | null>(new Date());
  const [periodEnd, setPeriodEnd] = useState<Date | null>(new Date());
  useEffect(() => {
    if (resourceType === "Measure" && id) {
      //fetch the resource JSON content from the test server based on resource and id from url
      fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/${resourceType}/${id}`)
        .then((data) => {
          return data.json();
        })
        .then((resourcePageBody) => {
          setPeriodStart(
            resourcePageBody.effectivePeriod.start
              ? new Date(DateTime.fromISO(resourcePageBody.effectivePeriod.start).toISO())
              : DEFAULT_PERIOD_START,
          );
          setPeriodEnd(
            resourcePageBody.effectivePeriod.end
              ? new Date(DateTime.fromISO(resourcePageBody.effectivePeriod.end).toISO())
              : DEFAULT_PERIOD_END,
          );
          setFetchingError(false);
        })
        .catch((error) => {
          setFetchingError(true);
          console.log(error.message, "...start the server");
          cleanNotifications();
          showNotification({
            message: "Not connected to server!",
            color: "red",
            autoClose: false,
          });
        });
    }
  }, [id]);

  if (!fetchingError) {
    if (resourceType === "Measure") {
      return (
        <>
          <Center>
            <h2 style={{ color: textGray, marginTop: "2px", marginBottom: "1px" }}>
              Evaluate Measure: {id}
            </h2>
          </Center>
          <Divider my="md" />
          <Grid gutter="lg" style={{ margin: 10 }}>
            <Grid.Col span={2}>
              <DatePicker
                label={<Text>Period Start</Text>}
                icon={<Calendar size={16} color={"#40a5bf"} />}
                value={periodStart}
                onChange={setPeriodStart}
              ></DatePicker>
            </Grid.Col>
            <Grid.Col span={2}>
              <DatePicker
                label={<Text>Period End</Text>}
                icon={<Calendar size={16} color={"#40a5bf"} />}
                value={periodEnd}
                onChange={setPeriodEnd}
              ></DatePicker>
            </Grid.Col>
          </Grid>
        </>
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
  } else {
    return <div>Something went wrong.</div>;
  }
};

export default EvaluateMeasurePage;
