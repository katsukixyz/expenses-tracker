import React, {
  useState,
  createContext,
  PropsWithChildren,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import { Expense, Type } from "@/types/db";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { date, y, m } from "@/utils/Date";

interface DatabaseContextType {
  databaseState: DatabaseState;
  databaseDispatch: React.Dispatch<Action<keyof ActionPayloadMap>>;
}

interface ExpenseByType {
  type: Type;
  amount: number;
}

interface DatabaseState {
  expenses: Expense[] | null;
  expensesByType: ExpenseByType[] | null;
  sum: number | null;
}

const defaultState = {
  expenses: null,
  expensesByType: null,
  sum: null,
};

const DatabaseContext = createContext<DatabaseContextType>({
  databaseState: defaultState,
  databaseDispatch: () => null,
});

type ActionPayloadMap = {
  setExpenses: Expense[];
  setExpensesByType: ExpenseByType[];
  setSum: number;
  addExpense: Expense;
};

type Action<K extends keyof ActionPayloadMap> = {
  type: K;
  payload: ActionPayloadMap[K];
};

function reducer<K extends keyof ActionPayloadMap>(
  state: DatabaseState,
  action: Action<K>
): DatabaseState {
  switch (action.type) {
    case "setExpenses":
      return {
        ...state,
        expenses: action.payload as Expense[],
      };
    case "setExpensesByType":
      return {
        ...state,
        expensesByType: action.payload as ExpenseByType[],
      };
    case "setSum":
      return {
        ...state,
        sum: action.payload as number,
      };
    case "addExpense":
      if (!state.expenses || !state.sum || !state.expensesByType) return state;

      const payload = action.payload as Expense;
      if (payload.date < new Date(y, m, 1)) return state;

      const expenses = [...state.expenses];
      expenses.every((expense, i) => {
        if (payload.date >= new Date(expense.date)) {
          expenses.splice(i, 0, payload);
          return false;
        }
        return true;
      });
      if (expenses.length === state.expenses.length) {
        expenses.push(payload);
      }

      return {
        expenses,
        expensesByType: state.expensesByType.map((expense) =>
          expense.type === payload.type
            ? { type: expense.type, amount: expense.amount + payload.amount }
            : expense
        ),
        sum: state.sum + payload.amount,
      };
    default:
      throw new Error(
        "Invalid reducer state reached. Consider rechecking punctuation."
      );
  }
}

const DatabaseProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const supabase = useSupabaseClient();
  const [databaseState, dispatch] = useReducer(reducer, defaultState);

  const getExpenses = useCallback(async () => {
    const { data } = await supabase
      .from("expenses")
      .select("name, type, date, amount, notes")
      .gte("date", `${y}-${m + 1 < 10 ? "0" : ""}${m + 1}-${1}`)
      .order("date", { ascending: false });
    dispatch({
      type: "setExpenses",
      payload: data as Expense[],
    });
  }, [supabase]);

  const getExpensesByType = useCallback(async () => {
    const { data } = await supabase.rpc("expenses_groupby_type", {
      date_param: `${y}-${m + 1 < 10 ? "0" : ""}${m + 1}-${1}`,
    });
    dispatch({
      type: "setExpensesByType",
      payload: data as ExpenseByType[],
    });
  }, [supabase]);

  const getSum = useCallback(async () => {
    const { data } = await supabase.rpc("sum_all_expenses", {
      date_param: `${y}-${m + 1 < 10 ? "0" : ""}${m + 1}-0${1}`,
    });
    dispatch({
      type: "setSum",
      payload: data as number,
    });
  }, [supabase]);

  useEffect(() => {
    void getExpenses();
    void getExpensesByType();
    void getSum();
  }, [getExpenses, getSum]);

  return (
    <DatabaseContext.Provider
      value={{ databaseState, databaseDispatch: dispatch }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export { DatabaseContext, DatabaseProvider };
