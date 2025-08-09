// src/components/Header.tsx
import React from "react";

const Header: React.FC = () => {
  return (
    <header className="bg-indigo-600 text-white p-4 shadow-lg mb-8 rounded-lg">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản Lý Chi Tiêu</h1>
        <nav>
          {/* Bạn có thể thêm các nút điều hướng khác ở đây */}
          <ul className="flex space-x-4">
            {/* <li><a href="#" className="hover:underline">Trang chủ</a></li>
            <li><a href="#" className="hover:underline">Báo cáo</a></li> */}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
