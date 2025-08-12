// // src/components/AddTransactionForm.tsx
// import React, { useState, useEffect } from "react";
// import type { ChangeEvent } from "react";
// import {
//   collection,
//   addDoc,
//   serverTimestamp,
//   onSnapshot,
//   query,
// } from "firebase/firestore";
// import { db, appId, auth } from "../firebase/config";
// import Dashboard from "./Dashboard";
// import TransactionList from "./TransactionList";

// // Giao diện dữ liệu cho một giao dịch
// interface Transaction {
//   id?: string;
//   amount: number;
//   type: "Thu" | "Chi";
//   description: string;
//   date: string;
//   account: string;
//   purpose: string;
//   category: string;
//   member: string;
//   channel: string;
// }

// // Định nghĩa một kiểu dữ liệu chung cho các phần tử form
// type FormElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

// // --- Dữ liệu tĩnh cho dropdowns và datalists ---
// const transactionTypes = ["Chi", "Thu"];
// const accounts = ["Tiền mặt", "Tài khoản ngân hàng", "Thẻ tín dụng"];
// const purposes = [
//   "Ăn uống",
//   "Mua sắm",
//   "Hóa đơn",
//   "Giải trí",
//   "Sức khỏe",
//   "Kinh doanh",
//   "Khác",
// ];
// const members = ["Chồng", "Vợ", "Con", "Khác"];
// const channels = [
//   "Siêu thị",
//   "Chợ",
//   "Online",
//   "Cửa hàng",
//   "Rút tiền",
//   "Chuyển khoản",
//   "Lãi ngân hàng",
//   "Khác",
// ];
// const categoriesByPurpose: { [key: string]: string[] } = {
//   "Ăn uống": ["Đi chợ", "Nhà hàng", "Cafe", "Đồ ăn vặt"],
//   "Mua sắm": ["Quần áo", "Gia dụng", "Điện tử", "Mỹ phẩm", "Thanh toán Online"],
//   "Hóa đơn": ["Điện", "Nước", "Internet", "Điện thoại", "Phí thẻ"],
//   "Giải trí": ["Xem phim", "Du lịch", "Thể thao", "Game"],
//   "Sức khỏe": ["Thuốc men", "Khám bệnh", "Tập gym"],
//   "Kinh doanh": [
//     "Bán vật tư",
//     "Bảo dưỡng, sửa chữa máy",
//     "Bán máy",
//     "Vật tư",
//     "Văn phòng phẩm",
//     "Vận chuyển",
//   ],
//   Khác: [
//     "Phát sinh",
//     "Lãi ngân hàng",
//     "Tiền lương",
//     "Chuyển khoản nội bộ",
//     "Rút tiền",
//     "ATM",
//   ],
// };

// // Kiểu dữ liệu mới cho keywordMap để khắc phục lỗi TS7053
// interface KeywordMapping {
//   [key: string]: { purpose: string; category: string; member?: string };
// }

// // Bản đồ từ khóa cho việc phân loại tự động thông minh
// const keywordMap: KeywordMapping = {
//   // Ăn uống
//   starbucks: { purpose: "Ăn uống", category: "Cafe" },
//   highlands: { purpose: "Ăn uống", category: "Cafe" },
//   phở: { purpose: "Ăn uống", category: "Nhà hàng" },
//   "the coffee house": { purpose: "Ăn uống", category: "Cafe" },
//   "go market": { purpose: "Ăn uống", category: "Đi chợ" },
//   foody: { purpose: "Ăn uống", category: "Nhà hàng" },
//   "thit bo": { purpose: "Ăn uống", category: "Đi chợ" },
//   com: { purpose: "Ăn uống", category: "Nhà hàng" },
//   rau: { purpose: "Ăn uống", category: "Đi chợ" },
//   vit: { purpose: "Ăn uống", category: "Đi chợ" },
//   "cua hang": { purpose: "Ăn uống", category: "Đi chợ" },
//   chợ: { purpose: "Ăn uống", category: "Đi chợ" },

//   // Mua sắm
//   shopee: { purpose: "Mua sắm", category: "Online" },
//   lazada: { purpose: "Mua sắm", category: "Online" },
//   amazon: { purpose: "Mua sắm", category: "Online" },
//   "dien may xanh": { purpose: "Mua sắm", category: "Điện tử" },
//   "the gioi di dong": { purpose: "Mua sắm", category: "Điện tử" },
//   "thanh toan": { purpose: "Mua sắm", category: "Thanh toán Online" },
//   "e-commerce": { purpose: "Mua sắm", category: "Online" },
//   "mua hang": { purpose: "Mua sắm", category: "Cửa hàng" },
//   "mua sắm": { purpose: "Mua sắm", category: "Cửa hàng" },

//   // Hóa đơn
//   "dien luc": { purpose: "Hóa đơn", category: "Điện" },
//   "tiền điện": { purpose: "Hóa đơn", category: "Điện" },
//   "tien nuoc": { purpose: "Hóa đơn", category: "Nước" },
//   internet: { purpose: "Hóa đơn", category: "Internet" },
//   "phi thuong nien": { purpose: "Hóa đơn", category: "Phí thẻ" },
//   topup: { purpose: "Hóa đơn", category: "Điện thoại", member: "Chồng" },

//   // Kinh doanh
//   "cuoc xe": { purpose: "Kinh doanh", category: "Vận chuyển" },
//   "sua may phat dien": {
//     purpose: "Kinh doanh",
//     category: "Bảo dưỡng, sửa chữa máy",
//   },
//   "cuoc xe cau": { purpose: "Kinh doanh", category: "Vận chuyển" },
//   "day lat": { purpose: "Kinh doanh", category: "Vật tư" },

//   // Khác
//   "chuyen tien den": { purpose: "Khác", category: "Chuyển khoản nội bộ" },
//   "lãi tiền gửi": { purpose: "Khác", category: "Lãi ngân hàng" },
//   "tien luong": { purpose: "Khác", category: "Tiền lương" },
//   "rut tien": { purpose: "Khác", category: "Rút tiền" },
//   atm: { purpose: "Khác", category: "ATM" },
//   "nguyen hong viet": { purpose: "Khác", category: "Tiền lương", member: "Vợ" },
//   "duong hue huong": {
//     purpose: "Khác",
//     category: "Chuyển khoản nội bộ",
//     member: "Vợ",
//   },
//   "pham thi linh": { purpose: "Khác", category: "Tiền lương", member: "Chồng" },
//   "nguyen trung kien": {
//     purpose: "Khác",
//     category: "Tiền lương",
//     member: "Chồng",
//   },
//   "pham van tuan": {
//     purpose: "Khác",
//     category: "Chuyển khoản nội bộ",
//     member: "Chồng",
//   },
// };

