import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  getExpenseByPurposeChart,
  getMonthlyTrendChart,
  getComparisonChart,
} from "../../helpers/charts";
import { formatCurrency } from "../../helpers/formatters";
import type {
  Transaction,
  MonthlyData,
  CategorizedData,
  CustomTooltip,
} from "../../types";

interface MonthlyChartsProps {
  transactions: Transaction[];
  year?: number;
  month?: number;
  comparisonPeriod1: string; // Format: dd/mm/yyyy
  comparisonPeriod2: string; // Format: dd/mm/yyyy
}

const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"];

const renderCustomTooltip = (
  { active, payload }: CustomTooltip,
  month?: number,
  year?: number
) => {
  if (active && payload && payload.length) {
    const periodLabel =
      month && year ? `Tháng ${month}/${year}` : "Tổng các tháng";
    return (
      <div className="p-4 bg-white shadow-lg rounded-md border border-slate-200">
        <p className="font-bold text-slate-700">{periodLabel}</p>
        {payload.map((entry, index) => (
          <p
            key={`tooltip-${index}`}
            className={`text-sm ${
              entry.name === "Thu"
                ? "text-green-600"
                : entry.name === "Chi"
                ? "text-red-600"
                : entry.name === "Lợi nhuận"
                ? "text-blue-600"
                : "text-gray-600"
            }`}
          >
            {`${entry.name}: ${formatCurrency(entry.value)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const MonthlyCharts: React.FC<MonthlyChartsProps> = ({
  transactions,
  year,
  month,
  comparisonPeriod1,
  comparisonPeriod2,
}) => {
  const expenseByPurpose: CategorizedData[] = getExpenseByPurposeChart(
    transactions,
    year,
    month
  );
  const monthlyTrend: MonthlyData[] = getMonthlyTrendChart(transactions, year);
  const comparisonData: MonthlyData[] = getComparisonChart(
    transactions,
    comparisonPeriod1,
    comparisonPeriod2
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-slate-700 mb-6">
        Biểu đồ tài chính
      </h2>
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-slate-600 mb-4">
          Tỷ trọng chi phí
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={expenseByPurpose}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) =>
                `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
              }
            >
              {expenseByPurpose.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              content={(props) => renderCustomTooltip(props, month, year)}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-slate-600 mb-4">
          Thu nhập và Chi tiêu
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyTrend}>
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip content={renderCustomTooltip} />
            <Legend />
            <Bar dataKey="thu" name="Thu" fill="#4ade80" />
            <Bar dataKey="chi" name="Chi" fill="#f87171" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-slate-600 mb-4">
          Lợi nhuận kinh doanh theo tháng
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyTrend}>
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip content={renderCustomTooltip} />
            <Legend />
            <Line
              type="monotone"
              dataKey="loiNhuan"
              name="Lợi nhuận"
              stroke="#3b82f6"
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-slate-600 mb-4">
          So sánh {comparisonPeriod1} vs {comparisonPeriod2}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData}>
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip content={renderCustomTooltip} />
            <Legend />
            <Bar dataKey="thu" name="Thu" fill="#4ade80" />
            <Bar dataKey="chi" name="Chi" fill="#f87171" />
            <Bar dataKey="loiNhuan" name="Lợi nhuận" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyCharts;
