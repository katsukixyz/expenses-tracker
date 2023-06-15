import React, { useContext } from "react";
import { Stat, StatHelpText, StatLabel, StatNumber } from "@chakra-ui/stat";
import { Box, Spinner } from "@chakra-ui/react";
import { date, y, m } from "@/utils/Date";
import { DatabaseContext } from "@/context/DatabaseContext";
import { typeLabels } from "@/types/db";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
function ProjectedSpend() {
  const {
    databaseState: { sum, expensesByType },
  } = useContext(DatabaseContext);

  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const rentObj = expensesByType?.filter(
    (expenseByType) => expenseByType.type === typeLabels.Rent
  )[0];

  const sumExclRent = sum && rentObj ? sum - rentObj.amount : null;

  return (
    <>
      {sumExclRent && (
        <Stat>
          <StatLabel>Projected monthly spend (incl. rent)</StatLabel>
          <StatNumber>{`$${(
            rentObj!.amount +
            (sumExclRent * daysInMonth) / date.getDate()
          ).toFixed(2)}`}</StatNumber>
          <StatHelpText>{`${monthNames[m]} 1 - ${monthNames[m]} ${daysInMonth}`}</StatHelpText>
        </Stat>
      )}
    </>
  );
}

export default ProjectedSpend;
