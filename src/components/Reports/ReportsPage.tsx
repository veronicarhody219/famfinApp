import React, { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";
import type { Transaction } from "../../types";
import { formatCurrency, formatDateToDDMMYYYY } from "../../helpers/formatters";
import { PURPOSE_GROUPS } from "../../helpers/constants";

interface ReportsPageProps {
  transactions: Transaction[];
}

const ReportsPage: React.FC<ReportsPageProps> = ({ transactions }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const txDate = new Date(t.date);
      if (startDate && txDate < startDate) return false;
      if (endDate && txDate > endDate) return false;
      return true;
    });
  }, [transactions, startDate, endDate]);

  const getSpendingByCategory = (
    purposeGroup?: string
  ): { name: string; value: number }[] => {
    const spendingData: { [key: string]: number } = {};
    const groupPurposes = purposeGroup
      ? PURPOSE_GROUPS[purposeGroup] || []
      : [];

    filteredTransactions
      .filter(
        (t) =>
          t.type === "Chi" &&
          (groupPurposes.length === 0 || groupPurposes.includes(t.purpose))
      )
      .forEach((t) => {
        spendingData[t.category] = (spendingData[t.category] || 0) + t.amount;
      });
    return Object.keys(spendingData).map((key) => ({
      name: key,
      value: spendingData[key],
    }));
  };

  const getSpendingByMember = (): { name: string; value: number }[] => {
    const spendingData: { [key: string]: number } = {};
    filteredTransactions
      .filter((t) => t.type === "Chi")
      .forEach((t) => {
        spendingData[t.member] = (spendingData[t.member] || 0) + t.amount;
      });
    return Object.keys(spendingData).map((key) => ({
      name: key,
      value: spendingData[key],
    }));
  };

  const dataSinhHoat = getSpendingByCategory("Sinh hoạt");
  const dataKinhDoanh = getSpendingByCategory("Kinh doanh");
  const dataKhac = getSpendingByCategory("Khác");
  const dataByMember = getSpendingByMember();

  const COLORS = [
    "#FF8042",
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
  ];

  const exportToExcel = () => {
    const orderedData = filteredTransactions.map((tx) => ({
      id: tx.id || "",
      account: tx.account,
      date: formatDateToDDMMYYYY(new Date(tx.date)), // Format date thành dd/mm/yyyy
      channel: tx.channel,
      type: tx.type,
      member: tx.member,
      // timestamp: tx.timestamp || "N/A",
      description: tx.description,
      category: tx.category,
      purpose: tx.purpose,
      amount: tx.amount,
    }));
    const worksheet = XLSX.utils.json_to_sheet(orderedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "GiaoDich");
    XLSX.writeFile(workbook, "bao_cao_giao_dich.xlsx");
  };

  const renderPieChart = (
    title: string,
    data: { name: string; value: number }[]
  ) => {
    if (data.length === 0) {
      return (
        <p className="text-gray-600 mb-4">Không có dữ liệu cho {title}.</p>
      );
    }
    return (
      <div className="flex justify-center">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
              }
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg mt-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        Báo Cáo Chi Tiêu
      </h2>
      <p className="text-gray-600 mb-6">
        Phân tích chi tiêu theo danh mục, thành viên, và thời gian.
      </p>

      <div className="mb-6 flex space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Từ ngày
          </label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            className="p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Đến ngày
          </label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate ?? undefined}
            className="p-2 border rounded-md"
          />
        </div>
        <button
          onClick={exportToExcel}
          className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Xuất Excel
        </button>
      </div>

      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Chi theo Danh mục Sinh hoạt
        </h3>
        {renderPieChart("Chi Sinh hoạt", dataSinhHoat)}
      </div>

      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Chi theo Danh mục Kinh doanh
        </h3>
        {renderPieChart("Chi Kinh doanh", dataKinhDoanh)}
      </div>

      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Chi theo Danh mục Khác
        </h3>
        {renderPieChart("Chi Khác", dataKhac)}
      </div>

      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Chi theo Thành viên
        </h3>
        {renderPieChart("Chi theo Thành viên", dataByMember)}
      </div>
    </div>
  );
};

export default ReportsPage;
