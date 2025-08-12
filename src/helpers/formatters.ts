// src/helpers/formatters.ts

/**
 * Định dạng số thành chuỗi tiền tệ với dấu phân cách hàng nghìn.
 * Ví dụ: 1000000 -> 1.000.000 VND
 * @param {number} amount Số tiền cần định dạng.
 * @returns {string} Chuỗi tiền tệ đã được định dạng.
 */
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  });
};