// const AddTransactionForm: React.FC = () => {
//   // --- STATE ---
//   const [userId, setUserId] = useState<string | null>(null);
//   const [formData, setFormData] = useState<
//     Omit<Transaction, "date" | "category" | "channel"> & {
//       date: string;
//       category: string;
//       channel: string;
//     }
//   >({
//     amount: 0,
//     type: "Chi",
//     description: "",
//     date: new Date().toISOString().slice(0, 10),
//     account: accounts[0],
//     purpose: "Ăn uống",
//     category: categoriesByPurpose["Ăn uống"][0],
//     member: "Chồng",
//     channel: channels[0],
//   });

//   const [smsContent, setSmsContent] = useState("");
//   const [transactionsToReview, setTransactionsToReview] = useState<
//     Transaction[]
//   >([]);
//   const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [message, setMessage] = useState("");
//   const [messageTimeout, setMessageTimeout] = useState<NodeJS.Timeout | null>(
//     null
//   );

//   // --- EFFECT: Lắng nghe trạng thái xác thực người dùng ---
//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       if (user) {
//         setUserId(user.uid);
//       } else {
//         setUserId(null);
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   // --- EFFECT: Cập nhật danh sách categories khi purpose thay đổi ---
//   useEffect(() => {
//     if (formData.purpose && categoriesByPurpose[formData.purpose]) {
//       setFormData((prevData) => ({
//         ...prevData,
//         category: categoriesByPurpose[formData.purpose][0],
//       }));
//     } else {
//       setFormData((prevData) => ({ ...prevData, category: "" }));
//     }
//   }, [formData.purpose]);

//   // --- EFFECT: Lắng nghe thay đổi trên Firestore để hiển thị các giao dịch đã có ---
//   useEffect(() => {
//     if (!userId) {
//       setLoading(false);
//       return;
//     }

//     const transactionsQuery = query(
//       collection(db, `artifacts/${appId}/users/${userId}/transactions`)
//     );

//     const unsubscribe = onSnapshot(
//       transactionsQuery,
//       (snapshot) => {
//         const fetchedTransactions: Transaction[] = [];
//         snapshot.forEach((doc) => {
//           const data = doc.data() as Omit<Transaction, "date"> & {
//             date: { toDate: () => Date };
//           };
//           const transactionDate = data.date.toDate().toISOString().slice(0, 10);
//           fetchedTransactions.push({
//             id: doc.id,
//             ...data,
//             date: transactionDate,
//           });
//         });
//         fetchedTransactions.sort(
//           (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
//         );
//         setAllTransactions(fetchedTransactions);
//         setLoading(false);
//       },
//       (error) => {
//         console.error("Lỗi khi fetch giao dịch: ", error);
//         setLoading(false);
//       }
//     );

//     return () => unsubscribe();
//   }, [userId]);

//   // --- Hàm hiển thị thông báo và tự động ẩn sau 3 giây ---
//   const showMessage = (msg: string) => {
//     if (messageTimeout) {
//       clearTimeout(messageTimeout);
//     }
//     setMessage(msg);
//     setMessageTimeout(
//       setTimeout(() => {
//         setMessage("");
//       }, 3000)
//     );
//   };

//   // --- HÀM PHÂN TÍCH SMS (ĐÃ ĐƯỢC CẢI TIẾN) ---

//   /**
//    * Phân tích nội dung SMS của Vietcombank
//    * @param smsText Nội dung tin nhắn
//    * @returns Mảng các giao dịch đã parse hoặc null nếu không khớp
//    */

//   const parseVcbSms = (smsText: string): Transaction[] | null => {
//     // Regex mạnh mẽ hơn để tách toàn bộ từng giao dịch
//     // Nó khớp từ "SD TK 1014456312" đến hết nội dung giao dịch,
//     // nhưng không bao gồm "SD TK 1014456312" tiếp theo hoặc cuối chuỗi.
//     const regex =
//       /SD TK 1014456312 ([-+])([\d,]+)VND luc (\d{2}-\d{2}-\d{4}) (\d{2}:\d{2}:\d{2})\.?\s*(.*?)(?=SD TK 1014456312|$)/gs;
//     const transactions: Transaction[] = [];

//     // Sử dụng matchAll để tìm tất cả các lần khớp
//     const matches = [...smsText.matchAll(regex)];

//     if (matches.length === 0) {
//       return null;
//     }

//     for (const match of matches) {
//       const type = match[1] === "+" ? "Thu" : "Chi";
//       const amount = parseFloat(match[2].replace(/,/g, ""));
//       const dateStr = match[3];
//       const [day, month, year] = dateStr.split("-");
//       const date = `${year}-${month}-${day}`;

//       // Toàn bộ nội dung nằm giữa thời gian và giao dịch tiếp theo
//       const descriptionBlock = match[5].trim();

//       // === Logic làm sạch mô tả mới, tập trung vào việc tìm phần nội dung ý nghĩa ===
//       let cleanedDescription = "";

//       // Regex kết hợp nhiều trường hợp để tìm mô tả giao dịch cụ thể
//       // 1. Trường hợp "chuyen tien" có thể kèm theo nội dung khác
//       // 2. Trường hợp "Thanh toan cho" từ QR Pay
//       // 3. Trường hợp "TOPUP Viettel"
//       // 4. Trường hợp các mô tả đơn giản ở cuối, như "sua may phat dien" hoặc "Vietcombank:..."
//       const descriptionRegex =
//         /(?:Ref .*?\.|Ref .*?\.QR - )?([^.]*?chuyen tien[^.]*?)(?:\.CT tu|\sSD TK|$)|(Thanh toan cho.*?tu tai khoan)(?=\sSD TK|$)|(TOPUP Viettel.*?)(?:\sSD TK|$)|([^.]*?)(?:\.CT tu|\sSD TK|$)|\.Vietcombank:1014456312:(.*)$/;

//       const descriptionMatch = descriptionBlock.match(descriptionRegex);

