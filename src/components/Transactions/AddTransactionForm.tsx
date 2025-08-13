// // src/components/Transactions/AddTransactionForm.tsx
// import React, { useState, useEffect } from "react";
// import type { ChangeEvent } from "react";
// import { collection, onSnapshot, query } from "firebase/firestore";
// import { db, appId, auth } from "../../firebase/config";
// import Dashboard from "../../components/Dashboard";
// import TransactionList from "./TransactionList";

// // Import các kiểu dữ liệu từ file mới
// import type { Transaction, FormElement } from "../../types";

// // Import các hằng số từ file mới
// import {
//   TRANSACTION_TYPES,
//   ACCOUNTS,
//   PURPOSES,
//   MEMBERS,
//   CHANNELS,
//   CATEGORIES_BY_PURPOSE,
// } from "../../helpers/constants";

// // Import các hàm phân tích từ file mới
// import { parseSms } from "../../helpers/parsers";

// // Import hàm thêm giao dịch từ file API
// import { addTransactions } from "../../api/firestore";

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
//     account: ACCOUNTS[0],
//     purpose: PURPOSES[0],
//     category: CATEGORIES_BY_PURPOSE[PURPOSES[0]][0],
//     member: MEMBERS[0],
//     channel: CHANNELS[0],
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
//     if (formData.purpose && CATEGORIES_BY_PURPOSE[formData.purpose]) {
//       setFormData((prevData) => ({
//         ...prevData,
//         category: CATEGORIES_BY_PURPOSE[formData.purpose][0],
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

//   // --- Lắng nghe thay đổi của smsContent và cập nhật danh sách review ---
//   useEffect(() => {
//     if (smsContent.trim() !== "") {
//       const parsed = parseSms(smsContent); // Sử dụng hàm từ helpers
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
//     if (name === "purpose" && CATEGORIES_BY_PURPOSE[value]) {
//       newTransactions[index].category = CATEGORIES_BY_PURPOSE[value][0];
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
//       if (transactionsToReview.length > 0) {
//         // Gọi hàm API mới để thêm nhiều giao dịch
//         await addTransactions(transactionsToReview, userId);
//         showMessage("Tất cả giao dịch đã được thêm thành công!");
//         handleClearSms();
//       } else {
//         // Gọi hàm API mới để thêm một giao dịch
//         await addTransactions(
//           [
//             {
//               ...formData,
//               date: formData.date,
//               category: formData.category,
//               channel: formData.channel,
//             },
//           ],
//           userId
//         );
//         showMessage("Giao dịch đã được thêm thành công!");
//         setFormData((prevData) => ({
//           ...prevData,
//           amount: 0,
//           description: "",
//           date: new Date().toISOString().slice(0, 10),
//           category: CATEGORIES_BY_PURPOSE[prevData.purpose][0] || "",
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
//                               {TRANSACTION_TYPES.map((type) => (
//                                 <option key={type} value={type}>
//                                   {type}
//                                 </option>
//                               ))}
//                             </select>
//                           </td>
//                           <td className="p-3 text-sm min-w-[100px]">
//                             <select
//                               name="member"
//                               value={tx.member}
//                               onChange={(e) => handleReviewChange(index, e)}
//                               className="w-full p-1 text-sm border rounded-md"
//                             >
//                               {MEMBERS.map((member) => (
//                                 <option key={member} value={member}>
//                                   {member}
//                                 </option>
//                               ))}
//                             </select>
//                           </td>
//                           <td className="p-3 text-sm min-w-[120px]">
//                             <select
//                               name="account"
//                               value={tx.account}
//                               onChange={(e) => handleReviewChange(index, e)}
//                               className="w-full p-1 text-sm border rounded-md"
//                             >
//                               {ACCOUNTS.map((account) => (
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
//                           <td className="p-3 text-sm min-w-[100px]">
//                             <select
//                               name="purpose"
//                               value={tx.purpose}
//                               onChange={(e) => handleReviewChange(index, e)}
//                               className="w-full p-1 text-sm border rounded-md"
//                             >
//                               {PURPOSES.map((purpose) => (
//                                 <option key={purpose} value={purpose}>
//                                   {purpose}
//                                 </option>
//                               ))}
//                             </select>
//                           </td>
//                           <td className="p-3 text-sm min-w-[100px]">
//                             <select
//                               name="category"
//                               value={tx.category}
//                               onChange={(e) => handleReviewChange(index, e)}
//                               className="w-full p-1 text-sm border rounded-md"
//                             >
//                               {CATEGORIES_BY_PURPOSE[tx.purpose]?.map(
//                                 (category) => (
//                                   <option key={category} value={category}>
//                                     {category}
//                                   </option>
//                                 )
//                               )}
//                             </select>
//                           </td>
//                           <td className="p-3 text-sm min-w-[100px]">
//                             <select
//                               name="channel"
//                               value={tx.channel}
//                               onChange={(e) => handleReviewChange(index, e)}
//                               className="w-full p-1 text-sm border rounded-md"
//                             >
//                               {CHANNELS.map((channel) => (
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
//                               className="text-red-600 hover:text-red-800"
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

