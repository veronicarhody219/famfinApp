// // src/components/SummaryCard.tsx
// import React from "react";
// import { formatCurrency } from "../../helpers/formatters";

// interface SummaryCardProps {
//   title: string;
//   amount: number;
//   color: "green" | "red" | "blue" | "orange";
// }

// const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, color }) => {
//   const colorClasses = {
//     green: "bg-green-100 text-green-700",
//     red: "bg-red-100 text-red-700",
//     blue: "bg-blue-100 text-blue-700",
//     orange: "bg-orange-100 text-orange-700",
//   };

//   const amountColorClasses = {
//     green: "text-green-800",
//     red: "text-red-800",
//     blue: "text-blue-800",
//     orange: "text-orange-800",
//   };

//   return (
//     <div className={`p-4 rounded-xl ${colorClasses[color]}`}>
//       <p className="text-sm">{title}</p>
//       <p className={`text-2xl font-bold ${amountColorClasses[color]}`}>
//         {formatCurrency(amount)}
//       </p>
//     </div>
//   );
// };

// export default SummaryCard;

import React from "react";

interface SummaryCardProps {
  title: string;
  value: string;
  color: string; // Accept hex color codes
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, color }) => {
  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "8px",
        backgroundColor: `${color}22`, // Add transparency to background
        color: `${color}cc`, // Slightly transparent text color
      }}
    >
      <p style={{ fontSize: "14px" }}>{title}</p>
      <p style={{ fontSize: "24px", fontWeight: "bold", color }}>{value}</p>
    </div>
  );
};

export default SummaryCard;
