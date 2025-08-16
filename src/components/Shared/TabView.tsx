import React from "react";
import {
  HomeIcon,
  ChartBarIcon,
  PlusIcon,
  ListBulletIcon,
} from "@heroicons/react/24/solid";

interface TabViewProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabView: React.FC<TabViewProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-center items-center">
        <div className="flex space-x-2">
          <TabButton
            icon={<HomeIcon className="w-6 h-6" />}
            label="Tổng quan"
            tabId="dashboard"
            activeTab={activeTab}
            onClick={() => setActiveTab("dashboard")}
          />
          <TabButton
            icon={<ChartBarIcon className="w-6 h-6" />}
            label="Biểu đồ"
            tabId="reports"
            activeTab={activeTab}
            onClick={() => setActiveTab("reports")}
          />
          <TabButton
            icon={<ListBulletIcon className="w-6 h-6" />}
            label="Giao dịch"
            tabId="transactions"
            activeTab={activeTab}
            onClick={() => setActiveTab("transactions")}
          />
          {/* Bạn có thể thêm nút "Thêm GD" riêng nếu muốn */}
        </div>
      </div>
    </nav>
  );
};

interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  tabId: string;
  activeTab: string;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({
  icon,
  label,
  tabId,
  activeTab,
  onClick,
}) => {
  const isActive = activeTab === tabId;
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-2 rounded-xl transition-colors duration-200 ${
        isActive
          ? "bg-indigo-600 text-white shadow-lg"
          : "text-gray-600 hover:bg-gray-200"
      }`}
    >
      {icon}
      <span className="ml-2 font-medium hidden md:block">{label}</span>
    </button>
  );
};

export default TabView;
