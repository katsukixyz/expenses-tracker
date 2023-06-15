import React, { useContext } from "react";
import { Stat, StatHelpText, StatLabel, StatNumber } from "@chakra-ui/stat";
import { Box, Spinner } from "@chakra-ui/react";
import { date, y, m } from "@/utils/Date";
import { DatabaseContext } from "@/context/DatabaseContext";
import { typeLabels } from "@/types/db";
import assert from "assert";

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
function AverageSpend() {
  const {
    databaseState: { sum, expensesByType },
  } = useContext(DatabaseContext);

  const rentObj = expensesByType?.filter(
    (expenseByType) => expenseByType.type === typeLabels.Rent
  )[0];

  const sumExclRent = sum && rentObj ? sum - rentObj.amount : null;

  return (
    <>
      {sumExclRent && (
        <Stat>
          <StatLabel>Average daily spend (excl. rent)</StatLabel>
          <StatNumber>{`$${(sumExclRent / date.getDate()).toFixed(
            2
          )}`}</StatNumber>
          <StatHelpText>{`${monthNames[m]} 1 - ${
            monthNames[m]
          } ${date.getDate()}`}</StatHelpText>
        </Stat>
      )}
    </>
  );
}

export default AverageSpend;