//       if (descriptionMatch) {
//         // Kiểm tra các nhóm bắt và lấy mô tả phù hợp
//         if (descriptionMatch[1]) {
//           cleanedDescription = descriptionMatch[1].trim();
//         } else if (descriptionMatch[2]) {
//           cleanedDescription = descriptionMatch[2].trim();
//         } else if (descriptionMatch[3]) {
//           cleanedDescription = descriptionMatch[3].trim();
//         } else if (descriptionMatch[5]) {
//           // Lấy mô tả sau "Vietcombank:..."
//           cleanedDescription = descriptionMatch[5].trim();
//         } else if (descriptionMatch[4]) {
//           // Trường hợp mô tả đơn giản ở cuối (như sua may phat dien)
//           cleanedDescription = descriptionMatch[4].trim();
//         }
//       }

//       // Fallback nếu không tìm thấy mô tả
//       if (!cleanedDescription) {
//         cleanedDescription = "Giao dịch không rõ";
//       }

//       // Giả định các hàm này được định nghĩa ở đâu đó
//       const { purpose, category, member } = getSmartCategory(
//         cleanedDescription,
//         type,
//         amount
//       );
//       const channel = getSmartChannel(cleanedDescription);

//       transactions.push({
//         amount,
//         type,
//         description: cleanedDescription,
//         date,

//         account: "Tài khoản ngân hàng",
//         purpose,
//         category,
//         member: member || "chồng",
//         channel,
//       });
//     }

//     return transactions.length > 0 ? transactions : null;
//   };

//   /**
//    * Phân tích nội dung SMS của Vietinbank
//    * @param smsText Nội dung tin nhắn
//    * @returns Mảng các giao dịch đã parse hoặc null nếu không khớp
//    */
//   const parseVtbSms = (smsText: string): Transaction[] | null => {
//     const regex =
//       /VietinBank:(\d{2}\/\d{2}\/\d{4}).*?GD:([+-])([\d,]+)VND.*?ND:(.*?)(~|$)/g;
//     const transactions: Transaction[] = [];
//     let match;

//     while ((match = regex.exec(smsText)) !== null) {
//       const dateStr = match[1];
//       const [day, month, year] = dateStr.split("/");
//       const date = `${year}-${month}-${day}`;
//       const type = match[2] === "+" ? "Thu" : "Chi";
//       const amount = parseFloat(match[3].replace(/,/g, ""));
//       const description = match[4].trim();

//       const { purpose, category, member } = getSmartCategory(
//         description,
//         type,
//         amount
//       );
//       const channel = getSmartChannel(description);

//       transactions.push({
//         amount,
//         type,
//         description,
//         date,
//         account: "Tài khoản ngân hàng",
//         purpose,
//         category,
//         member: member || "Chồng",
//         channel,
//       });
//     }
//     return transactions.length > 0 ? transactions : null;
//   };

//   /**
//    * Phân tích nội dung SMS của BIDV
//    * @param smsText Nội dung tin nhắn
//    * @returns Mảng các giao dịch đã parse hoặc null nếu không khớp
//    */

//   const parseBidvSms = (smsText: string): Transaction[] | null => {
//     const lines: string[] = smsText.split("\n");
//     const transactions: Transaction[] = [];

//     // Biểu thức chính quy mạnh mẽ để khớp với các định dạng tin nhắn của BIDV.
//     // Nó bắt đầu với 'tai BIDV', dấu +/- và số tiền, ngày tháng, và sau đó là toàn bộ nội dung (ND).
//     const regex =
//       /tai BIDV\s*([+-])([\d,]+)VND(?:.*?)vao\s*(\d{2}:\d{2})\s*(\d{2}\/\d{2}\/\d{2,4}).*ND:\s*([\s\S]+)/;

//     lines.forEach((line: string) => {
//       if (line.trim() === "") return;

//       const match = line.match(regex);
//       if (match) {
//         const type: "Thu" | "Chi" = match[1] === "+" ? "Thu" : "Chi";
//         const amount: number = parseFloat(match[2].replace(/,/g, ""));
//         const dateStr: string = match[4];
//         const [day, month, year] = dateStr.split("/");
//         // Sửa lỗi định dạng năm để tương thích với Date()
//         const fullYear: string = year.length === 2 ? `20${year}` : year;
//         const date: string = `${fullYear}-${month}-${day}`;

//         let rawDescription: string = match[5].trim();

//         // --- Logic làm sạch mô tả tổng quát và mạnh mẽ hơn ---
//         // Xóa các cụm từ không cần thiết để mô tả được gọn gàng.
//         const patternsToRemove = [
//           /So du:[\d,.]+VND;?/,
//           /MB-TKThe :[\d,]+, tai (Techcombank|Vietcombank)./,
//           /O@L_.*-BIDV D/,
//           /TKThe :[\d,]+, tai TCB./,
//           /RE M Tfr Ac:/, // Xóa chi tiết ZaloPay
//           /FT\d+/, // Xóa mã giao dịch FT
//         ];

//         let cleanedDescription = rawDescription;
//         patternsToRemove.forEach((pattern) => {
//           cleanedDescription = cleanedDescription.replace(pattern, "").trim();
//         });

//         // === Logic phân loại thông minh (có thể mở rộng) ===
//         // Thay vì hardcode, chúng ta sử dụng các hàm để phân loại dựa trên mô tả đã làm sạch.
//         // Đây là nơi bạn có thể tùy chỉnh logic phân loại của riêng mình.
//         const { purpose, category, member } = getSmartCategory(
//           cleanedDescription,
//           type,
//           amount
//         );
//         const channel = getSmartChannel(cleanedDescription);

//         transactions.push({
//           amount,
//           type,
//           description: cleanedDescription,
//           date,
//           account: "Tài khoản BIDV",
//           purpose,
//           category,
//           member: member || "chồng",
//           channel,
//         });
//       }
//     });

//     return transactions.length > 0 ? transactions : null;
//   };

//   /**
//    * Phân tích nội dung SMS của MB Bank
//    * @param smsText Nội dung tin nhắn
//    * @returns Mảng các giao dịch đã parse hoặc null nếu không khớp
//    */
//   const parseMbSms = (smsText: string): Transaction[] | null => {
//     const regex =
//       /BIEN DONG SO DU\s*TK \d+:\s*([+-])(\d+).*?\s*luc\s*(\d{2}:\d{2})\s*ngay\s*(\d{2}\/\d{2}\/\d{4}).*?Noi dung: (.*?)$/g;
//     const transactions: Transaction[] = [];
//     let match;

