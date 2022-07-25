import { Center, Grid, Text } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import React, { useEffect, useState } from "react";
import { Calendar, X } from "tabler-icons-react";
import { cleanNotifications, showNotification } from "@mantine/notifications";
import { DateTime } from "luxon";
import { fhirJson } from "@fhir-typescript/r4-core";

export interface MeasureDatePickerProps {
  measureID?: string;
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
const MeasureDatePickers = ({
  measureID: id,
  periodStart,
  periodEnd,
  startOnUpdate,
  endOnUpdate,
}: MeasureDatePickerProps) => {
  const [fetchingError, setFetchingError] = useState(false);

  useEffect(() => {
    if (id) {
      let fetchStatus = { status: 500, statusText: "Failed fetch request" };
      //fetch the Measure's JSON body from the test server based on id from url
      fetch(`${process.env.NEXT_PUBLIC_DEQM_SERVER}/Measure/${id}`)
        .then((data) => {
          fetchStatus = { status: data.status, statusText: data.statusText };
          return data.json() as Promise<fhirJson.Measure | fhirJson.OperationOutcome>;
        })
        .then((resourcePageBody) => {
          if (fetchStatus.status === 200 || fetchStatus.status === 201) {
            const measureBody = resourcePageBody as fhirJson.Measure;
            if (measureBody.effectivePeriod?.start) {
              startOnUpdate(new Date(DateTime.fromISO(measureBody.effectivePeriod.start).toISO()));
            }
            if (measureBody.effectivePeriod?.end) {
              endOnUpdate(new Date(DateTime.fromISO(measureBody.effectivePeriod.end).toISO()));
            }
          } else {
            const operationOutcomeBody = resourcePageBody as fhirJson.OperationOutcome;
            cleanNotifications();
            showNotification({
              message: (
                <>
                  <Text weight={500}>
                    {fetchStatus.status} {fetchStatus.statusText}:&nbsp;
                  </Text>
                  <Text color="red">
                    {operationOutcomeBody.issue
                      ? operationOutcomeBody.issue[0]?.details?.text
                      : "Operation Outcome Issue undefined."}
                  </Text>
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
  }, [id, startOnUpdate, endOnUpdate]);

  if (!fetchingError) {
    return (
      <Grid gutter="lg" min-width="15px" style={{ margin: 10 }}>
        <Grid.Col md={4} lg={3} xl={2}>
          <DatePicker
            label={<Text>Period Start</Text>}
            icon={<Calendar size={16} color={"#40a5bf"} />}
            value={periodStart}
            onChange={(v) => startOnUpdate(v ? v : new Date())}
            allowFreeInput
          ></DatePicker>
        </Grid.Col>
        <Grid.Col md={4} lg={3} xl={2}>
          <DatePicker
            label={<Text>Period End</Text>}
            icon={<Calendar size={16} color={"#40a5bf"} />}
            value={periodEnd}
            onChange={(v) => endOnUpdate(v ? v : new Date())}
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
