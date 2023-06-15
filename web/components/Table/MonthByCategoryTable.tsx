import React, { useCallback, useContext, useEffect, useState } from "react";
import { Flex, Tag, VStack, Text } from "@chakra-ui/react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { Database, Type } from "@/types/db";
import { DatabaseContext } from "@/context/DatabaseContext";

export const swatchMap: Record<Type, string> = {
  [Type.Rent]: "red",
  [Type.Groceries]: "orange",
  [Type.Restaurants]: "yellow",
  [Type.Travel]: "green",
  [Type.Leisure]: "blue",
  [Type.Errand]: "purple",
};
export default function MonthByCategoryTable() {
  const {
    databaseState: { expensesByType },
  } = useContext(DatabaseContext);

  return (
    <VStack w="100%">
      {expensesByType?.map(({ type, amount }, i) => (
        <Flex key={type} justifyContent="space-between" w="100%">
          <Tag colorScheme={swatchMap[type]}>{type}</Tag>
          <Text>{amount.toFixed(2)}</Text>
        </Flex>
      ))}
    </VStack>
  );
}