//     while ((match = regex.exec(smsText)) !== null) {
//       const type = match[1] === "+" ? "Thu" : "Chi";
//       const amount = parseFloat(match[2].replace(/,/g, ""));
//       const dateStr = match[4];
//       const [day, month, year] = dateStr.split("/");
//       const fullYear = year.length === 2 ? `20${year}` : year;
//       const date = `${fullYear}-${month}-${day}`;
//       const description = match[5].trim();

//       const { purpose, category, member } = getSmartCategory(
//         description,
//         type,
//         amount
//       );
//       const channel = getSmartChannel(description);

//       transactions.push({
//         amount,
//         type,
//         description,
//         date,
//         account: "Tài khoản ngân hàng",
//         purpose,
//         category,
//         member: member || "Chồng",
//         channel,
//       });
//     }
//     return transactions.length > 0 ? transactions : null;
//   };

//   // Hàm chính để phân tích SMS, sử dụng các parser riêng lẻ
//   const getSmartCategory = (
//     description: string,
//     type: "Thu" | "Chi",
//     amount: number
//   ) => {
//     const lowerDesc = description.toLowerCase();

//     for (const keyword in keywordMap) {
//       if (lowerDesc.includes(keyword)) {
//         const { purpose, category, member } = keywordMap[keyword];
//         return { purpose, category, member };
//       }
//     }

//     if (type === "Thu") {
//       // Phân loại cho giao dịch Thu theo các ngưỡng số tiền
//       if (amount < 3000000) {
//         return {
//           purpose: "Kinh doanh",
//           category: "Bán vật tư",
//           member: "Chồng",
//         };
//       } else if (amount < 10000000) {
//         return {
//           purpose: "Kinh doanh",
//           category: "Bảo dưỡng, sửa chữa máy",
//           member: "Chồng",
//         };
//       } else {
//         return { purpose: "Kinh doanh", category: "Bán máy", member: "Chồng" };
//       }
//     } else {
//       // type === "Chi"
//       // Phân loại cho giao dịch Chi theo các ngưỡng số tiền
//       if (amount < 400000) {
//         return { purpose: "Ăn uống", category: "Đồ ăn vặt", member: "Chồng" };
//       } else {
//         return { purpose: "Kinh doanh", category: "Vật tư", member: "Chồng" };
//       }
//     }
//   };

//   // Hàm phân tích kênh giao dịch
//   const getSmartChannel = (description: string) => {
//     const lowerDesc = description.toLowerCase();

//     if (
//       lowerDesc.includes("thanh toan") ||
//       lowerDesc.includes("shopee") ||
//       lowerDesc.includes("lazada") ||
//       lowerDesc.includes("shopeepay") ||
//       lowerDesc.includes("qr pay")
//     ) {
//       return "Online";
//     } else if (lowerDesc.includes("rut tien") || lowerDesc.includes("atm")) {
//       return "Rút tiền";
//     } else if (
//       lowerDesc.includes("chợ") ||
//       lowerDesc.includes("sieuthi") ||
//       lowerDesc.includes("go market")
//     ) {
//       return "Siêu thị";
//     } else if (lowerDesc.includes("phi thuong nien")) {
//       return "Phí thẻ";
//     } else {
//       return "Chuyển khoản";
//     }
//   };

//   const parseSms = (smsText: string): Transaction[] => {
//     let allTransactions: Transaction[] = [];

//     const parsers = [parseVcbSms, parseVtbSms, parseBidvSms, parseMbSms];

//     for (const parser of parsers) {
//       const results = parser(smsText);
//       if (results) {
//         allTransactions.push(...results);
//       }
//     }

//     // Sắp xếp các giao dịch theo thứ tự thời gian giảm dần
//     allTransactions.sort(
//       (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
//     );

//     return allTransactions;
//   };

//   // --- Lắng nghe thay đổi của smsContent và cập nhật danh sách review ---
//   useEffect(() => {
//     if (smsContent.trim() !== "") {
//       const parsed = parseSms(smsContent);
//       setTransactionsToReview(parsed);
//     } else {
//       setTransactionsToReview([]);
//     }
//   }, [smsContent]);

//   // --- Cập nhật form thủ công ---
//   const handleChange = (e: ChangeEvent<FormElement>) => {
//     const { name, value } = e.target;
//     if (name === "smsContent") {
//       setSmsContent(value);
//     } else {
//       setFormData((prevData) => ({
//         ...prevData,
//         [name]: name === "amount" ? Number(value) : value,
//       }));
//     }
//   };

//   // --- Cập nhật từng giao dịch trong danh sách review ---
//   const handleReviewChange = (index: number, e: ChangeEvent<FormElement>) => {
//     const { name, value } = e.target;
//     const newTransactions = [...transactionsToReview];
//     newTransactions[index] = {
//       ...newTransactions[index],
//       [name]: name === "amount" ? Number(value) : value,
//     };
//     if (name === "purpose" && categoriesByPurpose[value]) {
//       newTransactions[index].category = categoriesByPurpose[value][0];
//     }
//     setTransactionsToReview(newTransactions);
//   };

//   const handleClearSms = () => {
//     setSmsContent("");
//     setTransactionsToReview([]);
//   };

//   const handleDeleteReviewItem = (index: number) => {
//     const newTransactions = transactionsToReview.filter((_, i) => i !== index);
//     setTransactionsToReview(newTransactions);
//   };

