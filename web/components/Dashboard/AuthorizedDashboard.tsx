import React, { useContext, useReducer } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  VStack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import MonthByCategoryTable from "../Table/MonthByCategoryTable";
import { AddIcon } from "@chakra-ui/icons";
import { z } from "zod";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { MonthByTable } from "@/components/Table/MonthByTable";
import { Type, typeLabels } from "@/types/db";
import AverageSpend from "@/components/Stat/AverageSpend";
import { DatabaseContext } from "@/context/DatabaseContext";
import { date } from "@/utils/Date";
import ProjectedSpend from "@/components/Stat/ProjectedSpend";

function nullValidation<V>(val: V, ctx: z.RefinementCtx, field: string) {
  if (val === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${field} required.`,
    });
    return z.NEVER;
  }
  return val;
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Name must not be empty." }),
  type: z
    .nativeEnum(Type)
    .nullable()
    .transform((val, ctx) => nullValidation(val, ctx, "Type")),
  amount: z
    .number()
    .positive()
    .nullable()
    .transform((val, ctx) => nullValidation(val, ctx, "Amount")),
  date: z.date(),
  notes: z.string(),
});

type FormState = z.input<typeof formSchema>;

type Action<K extends keyof FormState, V extends FormState[K]> = {
  type: "setField" | "clear";
  key?: K;
  data?: V;
};

function reducer<K extends keyof FormState, V extends FormState[K]>(
  state: FormState,
  action: Action<K, V>
) {
  switch (action.type) {
    case "setField":
      return {
        ...state,
        [action.key!]: action.data,
      };
    case "clear":
      return {
        name: "",
        type: null,
        amount: null,
        date: new Date(),
        notes: "",
      };
    default:
      throw Error("Unknown action.");
  }
}

export default function AuthorizedDashboard() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { databaseDispatch } = useContext(DatabaseContext);
  const [formData, dispatch] = useReducer(reducer, {
    name: "",
    type: null,
    amount: null,
    date: date,
    notes: "",
  });

  return (
    <Box h="100%">
      <Flex justifyContent={"space-between"}>
        <Heading>Expenses</Heading>
        <IconButton
          colorScheme="purple"
          icon={<AddIcon />}
          onClick={onOpen}
          aria-label={"add expense"}
        />
      </Flex>
      <Flex
        direction={["column", "row"]}
        justifyContent="space-between"
        pt={4}
        h="100%"
      >
        <Box>
          <Heading size="md" pb={4}>
            By category
          </Heading>
          <VStack w="20em" paddingRight={20} alignItems="start" spacing={8}>
            <MonthByCategoryTable />
            <VStack spacing={2} alignItems="start">
              <AverageSpend />
              <ProjectedSpend />
            </VStack>
          </VStack>
        </Box>
        <Box h="100%" pt={[4, 0]}>
          <Heading size="md" pb={4}>
            Month-to-date
          </Heading>
          <MonthByTable />
        </Box>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add expense</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  type="text"
                  onChange={(e) =>
                    dispatch({
                      type: "setField",
                      key: "name",
                      data: e.target.value,
                    })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Type</FormLabel>
                <Select
                  placeholder=""
                  options={Object.entries(typeLabels).map(([k, v]) => ({
                    value: k,
                    label: v,
                  }))}
                  onChange={(e) =>
                    dispatch({
                      type: "setField",
                      key: "type",
                      data: e!.value as Type,
                    })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Amount</FormLabel>
                <Input
                  type="number"
                  onChange={(e) =>
                    dispatch({
                      type: "setField",
                      key: "amount",
                      data: parseFloat(e.target.value),
                    })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  value={`${formData.date.getUTCFullYear()}-${
                    formData.date.getUTCMonth() + 1 < 10 ? "0" : ""
                  }${formData.date.getUTCMonth() + 1}-${
                    formData.date.getUTCDate() < 10 ? "0" : ""
                  }${formData.date.getUTCDate()}`}
                  onChange={(e) =>
                    dispatch({
                      type: "setField",
                      key: "date",
                      data: new Date(e.target.value),
                    })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  onChange={(e) =>
                    dispatch({
                      type: "setField",
                      key: "notes",
                      data: e.target.value,
                    })
                  }
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="purple"
              onClick={async () => {
                const validation = formSchema.safeParse(formData);
                if (validation.success) {
                  const { error } = await supabase.from("expenses").insert({
                    ...formData,
                    uid: user?.id,
                  });
                  if (!error) {
                    databaseDispatch({
                      type: "addExpense",
                      payload: formData as z.output<typeof formSchema>,
                    });
                    dispatch({
                      type: "clear",
                    });
                    onClose();
                  }
                } else {
                  toast({
                    title: "Error",
                    description: validation.error.issues
                      .map((issue) => issue.message)
                      .join("\r\n"),
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "top",
                    containerStyle: { whiteSpace: "pre" },
                  });
                }
              }}
            >
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