//             {transactionsToReview.length === 0 && (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {/* TRƯỜNG: Ngày */}
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1">
//                     Ngày
//                   </label>
//                   <input
//                     type="date"
//                     name="date"
//                     value={formData.date}
//                     onChange={handleChange}
//                     className="w-full p-2 border border-slate-300 rounded-md"
//                     required
//                   />
//                 </div>
//                 {/* TRƯỜNG: Loại */}
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1">
//                     Loại Giao Dịch
//                   </label>
//                   <select
//                     name="type"
//                     value={formData.type}
//                     onChange={handleChange}
//                     className="w-full p-2 border border-slate-300 rounded-md"
//                     required
//                   >
//                     {TRANSACTION_TYPES.map((type) => (
//                       <option key={type} value={type}>
//                         {type}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 {/* TRƯỜNG: Số tiền */}
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1">
//                     Số Tiền
//                   </label>
//                   <input
//                     type="number"
//                     name="amount"
//                     value={formData.amount}
//                     onChange={handleChange}
//                     className="w-full p-2 border border-slate-300 rounded-md"
//                     required
//                   />
//                 </div>
//                 {/* TRƯỜNG: Tài khoản */}
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1">
//                     Tài khoản
//                   </label>
//                   <select
//                     name="account"
//                     value={formData.account}
//                     onChange={handleChange}
//                     className="w-full p-2 border border-slate-300 rounded-md"
//                     required
//                   >
//                     {ACCOUNTS.map((account) => (
//                       <option key={account} value={account}>
//                         {account}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 {/* TRƯỜNG: Người thực hiện */}
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1">
//                     Người thực hiện
//                   </label>
//                   <select
//                     name="member"
//                     value={formData.member}
//                     onChange={handleChange}
//                     className="w-full p-2 border border-slate-300 rounded-md"
//                     required
//                   >
//                     {MEMBERS.map((member) => (
//                       <option key={member} value={member}>
//                         {member}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 {/* TRƯỜNG: Mục đích */}
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1">
//                     Mục đích
//                   </label>
//                   <select
//                     name="purpose"
//                     value={formData.purpose}
//                     onChange={handleChange}
//                     className="w-full p-2 border border-slate-300 rounded-md"
//                     required
//                   >
//                     {PURPOSES.map((purpose) => (
//                       <option key={purpose} value={purpose}>
//                         {purpose}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 {/* TRƯỜNG: Danh mục */}
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1">
//                     Danh mục
//                   </label>
//                   <select
//                     name="category"
//                     value={formData.category}
//                     onChange={handleChange}
//                     className="w-full p-2 border border-slate-300 rounded-md"
//                     required
//                   >
//                     {CATEGORIES_BY_PURPOSE[formData.purpose]?.map(
//                       (category) => (
//                         <option key={category} value={category}>
//                           {category}
//                         </option>
//                       )
//                     )}
//                   </select>
//                 </div>
//                 {/* TRƯỜNG: Kênh */}
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1">
//                     Kênh
//                   </label>
//                   <select
//                     name="channel"
//                     value={formData.channel}
//                     onChange={handleChange}
//                     className="w-full p-2 border border-slate-300 rounded-md"
//                     required
//                   >
//                     {CHANNELS.map((channel) => (
//                       <option key={channel} value={channel}>
//                         {channel}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 {/* TRƯỜNG: Nội dung */}
//                 <div className="lg:col-span-3">
//                   <label className="block text-sm font-medium text-slate-700 mb-1">
//                     Nội dung
//                   </label>
//                   <textarea
//                     name="description"
//                     value={formData.description}
//                     onChange={handleChange}
//                     className="w-full p-2 border border-slate-300 rounded-md"
//                     rows={2}
//                     required
//                   />
//                 </div>
//               </div>
//             )}

//             <div className="flex justify-end pt-4">
//               <button
//                 type="submit"
//                 className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-700 transition-colors duration-200 disabled:bg-indigo-300"
//                 disabled={loading}
//               >
//                 {loading
//                   ? "Đang xử lý..."
//                   : transactionsToReview.length > 0
//                   ? `Lưu ${transactionsToReview.length} Giao Dịch`
//                   : "Thêm Giao Dịch"}
//               </button>
//             </div>
//           </form>

//           <hr className="my-6 border-t border-slate-200" />

//           {/* Component TransactionList được hiển thị ở đây */}
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

// src/components/Transactions/AddTransactionForm.tsx
import React, { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { addTransactions } from "../../api/firestore";
import type { Transaction, FormElement } from "../../types";
import {
  TRANSACTION_TYPES,
  ACCOUNTS,
  PURPOSES,
  MEMBERS,
  CHANNELS,
  CATEGORIES_BY_PURPOSE,
} from "../../helpers/constants";
import { parseSms } from "../../helpers/parsers";

// Định nghĩa các props mà component này nhận
interface AddTransactionFormProps {
  userId: string;
  showMessage: (msg: string) => void;
}

const AddTransactionForm: React.FC<AddTransactionFormProps> = ({
  userId,
  showMessage,
}) => {
  // --- STATE ---
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
  const [loading, setLoading] = useState(false);

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

  // --- Lắng nghe thay đổi của smsContent và cập nhật danh sách review ---
  useEffect(() => {
    if (smsContent.trim() !== "") {
      const parsed = parseSms(smsContent);
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
        await addTransactions(transactionsToReview, userId);
        showMessage("Tất cả giao dịch đã được thêm thành công!");
        handleClearSms();
      } else {
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
    <form onSubmit={handleSubmit} className="space-y-4">
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
                        {CATEGORIES_BY_PURPOSE[tx.purpose]?.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
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
              {CATEGORIES_BY_PURPOSE[formData.purpose]?.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
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
  );
};

export default AddTransactionForm;
