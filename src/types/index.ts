export interface Transaction {
  id?: string;
  amount: number;
  type: "Thu" | "Chi";
  description: string;
  date: string; // Format: "YYYY-MM-DD"
  account: string;
  purpose: string;
  category: string;
  member: string;
  channel: string;
  timestamp?: string;
}

export type FormElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

export interface KeywordMapping {
  [key: string]: { purpose: string; category: string; member?: string };
}

export interface FinancialSummary {
  totalIncome: number; // Tổng Thu
  businessIncome: number; // Thu Kinh doanh
  otherIncome: number; // Thu Khác
  totalExpense: number; // Tổng Chi
  businessExpense: number; // Chi Kinh doanh
  livingExpense: number; // Chi Sinh hoạt
  otherExpense: number; // Chi Khác
  businessProfit: number; // Lợi nhuận Kinh doanh
  netIncome: number; // Thu nhập Thuần
  expenseByPurpose: { [key: string]: number };
}

export interface MonthlyData {
  month: string; // Format: "YYYY-MM"
  thu: number;
  chi: number;
  loiNhuan: number;
}

export interface ComparisonData {
  period: string; // Format: "YYYY-MM" or "YYYY"
  income: number;
  expense: number;
  profit: number;
}

export interface CustomTooltip {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  label?: string | number;
}

export interface CategorizedData {
  name: string;
  value: number;
}
