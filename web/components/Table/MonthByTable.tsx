import React, { useContext, useMemo } from "react";
import {
  Box,
  Table,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Expense, Type } from "@/types/db";
import { swatchMap } from "@/components/Table/MonthByCategoryTable";
import { DatabaseContext } from "@/context/DatabaseContext";

export function MonthByTable() {
  const {
    databaseState: { expenses, expensesByType },
  } = useContext(DatabaseContext);

  const amountSum = useMemo(() => {
    // Cheaper alternative to summing all expenses, doesn't use `sum` databaseState because it excludes Rent type.
    if (expensesByType) {
      return expensesByType.reduce((prev, cur) => prev + cur.amount, 0);
    }
  }, [expensesByType]);

  const columnHelper = createColumnHelper<Expense>();

  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => info.getValue(),
      size: 300,
    }),
    columnHelper.accessor("type", {
      header: "Type",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("amount", {
      header: "Amount",
      cell: (info) => info.getValue().toFixed(2),
      meta: {
        isNumeric: true,
      },
      footer: (info) => amountSum?.toFixed(2),
    }),
    columnHelper.accessor("date", {
      header: "Date",
      cell: (info) => {
        const value = new Date(info.getValue());
        return `${value.getUTCMonth() + 1}/${value.getUTCDate()}`;
      },
    }),
    columnHelper.accessor("notes", {
      header: "Notes",
      cell: (info) => info.getValue(),
    }),
  ];
  const table = useReactTable({
    columns,
    data: expenses ? expenses : [],
    getCoreRowModel: getCoreRowModel(),
  });

  // return <Box minH="100%" bgColor="pink"></Box>;

  return (
    <TableContainer
      borderWidth={1}
      borderColor="gray.200"
      borderStyle="solid"
      overflowY="auto"
      h="90%"
    >
      <Table size="sm">
        <Thead position="sticky" top={0} zIndex="docked" bgColor="white">
          {table.getHeaderGroups().map((headerGroup) => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const meta: { isNumeric?: boolean } | undefined =
                  header.column.columnDef.meta;

                return (
                  <Th key={header.id} isNumeric={meta?.isNumeric}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </Th>
                );
              })}
            </Tr>
          ))}
        </Thead>
        <Tbody>
          {table.getRowModel().rows.map((row) => (
            <Tr key={row.id}>
              {row.getVisibleCells().map((cell) => {
                const meta: Partial<{ isNumeric: boolean }> | undefined =
                  cell.column.columnDef.meta;
                return (
                  <Td key={cell.id} isNumeric={meta?.isNumeric}>
                    {cell.column.id === "type" ? (
                      <Tag colorScheme={swatchMap[cell.getValue() as Type]}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </Tag>
                    ) : (
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
                  </Td>
                );
              })}
            </Tr>
          ))}
        </Tbody>
        <Tfoot position="sticky" bottom={0} zIndex="docked" bgColor="white">
          {table.getFooterGroups().map((footerGroup) => (
            <Tr key={footerGroup.id} position="sticky">
              {footerGroup.headers.map((header) => {
                const meta: { isNumeric?: boolean } | undefined =
                  header.column.columnDef.meta;
                return (
                  <Th key={header.id} isNumeric={meta?.isNumeric}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.footer,
                          header.getContext()
                        )}
                  </Th>
                );
              })}
            </Tr>
          ))}
        </Tfoot>
      </Table>
    </TableContainer>
  );
}
