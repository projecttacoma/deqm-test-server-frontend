import { Center, Text } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { cleanNotifications, showNotification } from "@mantine/notifications";

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
          const date1 = resourcePageBody.effectivePeriod.start;
          const date2 = resourcePageBody.effectivePeriod.end;
          console.log("date1-date2: ", date1, date2);
          setPeriodStart(date1);
          setPeriodEnd(date2);
          console.log("stateDate1-stateDate2: ", periodStart, periodEnd);
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
  });
  if (!fetchingError) {
    if (resourceType === "Measure") {
      return (
        <>
          <h2>Evaluate Measure: {id}</h2>
          <DatePicker
            label="periodStart"
            value={periodStart}
            onChange={setPeriodStart}
          ></DatePicker>
          <DatePicker label="periodEnd" value={periodEnd} onChange={setPeriodEnd}></DatePicker>
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
  }
};

export default EvaluateMeasurePage;
