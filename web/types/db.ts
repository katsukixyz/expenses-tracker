export interface Database {
  public: {
    Tables: {
      expenses: {
        Row: Expense; // The data expected to be returned from a "select" statement.
        Insert: {}; // The data expected passed to an "insert" statement.
        Update: {}; // The data expected passed to an "update" statement.
      };
      users: {
        Row: User;
      };
    };
  };
}

export interface Expense {
  id?: number;
  name: string;
  type: Type;
  amount: number;
  notes: string;
  date: Date;
  uid?: string;
}

export interface User {
  uid: string;
  valid: boolean;
}

export enum Type {
  Rent = "Rent",
  Groceries = "Groceries",
  Travel = "Travel",
  Restaurants = "Restaurants",
  Leisure = "Leisure",
  Errand = "Errand",
}

export const typeLabels: Record<Type, string> = {
  [Type.Rent]: "Rent",
  [Type.Groceries]: "Groceries",
  [Type.Travel]: "Travel",
  [Type.Restaurants]: "Restaurants",
  [Type.Leisure]: "Leisure",
  [Type.Errand]: "Errand",
};