//   // --- LOGIC GỬI DỮ LIỆU ---
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     if (!userId) {
//       showMessage("Lỗi: Không tìm thấy ID người dùng. Vui lòng thử lại.");
//       setLoading(false);
//       return;
//     }

//     try {
//       const transactionsCollectionRef = collection(
//         db,
//         `artifacts/${appId}/users/${userId}/transactions`
//       );

//       if (transactionsToReview.length > 0) {
//         await Promise.all(
//           transactionsToReview.map((transaction) =>
//             addDoc(transactionsCollectionRef, {
//               ...transaction,
//               date: new Date(transaction.date),
//               timestamp: serverTimestamp(),
//             })
//           )
//         );
//         showMessage("Tất cả giao dịch đã được thêm thành công!");
//         handleClearSms();
//       } else {
//         await addDoc(transactionsCollectionRef, {
//           ...formData,
//           date: new Date(formData.date),
//           timestamp: serverTimestamp(),
//         });
//         showMessage("Giao dịch đã được thêm thành công!");
//         setFormData((prevData) => ({
//           ...prevData,
//           amount: 0,
//           description: "",
//           date: new Date().toISOString().slice(0, 10),
//           category: categoriesByPurpose[prevData.purpose][0] || "",
//         }));
//       }
//     } catch (error) {
//       console.error("Lỗi khi thêm/cập nhật giao dịch: ", error);
//       showMessage(
//         "Lỗi: Không thể thêm/cập nhật giao dịch. Vui lòng kiểm tra console."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-lg max-w-7xl mx-auto font-sans text-slate-800">
//       {message && (
//         <div className="fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-md transition-opacity duration-300 bg-green-500 text-white">
//           {message}
//         </div>
//       )}

//       {/* Hiển thị thông báo tải */}
//       {loading && allTransactions.length === 0 && (
//         <div className="flex justify-center items-center h-48">
//           <p className="text-xl text-indigo-600 font-semibold">
//             Đang tải dữ liệu...
//           </p>
//         </div>
//       )}

//       {/* Ẩn Dashboard và Form khi đang tải */}
//       {!loading && (
//         <>
//           {/* Component Dashboard được hiển thị ở đây */}
//           <Dashboard transactions={allTransactions} />

//           <hr className="my-6 border-t border-slate-200" />

//           {/* Form nhập liệu */}
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <h3 className="text-2xl font-bold text-slate-700 border-b pb-2 mb-4">
//               Thêm Giao Dịch Mới
//             </h3>

//             {/* Trường nhập SMS */}
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">
//                 Dán SMS
//               </label>
//               <textarea
//                 name="smsContent"
//                 value={smsContent}
//                 onChange={handleChange}
//                 className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
//                 rows={3}
//                 placeholder="Dán nội dung tin nhắn ngân hàng vào đây..."
//               />
//               {smsContent.trim() && (
//                 <button
//                   type="button"
//                   onClick={handleClearSms}
//                   className="mt-2 text-sm text-red-600 hover:underline"
//                 >
//                   Xóa SMS
//                 </button>
//               )}
//             </div>

//             {/* HIỂN THỊ DANH SÁCH GIAO DỊCH ĐÃ PARSE */}
//             {transactionsToReview.length > 0 && (
//               <div className="bg-indigo-50 p-4 rounded-md space-y-4 max-h-96 overflow-y-auto">
//                 <h4 className="font-bold text-indigo-800">
//                   Xem Trước Giao Dịch ({transactionsToReview.length})
//                 </h4>
//                 <div className="overflow-x-auto rounded-md shadow-sm border border-indigo-200">
//                   <table className="min-w-full table-auto">
//                     <thead className="bg-white sticky top-0">
//                       <tr>
//                         <th className="p-3 text-left text-sm font-semibold text-slate-600">
//                           Ngày
//                         </th>
//                         <th className="p-3 text-left text-sm font-semibold text-slate-600">
//                           Loại
//                         </th>
//                         <th className="p-3 text-left text-sm font-semibold text-slate-600">
//                           Người thực hiện
//                         </th>
//                         <th className="p-3 text-left text-sm font-semibold text-slate-600">
//                           Tài khoản
//                         </th>
//                         <th className="p-3 text-left text-sm font-semibold text-slate-600">
//                           Số Tiền (VND)
//                         </th>
//                         <th className="p-3 text-left text-sm font-semibold text-slate-600">
//                           Nội dung
//                         </th>
//                         <th className="p-3 text-left text-sm font-semibold text-slate-600">
//                           Mục đích
//                         </th>
//                         <th className="p-3 text-left text-sm font-semibold text-slate-600">
//                           Danh mục
//                         </th>
//                         <th className="p-3 text-left text-sm font-semibold text-slate-600">
//                           Kênh
//                         </th>
//                         <th className="p-3 text-left text-sm font-semibold text-slate-600">
//                           Hành động
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-indigo-200">
//                       {transactionsToReview.map((tx, index) => (
//                         <tr key={index} className="bg-white">
//                           <td className="p-3 text-sm min-w-[120px]">
//                             <input
//                               type="date"
//                               name="date"
//                               value={tx.date}
//                               onChange={(e) => handleReviewChange(index, e)}
//                               className="w-full p-1 text-sm border rounded-md"
//                             />
//                           </td>
//                           <td className="p-3 text-sm min-w-[80px]">
//                             <select
//                               name="type"
//                               value={tx.type}
//                               onChange={(e) => handleReviewChange(index, e)}
//                               className="w-full p-1 text-sm border rounded-md"
//                             >
//                               {transactionTypes.map((type) => (
//                                 <option key={type} value={type}>
//                                   {type}
//                                 </option>
//                               ))}
//                             </select>
//                           </td>
//                           <td className="p-3 text-sm min-w-[120px]">
//                             <select
//                               name="member"
//                               value={tx.member}
//                               onChange={(e) => handleReviewChange(index, e)}
//                               className="w-full p-1 text-sm border rounded-md"
//                             >
//                               {members.map((member) => (
//                                 <option key={member} value={member}>
//                                   {member}
//                                 </option>
//                               ))}
//                             </select>
//                           </td>
//                           <td className="p-3 text-sm min-w-[150px]">
//                             <select
//                               name="account"
//                               value={tx.account}
//                               onChange={(e) => handleReviewChange(index, e)}
//                               className="w-full p-1 text-sm border rounded-md"
//                             >
//                               {accounts.map((account) => (
//                                 <option key={account} value={account}>
//                                   {account}
//                                 </option>
//                               ))}
//                             </select>
//                           </td>
//                           <td className="p-3 text-sm min-w-[120px]">
//                             <input
//                               type="number"
//                               name="amount"
//                               value={tx.amount}
//                               onChange={(e) => handleReviewChange(index, e)}
//                               className="w-full p-1 text-sm border rounded-md"
//                             />
//                           </td>
//                           <td className="p-3 text-sm min-w-[200px]">
//                             <textarea
//                               name="description"
//                               value={tx.description}
//                               onChange={(e) => handleReviewChange(index, e)}
//                               className="w-full p-1 text-sm border rounded-md"
//                               rows={1}
//                             />
//                           </td>
//                           <td className="p-3 text-sm min-w-[120px]">
//                             <select
//                               name="purpose"
//                               value={tx.purpose}
//                               onChange={(e) => handleReviewChange(index, e)}
//                               className="w-full p-1 text-sm border rounded-md"
//                             >
//                               {purposes.map((purpose) => (
//                                 <option key={purpose} value={purpose}>
//                                   {purpose}
//                                 </option>
//                               ))}
//                             </select>
//                           </td>
//                           <td className="p-3 text-sm min-w-[120px]">
//                             <select
//                               name="category"
//                               value={tx.category}
//                               onChange={(e) => handleReviewChange(index, e)}
//                               className="w-full p-1 text-sm border rounded-md"
//                             >
//                               {categoriesByPurpose[tx.purpose]?.map(
//                                 (category) => (
//                                   <option key={category} value={category}>
//                                     {category}
//                                   </option>
//                                 )
//                               )}
//                             </select>
//                           </td>
//                           <td className="p-3 text-sm min-w-[120px]">
//                             <select
//                               name="channel"
//                               value={tx.channel}
//                               onChange={(e) => handleReviewChange(index, e)}
//                               className="w-full p-1 text-sm border rounded-md"
//                             >
//                               {channels.map((channel) => (
//                                 <option key={channel} value={channel}>
//                                   {channel}
//                                 </option>
//                               ))}
//                             </select>
//                           </td>
//                           <td className="p-3 text-sm min-w-[80px]">
//                             <button
//                               type="button"
//                               onClick={() => handleDeleteReviewItem(index)}
//                               className="text-red-500 hover:underline"
//                             >
//                               Xóa
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}

