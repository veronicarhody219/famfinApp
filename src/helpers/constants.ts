// src/helpers/constants.ts

import { type KeywordMapping } from "../types";

export const TRANSACTION_TYPES = ["Chi", "Thu"];
export const ACCOUNTS = ["Tiền mặt", "Tài khoản ngân hàng", "Thẻ tín dụng"];
export const PURPOSES = [
  "Ăn uống",
  "Mua sắm",
  "Hóa đơn",
  "Giải trí",
  "Sức khỏe",
  "Kinh doanh",
  "Khác",
];
export const MEMBERS = ["Chồng", "Vợ", "Con", "Khác"];
export const CHANNELS = [
  "Siêu thị",
  "Chợ",
  "Online",
  "Cửa hàng",
  "Rút tiền",
  "Chuyển khoản",
  "Lãi ngân hàng",
  "Khác",
];
export const CATEGORIES_BY_PURPOSE: { [key: string]: string[] } = {
  "Ăn uống": ["Đi chợ", "Nhà hàng", "Cafe", "Đồ ăn vặt"],
  "Mua sắm": ["Quần áo", "Gia dụng", "Điện tử", "Mỹ phẩm", "Thanh toán Online"],
  "Hóa đơn": ["Điện", "Nước", "Internet", "Điện thoại", "Phí thẻ"],
  "Giải trí": ["Xem phim", "Du lịch", "Thể thao", "Game"],
  "Sức khỏe": ["Thuốc men", "Khám bệnh", "Tập gym"],
  "Kinh doanh": [
    "Bán vật tư",
    "Bảo dưỡng, sửa chữa máy",
    "Bán máy",
    "Vật tư",
    "Văn phòng phẩm",
    "Vận chuyển",
  ],
  Khác: [
    "Phát sinh",
    "Lãi ngân hàng",
    "Tiền lương",
    "Chuyển khoản nội bộ",
    "Rút tiền",
    "ATM",
  ],
};

// src/helpers/constants.ts (thêm ở cuối)
export const PURPOSE_GROUPS = {
  "Sinh hoat": ["Ăn uống", "Mua sắm", "Hóa đơn", "Giải trí", "Sức khỏe"],
  "Kinh doanh": ["Kinh doanh"],
  Khac: ["Khác"],
};

export const KEYWORD_MAP: KeywordMapping = {
  // Ăn uống
  starbucks: { purpose: "Ăn uống", category: "Cafe" },
  highlands: { purpose: "Ăn uống", category: "Cafe" },
  phở: { purpose: "Ăn uống", category: "Nhà hàng" },
  "the coffee house": { purpose: "Ăn uống", category: "Cafe" },
  "go market": { purpose: "Ăn uống", category: "Đi chợ" },
  foody: { purpose: "Ăn uống", category: "Nhà hàng" },
  "thit bo": { purpose: "Ăn uống", category: "Đi chợ" },
  com: { purpose: "Ăn uống", category: "Nhà hàng" },
  rau: { purpose: "Ăn uống", category: "Đi chợ" },
  vit: { purpose: "Ăn uống", category: "Đi chợ" },
  "cua hang": { purpose: "Ăn uống", category: "Đi chợ" },
  chợ: { purpose: "Ăn uống", category: "Đi chợ" },

  // Mua sắm
  shopee: { purpose: "Mua sắm", category: "Online" },
  lazada: { purpose: "Mua sắm", category: "Online" },
  amazon: { purpose: "Mua sắm", category: "Online" },
  "dien may xanh": { purpose: "Mua sắm", category: "Điện tử" },
  "the gioi di dong": { purpose: "Mua sắm", category: "Điện tử" },
  "thanh toan": { purpose: "Mua sắm", category: "Thanh toán Online" },
  "e-commerce": { purpose: "Mua sắm", category: "Online" },
  "mua hang": { purpose: "Mua sắm", category: "Cửa hàng" },
  "mua sắm": { purpose: "Mua sắm", category: "Cửa hàng" },

  // Hóa đơn
  "dien luc": { purpose: "Hóa đơn", category: "Điện" },
  "tiền điện": { purpose: "Hóa đơn", category: "Điện" },
  "tien nuoc": { purpose: "Hóa đơn", category: "Nước" },
  internet: { purpose: "Hóa đơn", category: "Internet" },
  "phi thuong nien": { purpose: "Hóa đơn", category: "Phí thẻ" },
  topup: { purpose: "Hóa đơn", category: "Điện thoại", member: "Chồng" },

  // Kinh doanh
  "cuoc xe": { purpose: "Kinh doanh", category: "Vận chuyển" },
  "sua may phat dien": {
    purpose: "Kinh doanh",
    category: "Bảo dưỡng, sửa chữa máy",
  },
  "cuoc xe cau": { purpose: "Kinh doanh", category: "Vận chuyển" },
  "day lat": { purpose: "Kinh doanh", category: "Vật tư" },

  // Khác
  "chuyen tien den": { purpose: "Khác", category: "Chuyển khoản nội bộ" },
  "lãi tiền gửi": { purpose: "Khác", category: "Lãi ngân hàng" },
  "tien luong": { purpose: "Khác", category: "Tiền lương" },
  "rut tien": { purpose: "Khác", category: "Rút tiền" },
  atm: { purpose: "Khác", category: "ATM" },
  "nguyen hong viet": { purpose: "Khác", category: "Tiền lương", member: "Vợ" },
  "duong hue huong": {
    purpose: "Khác",
    category: "Chuyển khoản nội bộ",
    member: "Vợ",
  },
  "pham thi linh": { purpose: "Khác", category: "Tiền lương", member: "Chồng" },
  "nguyen trung kien": {
    purpose: "Khác",
    category: "Tiền lương",
    member: "Chồng",
  },
  "pham van tuan": {
    purpose: "Khác",
    category: "Chuyển khoản nội bộ",
    member: "Chồng",
  },
};
