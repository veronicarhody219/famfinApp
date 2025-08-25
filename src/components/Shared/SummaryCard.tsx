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
