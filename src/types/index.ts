// src/types/index.ts

import type { Timestamp } from "firebase/firestore";

// Định nghĩa kiểu dữ liệu cho một Giao dịch.
export interface Transaction {
  id?: string;
  amount: number;
  type: "Thu" | "Chi";
  description: string;
  date: string;
  account: string;
  purpose: string;
  category: string;
  member: string;
  channel: string;
  timestamp?: Timestamp; // Thêm trường timestamp để đồng bộ với Firestore
}

// Kiểu dữ liệu cho các phần tử form HTML.
export type FormElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

// Kiểu dữ liệu mới cho keywordMap để khắc phục lỗi TS7053
export interface KeywordMapping {
  [key: string]: { purpose: string; category: string; member?: string };
}

export interface MonthlyData {
  month: string;
  thu: number;
  chi: number;
  loiNhuan: number;
}

// Định nghĩa kiểu cho Recharts Tooltip
export interface CustomTooltip {
  active?: boolean;
  payload?: any[];
  label?: string | number;
}