//             {!smsContent.trim() && (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                 {/* Form nhập thủ công */}
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1">
//                     Ngày
//                   </label>
//                   <input
//                     type="date"
//                     name="date"
//                     value={formData.date}
//                     onChange={handleChange}
//                     className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1">
//                     Loại Giao Dịch
//                   </label>
//                   <select
//                     name="type"
//                     value={formData.type}
//                     onChange={handleChange}
//                     className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
//                     required
//                   >
//                     {transactionTypes.map((type) => (
//                       <option key={type} value={type}>
//                         {type}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1">
//                     Số Tiền
//                   </label>
//                   <input
//                     type="number"
//                     name="amount"
//                     value={formData.amount}
//                     onChange={handleChange}
//                     className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1">
//                     Tài khoản
//                   </label>
//                   <select
//                     name="account"
//                     value={formData.account}
//                     onChange={handleChange}
//                     className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
//                     required
//                   >
//                     {accounts.map((account) => (
//                       <option key={account} value={account}>
//                         {account}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1">
//                     Mục đích
//                   </label>
//                   <select
//                     name="purpose"
//                     value={formData.purpose}
//                     onChange={handleChange}
//                     className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
//                     required
//                   >
//                     {purposes.map((purpose) => (
//                       <option key={purpose} value={purpose}>
//                         {purpose}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1">
//                     Danh mục
//                   </label>
//                   <select
//                     name="category"
//                     value={formData.category}
//                     onChange={handleChange}
//                     className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
//                     required
//                   >
//                     {categoriesByPurpose[formData.purpose]?.map((category) => (
//                       <option key={category} value={category}>
//                         {category}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1">
//                     Thành viên
//                   </label>
//                   <select
//                     name="member"
//                     value={formData.member}
//                     onChange={handleChange}
//                     className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
//                     required
//                   >
//                     {members.map((member) => (
//                       <option key={member} value={member}>
//                         {member}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1">
//                     Kênh giao dịch
//                   </label>
//                   <select
//                     name="channel"
//                     value={formData.channel}
//                     onChange={handleChange}
//                     className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
//                     required
//                   >
//                     {channels.map((channel) => (
//                       <option key={channel} value={channel}>
//                         {channel}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="lg:col-span-4">
//                   <label className="block text-sm font-medium text-slate-700 mb-1">
//                     Nội dung
//                   </label>
//                   <textarea
//                     name="description"
//                     value={formData.description}
//                     onChange={handleChange}
//                     className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
//                     rows={2}
//                     required
//                   />
//                 </div>
//               </div>
//             )}

//             <button
//               type="submit"
//               className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
//               disabled={loading}
//             >
//               {loading ? "Đang xử lý..." : "Thêm giao dịch"}
//             </button>
//           </form>

//           <hr className="my-6 border-t border-slate-200" />

//           <TransactionList
//             transactions={allTransactions}
//             userId={userId}
//             showMessage={showMessage}
//             loading={loading}
//             setLoading={setLoading}
//           />
//         </>
//       )}
//     </div>
//   );
// };

// export default AddTransactionForm;

// src/components/AddTransactionForm.tsx
import React, { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db, appId, auth } from "../../firebase/config";
import Dashboard from "../../components/Dashboard";
import TransactionList from "./TransactionList";

// Import các kiểu dữ liệu từ file mới
import type { Transaction, FormElement } from "../../types";

// Import các hằng số từ file mới
import {
  TRANSACTION_TYPES,
  ACCOUNTS,
  PURPOSES,
  MEMBERS,
  CHANNELS,
  CATEGORIES_BY_PURPOSE,
} from "../../helpers/constants";

// Import các hàm phân tích từ file mới
import { parseSms } from "../../helpers/parsers";

// Import hàm thêm giao dịch từ file API
import { addTransactions } from "../../api/firestore";

