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
/**
 * Định dạng đối tượng Date thành chuỗi 'dd/mm/yyyy'.
 * @param {Date} date Đối tượng Date cần định dạng.
 * @returns {string} Chuỗi ngày đã được định dạng.
 */
export const formatDateToDDMMYYYY = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// src/helpers/formatters.ts (thêm hàm này)
export const normalizeString = (str: string): string => {
  return str
    .normalize("NFD") // Phân tách dấu
    .replace(/[\u0300-\u036f]/g, "") // Xóa dấu
    .toLowerCase(); // Chuyển thường để matching case-insensitive
};
