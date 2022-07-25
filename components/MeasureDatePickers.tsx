import { Center, Grid, Text } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import React, { useEffect, useState } from "react";
import { Calendar, X } from "tabler-icons-react";
import { cleanNotifications, showNotification } from "@mantine/notifications";
import { DateTime } from "luxon";

export interface MeasureDatePickerProps {
  id?: string;
  periodStart: Date;
  periodEnd: Date;
  startOnUpdate: (submittedVal: Date) => void;
  endOnUpdate: (submittedVal: Date) => void;
}

/**
 * MeasureDatePickers is a component that renders two DatePickers inside of a Grid.
 * They are pre-filled with dates specified as props or, if there is an ID in the router,
 * then the DatePickers are given the values form that Measure's effectivePeriod
 * @returns two DatePickers inside a Grid or an error message
 */
const MeasureDatePickers = (props: MeasureDatePickerProps) => {
  const [fetchingError, setFetchingError] = useState(false);

  useEffect(() => {
    if (props.id) {
      let fetchStatus = { status: 500, statusText: "Failed fetch request" };
      //fetch the Measure's JSON body from the test server based on id from url
      fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/Measure/${props.id}`)
        .then((data) => {
          fetchStatus = { status: data.status, statusText: data.statusText };
          return data.json();
        })
        .then((resourcePageBody) => {
          if (fetchStatus.status === 200 || fetchStatus.status === 201) {
            if (resourcePageBody.effectivePeriod.start) {
              props.startOnUpdate(
                new Date(DateTime.fromISO(resourcePageBody.effectivePeriod.start).toISO()),
              );
            }
            if (resourcePageBody.effectivePeriod.end) {
              props.endOnUpdate(
                new Date(DateTime.fromISO(resourcePageBody.effectivePeriod.end).toISO()),
              );
            }
          } else {
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
          setFetchingError(false);
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
  }, [props.id]);

  if (!fetchingError) {
    return (
      <Grid gutter="lg" min-width="15px" style={{ margin: 10 }}>
        <Grid.Col md={4} lg={3} xl={2}>
          <DatePicker
            label={<Text>Period Start</Text>}
            icon={<Calendar size={16} color={"#40a5bf"} />}
            value={props.periodStart}
            onChange={(v) => props.startOnUpdate(v ? v : new Date())}
            allowFreeInput
          ></DatePicker>
        </Grid.Col>
        <Grid.Col md={4} lg={3} xl={2}>
          <DatePicker
            label={<Text>Period End</Text>}
            icon={<Calendar size={16} color={"#40a5bf"} />}
            value={props.periodEnd}
            onChange={(v) => props.endOnUpdate(v ? v : new Date())}
            allowFreeInput
          ></DatePicker>
        </Grid.Col>
      </Grid>
    );
  } else {
    return (
      <Center>
        <div>Something went wrong.</div>
      </Center>
    );
  }
};

export default MeasureDatePickers;