const AddTransactionForm: React.FC = () => {
  // --- STATE ---
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<
    Omit<Transaction, "date" | "category" | "channel"> & {
      date: string;
      category: string;
      channel: string;
    }
  >({
    amount: 0,
    type: "Chi",
    description: "",
    date: new Date().toISOString().slice(0, 10),
    account: ACCOUNTS[0],
    purpose: PURPOSES[0],
    category: CATEGORIES_BY_PURPOSE[PURPOSES[0]][0],
    member: MEMBERS[0],
    channel: CHANNELS[0],
  });

  const [smsContent, setSmsContent] = useState("");
  const [transactionsToReview, setTransactionsToReview] = useState<
    Transaction[]
  >([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageTimeout, setMessageTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // --- EFFECT: Lắng nghe trạng thái xác thực người dùng ---
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- EFFECT: Cập nhật danh sách categories khi purpose thay đổi ---
  useEffect(() => {
    if (formData.purpose && CATEGORIES_BY_PURPOSE[formData.purpose]) {
      setFormData((prevData) => ({
        ...prevData,
        category: CATEGORIES_BY_PURPOSE[formData.purpose][0],
      }));
    } else {
      setFormData((prevData) => ({ ...prevData, category: "" }));
    }
  }, [formData.purpose]);

  // --- EFFECT: Lắng nghe thay đổi trên Firestore để hiển thị các giao dịch đã có ---
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const transactionsQuery = query(
      collection(db, `artifacts/${appId}/users/${userId}/transactions`)
    );

    const unsubscribe = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        const fetchedTransactions: Transaction[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as Omit<Transaction, "date"> & {
            date: { toDate: () => Date };
          };
          const transactionDate = data.date.toDate().toISOString().slice(0, 10);
          fetchedTransactions.push({
            id: doc.id,
            ...data,
            date: transactionDate,
          });
        });
        fetchedTransactions.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setAllTransactions(fetchedTransactions);
        setLoading(false);
      },
      (error) => {
        console.error("Lỗi khi fetch giao dịch: ", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // --- Hàm hiển thị thông báo và tự động ẩn sau 3 giây ---
  const showMessage = (msg: string) => {
    if (messageTimeout) {
      clearTimeout(messageTimeout);
    }
    setMessage(msg);
    setMessageTimeout(
      setTimeout(() => {
        setMessage("");
      }, 3000)
    );
  };

  // --- Lắng nghe thay đổi của smsContent và cập nhật danh sách review ---
  useEffect(() => {
    if (smsContent.trim() !== "") {
      const parsed = parseSms(smsContent); // Sử dụng hàm từ helpers
      setTransactionsToReview(parsed);
    } else {
      setTransactionsToReview([]);
    }
  }, [smsContent]);

  // --- Cập nhật form thủ công ---
  const handleChange = (e: ChangeEvent<FormElement>) => {
    const { name, value } = e.target;
    if (name === "smsContent") {
      setSmsContent(value);
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: name === "amount" ? Number(value) : value,
      }));
    }
  };

  // --- Cập nhật từng giao dịch trong danh sách review ---
  const handleReviewChange = (index: number, e: ChangeEvent<FormElement>) => {
    const { name, value } = e.target;
    const newTransactions = [...transactionsToReview];
    newTransactions[index] = {
      ...newTransactions[index],
      [name]: name === "amount" ? Number(value) : value,
    };
    if (name === "purpose" && CATEGORIES_BY_PURPOSE[value]) {
      newTransactions[index].category = CATEGORIES_BY_PURPOSE[value][0];
    }
    setTransactionsToReview(newTransactions);
  };

  const handleClearSms = () => {
    setSmsContent("");
    setTransactionsToReview([]);
  };

  const handleDeleteReviewItem = (index: number) => {
    const newTransactions = transactionsToReview.filter((_, i) => i !== index);
    setTransactionsToReview(newTransactions);
  };

  // --- LOGIC GỬI DỮ LIỆU ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!userId) {
      showMessage("Lỗi: Không tìm thấy ID người dùng. Vui lòng thử lại.");
      setLoading(false);
      return;
    }

    try {
      if (transactionsToReview.length > 0) {
        // Gọi hàm API mới để thêm nhiều giao dịch
        await addTransactions(transactionsToReview, userId);
        showMessage("Tất cả giao dịch đã được thêm thành công!");
        handleClearSms();
      } else {
        // Gọi hàm API mới để thêm một giao dịch
        await addTransactions(
          [
            {
              ...formData,
              date: formData.date,
              category: formData.category,
              channel: formData.channel,
            },
          ],
          userId
        );
        showMessage("Giao dịch đã được thêm thành công!");
        setFormData((prevData) => ({
          ...prevData,
          amount: 0,
          description: "",
          date: new Date().toISOString().slice(0, 10),
          category: CATEGORIES_BY_PURPOSE[prevData.purpose][0] || "",
        }));
      }
    } catch (error) {
      console.error("Lỗi khi thêm/cập nhật giao dịch: ", error);
      showMessage(
        "Lỗi: Không thể thêm/cập nhật giao dịch. Vui lòng kiểm tra console."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-7xl mx-auto font-sans text-slate-800">
      {message && (
        <div className="fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-md transition-opacity duration-300 bg-green-500 text-white">
          {message}
        </div>
      )}

      {/* Hiển thị thông báo tải */}
      {loading && allTransactions.length === 0 && (
        <div className="flex justify-center items-center h-48">
          <p className="text-xl text-indigo-600 font-semibold">
            Đang tải dữ liệu...
          </p>
        </div>
      )}

      {/* Ẩn Dashboard và Form khi đang tải */}
      {!loading && (
        <>
          {/* Component Dashboard được hiển thị ở đây */}
          <Dashboard transactions={allTransactions} />

          <hr className="my-6 border-t border-slate-200" />

          {/* Form nhập liệu */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-2xl font-bold text-slate-700 border-b pb-2 mb-4">
              Thêm Giao Dịch Mới
            </h3>

            {/* Trường nhập SMS */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Dán SMS
              </label>
              <textarea
                name="smsContent"
                value={smsContent}
                onChange={handleChange}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
                placeholder="Dán nội dung tin nhắn ngân hàng vào đây..."
              />
              {smsContent.trim() && (
                <button
                  type="button"
                  onClick={handleClearSms}
                  className="mt-2 text-sm text-red-600 hover:underline"
                >
                  Xóa SMS
                </button>
              )}
            </div>

            {/* HIỂN THỊ DANH SÁCH GIAO DỊCH ĐÃ PARSE */}
            {transactionsToReview.length > 0 && (
              <div className="bg-indigo-50 p-4 rounded-md space-y-4 max-h-96 overflow-y-auto">
                <h4 className="font-bold text-indigo-800">
                  Xem Trước Giao Dịch ({transactionsToReview.length})
                </h4>
                <div className="overflow-x-auto rounded-md shadow-sm border border-indigo-200">
                  <table className="min-w-full table-auto">
                    <thead className="bg-white sticky top-0">
                      <tr>
                        <th className="p-3 text-left text-sm font-semibold text-slate-600">
                          Ngày
                        </th>
                        <th className="p-3 text-left text-sm font-semibold text-slate-600">
                          Loại
                        </th>
                        <th className="p-3 text-left text-sm font-semibold text-slate-600">
                          Người thực hiện
                        </th>
                        <th className="p-3 text-left text-sm font-semibold text-slate-600">
                          Tài khoản
                        </th>
                        <th className="p-3 text-left text-sm font-semibold text-slate-600">
                          Số Tiền (VND)
                        </th>
                        <th className="p-3 text-left text-sm font-semibold text-slate-600">
                          Nội dung
                        </th>
                        <th className="p-3 text-left text-sm font-semibold text-slate-600">
                          Mục đích
                        </th>
                        <th className="p-3 text-left text-sm font-semibold text-slate-600">
                          Danh mục
                        </th>
                        <th className="p-3 text-left text-sm font-semibold text-slate-600">
                          Kênh
                        </th>
                        <th className="p-3 text-left text-sm font-semibold text-slate-600">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-200">
                      {transactionsToReview.map((tx, index) => (
                        <tr key={index} className="bg-white">
                          <td className="p-3 text-sm min-w-[120px]">
                            <input
                              type="date"
                              name="date"
                              value={tx.date}
                              onChange={(e) => handleReviewChange(index, e)}
                              className="w-full p-1 text-sm border rounded-md"
                            />
                          </td>
                          <td className="p-3 text-sm min-w-[80px]">
                            <select
                              name="type"
                              value={tx.type}
                              onChange={(e) => handleReviewChange(index, e)}
                              className="w-full p-1 text-sm border rounded-md"
                            >
                              {TRANSACTION_TYPES.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3 text-sm min-w-[100px]">
                            <select
                              name="member"
                              value={tx.member}
                              onChange={(e) => handleReviewChange(index, e)}
                              className="w-full p-1 text-sm border rounded-md"
                            >
                              {MEMBERS.map((member) => (
                                <option key={member} value={member}>
                                  {member}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3 text-sm min-w-[120px]">
                            <select
                              name="account"
                              value={tx.account}
                              onChange={(e) => handleReviewChange(index, e)}
                              className="w-full p-1 text-sm border rounded-md"
                            >
                              {ACCOUNTS.map((account) => (
                                <option key={account} value={account}>
                                  {account}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3 text-sm min-w-[120px]">
                            <input
                              type="number"
                              name="amount"
                              value={tx.amount}
                              onChange={(e) => handleReviewChange(index, e)}
                              className="w-full p-1 text-sm border rounded-md"
                            />
                          </td>
                          <td className="p-3 text-sm min-w-[200px]">
                            <textarea
                              name="description"
                              value={tx.description}
                              onChange={(e) => handleReviewChange(index, e)}
                              className="w-full p-1 text-sm border rounded-md"
                              rows={1}
                            />
                          </td>
                          <td className="p-3 text-sm min-w-[100px]">
                            <select
                              name="purpose"
                              value={tx.purpose}
                              onChange={(e) => handleReviewChange(index, e)}
                              className="w-full p-1 text-sm border rounded-md"
                            >
                              {PURPOSES.map((purpose) => (
                                <option key={purpose} value={purpose}>
                                  {purpose}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3 text-sm min-w-[100px]">
                            <select
                              name="category"
                              value={tx.category}
                              onChange={(e) => handleReviewChange(index, e)}
                              className="w-full p-1 text-sm border rounded-md"
                            >
                              {CATEGORIES_BY_PURPOSE[tx.purpose]?.map(
                                (category) => (
                                  <option key={category} value={category}>
                                    {category}
                                  </option>
                                )
                              )}
                            </select>
                          </td>
                          <td className="p-3 text-sm min-w-[100px]">
                            <select
                              name="channel"
                              value={tx.channel}
                              onChange={(e) => handleReviewChange(index, e)}
                              className="w-full p-1 text-sm border rounded-md"
                            >
                              {CHANNELS.map((channel) => (
                                <option key={channel} value={channel}>
                                  {channel}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3 text-sm min-w-[80px]">
                            <button
                              type="button"
                              onClick={() => handleDeleteReviewItem(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {transactionsToReview.length === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* TRƯỜNG: Ngày */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ngày
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 rounded-md"
                    required
                  />
                </div>
                {/* TRƯỜNG: Loại */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Loại Giao Dịch
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 rounded-md"
                    required
                  >
                    {TRANSACTION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                {/* TRƯỜNG: Số tiền */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Số Tiền
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 rounded-md"
                    required
                  />
                </div>
                {/* TRƯỜNG: Tài khoản */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tài khoản
                  </label>
                  <select
                    name="account"
                    value={formData.account}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 rounded-md"
                    required
                  >
                    {ACCOUNTS.map((account) => (
                      <option key={account} value={account}>
                        {account}
                      </option>
                    ))}
                  </select>
                </div>
                {/* TRƯỜNG: Người thực hiện */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Người thực hiện
                  </label>
                  <select
                    name="member"
                    value={formData.member}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 rounded-md"
                    required
                  >
                    {MEMBERS.map((member) => (
                      <option key={member} value={member}>
                        {member}
                      </option>
                    ))}
                  </select>
                </div>
                {/* TRƯỜNG: Mục đích */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mục đích
                  </label>
                  <select
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 rounded-md"
                    required
                  >
                    {PURPOSES.map((purpose) => (
                      <option key={purpose} value={purpose}>
                        {purpose}
                      </option>
                    ))}
                  </select>
                </div>
                {/* TRƯỜNG: Danh mục */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Danh mục
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 rounded-md"
                    required
                  >
                    {CATEGORIES_BY_PURPOSE[formData.purpose]?.map(
                      (category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      )
                    )}
                  </select>
                </div>
                {/* TRƯỜNG: Kênh */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Kênh
                  </label>
                  <select
                    name="channel"
                    value={formData.channel}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 rounded-md"
                    required
                  >
                    {CHANNELS.map((channel) => (
                      <option key={channel} value={channel}>
                        {channel}
                      </option>
                    ))}
                  </select>
                </div>
                {/* TRƯỜNG: Nội dung */}
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nội dung
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 rounded-md"
                    rows={2}
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-700 transition-colors duration-200 disabled:bg-indigo-300"
                disabled={loading}
              >
                {loading
                  ? "Đang xử lý..."
                  : transactionsToReview.length > 0
                  ? `Lưu ${transactionsToReview.length} Giao Dịch`
                  : "Thêm Giao Dịch"}
              </button>
            </div>
          </form>

          <hr className="my-6 border-t border-slate-200" />

          {/* Component TransactionList được hiển thị ở đây */}
          <TransactionList
            transactions={allTransactions}
            userId={userId}
            showMessage={showMessage}
            loading={loading}
            setLoading={setLoading}
          />
        </>
      )}
    </div>
  );
};

export default AddTransactionForm;
