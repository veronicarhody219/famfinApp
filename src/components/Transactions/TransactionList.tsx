// // src/components/TransactionList.tsx
// import React, { useState, type ChangeEvent } from "react";
// import { doc, deleteDoc, updateDoc } from "firebase/firestore";
// import { db, appId } from "../firebase/config";

// // Giả định kiểu dữ liệu cho giao dịch
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

// // Giả định kiểu dữ liệu cho các phần tử form
// type FormElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

// interface TransactionListProps {
//   transactions: Transaction[];
//   userId: string | null;
//   showMessage: (msg: string) => void;
//   loading: boolean;
//   setLoading: (loading: boolean) => void;
// }

// const TransactionList: React.FC<TransactionListProps> = ({
//   transactions,
//   userId,
//   showMessage,
//   loading,
//   setLoading,
// }) => {
//   const [filterTerm, setFilterTerm] = useState("");
//   const [editingTransactionId, setEditingTransactionId] = useState<
//     string | null
//   >(null);
//   const [editingFormData, setEditingFormData] = useState<Transaction | null>(
//     null
//   );
//   // Thêm state để quản lý modal xóa
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
//     null
//   );

//   // --- HÀM CHO CHỈNH SỬA INLINE ---
//   const handleEditClick = (tx: Transaction) => {
//     setEditingTransactionId(tx.id || null);
//     setEditingFormData(tx);
//   };

//   const handleInlineChange = (e: ChangeEvent<FormElement>) => {
//     const { name, value } = e.target;
//     setEditingFormData((prevData) => {
//       if (!prevData) return null;
//       return {
//         ...prevData,
//         [name]: name === "amount" ? Number(value) : value,
//       };
//     });
//   };

//   const handleSaveClick = async () => {
//     if (!editingTransactionId || !editingFormData || !userId) return;
//     setLoading(true);

//     try {
//       const docRef = doc(
//         db,
//         `artifacts/${appId}/users/${userId}/transactions`,
//         editingTransactionId
//       );
//       await updateDoc(docRef, {
//         ...editingFormData,
//         date: new Date(editingFormData.date),
//       });
//       showMessage("Giao dịch đã được cập nhật thành công!");
//       setEditingTransactionId(null);
//       setEditingFormData(null);
//     } catch (error) {
//       console.error("Lỗi khi cập nhật giao dịch: ", error);
//       showMessage("Lỗi: Không thể cập nhật giao dịch.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancelClick = () => {
//     setEditingTransactionId(null);
//     setEditingFormData(null);
//   };

//   // --- LOGIC XÓA (ĐÃ CẬP NHẬT) ---
//   const handleDeleteClick = (txId: string) => {
//     setTransactionToDelete(txId);
//     setIsDeleteModalOpen(true);
//   };

//   const handleDeleteConfirm = async () => {
//     if (!transactionToDelete || !userId) return;

//     setLoading(true);
//     setIsDeleteModalOpen(false);

//     try {
//       const docRef = doc(
//         db,
//         `artifacts/${appId}/users/${userId}/transactions`,
//         transactionToDelete
//       );
//       await deleteDoc(docRef);
//       showMessage("Giao dịch đã được xóa thành công!");
//       setTransactionToDelete(null);
//     } catch (error) {
//       console.error("Lỗi khi xóa giao dịch: ", error);
//       showMessage("Lỗi: Không thể xóa giao dịch.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteCancel = () => {
//     setIsDeleteModalOpen(false);
//     setTransactionToDelete(null);
//   };

//   // Logic lọc giao dịch
//   const filteredTransactions = transactions.filter(
//     (tx) =>
//       (tx.description || "").toLowerCase().includes(filterTerm.toLowerCase()) ||
//       tx.amount.toString().includes(filterTerm) ||
//       tx.type.toLowerCase().includes(filterTerm.toLowerCase()) ||
//       (tx.purpose || "").toLowerCase().includes(filterTerm.toLowerCase()) ||
//       (tx.category || "").toLowerCase().includes(filterTerm.toLowerCase()) ||
//       (tx.member || "").toLowerCase().includes(filterTerm.toLowerCase()) ||
//       (tx.channel || "").toLowerCase().includes(filterTerm.toLowerCase())
//   );

//   const transactionTypes = ["Chi", "Thu"];
//   const purposes = [
//     "Ăn uống",
//     "Mua sắm",
//     "Hóa đơn",
//     "Giải trí",
//     "Sức khỏe",
//     "Kinh doanh",
//     "Khác",
//   ];
//   const members = ["Chồng", "Vợ", "Con", "Khác"];
//   const accounts = ["Tiền mặt", "Tài khoản ngân hàng", "Thẻ tín dụng"];

//   return (
//     <div className="my-6">
//       <h3 className="text-2xl font-bold text-slate-700 mb-4">
//         Lịch Sử Giao Dịch
//       </h3>
//       <div className="mb-4">
//         <input
//           type="text"
//           placeholder="Lọc theo mô tả, số tiền, loại..."
//           value={filterTerm}
//           onChange={(e) => setFilterTerm(e.target.value)}
//           className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
//         />
//       </div>
//       <div className="max-h-96 overflow-y-auto rounded-md shadow-sm border border-slate-200">
//         <table className="min-w-full table-auto">
//           <thead className="bg-slate-100 sticky top-0">
//             <tr>
//               <th className="p-3 text-left text-sm font-semibold text-slate-600 w-[5%]">
//                 Số thứ tự
//               </th>
//               <th className="p-3 text-left text-sm font-semibold text-slate-600 w-[10%]">
//                 Ngày
//               </th>
//               <th className="p-3 text-left text-sm font-semibold text-slate-600 w-[8%]">
//                 Loại
//               </th>
//               <th className="p-3 text-left text-sm font-semibold text-slate-600 w-[12%]">
//                 Người thực hiện
//               </th>
//               <th className="p-3 text-left text-sm font-semibold text-slate-600 w-[12%]">
//                 Tài khoản
//               </th>
//               <th className="p-3 text-left text-sm font-semibold text-slate-600 w-[15%]">
//                 Số Tiền
//               </th>
//               <th className="p-3 text-left text-sm font-semibold text-slate-600 w-[20%]">
//                 Nội dung
//               </th>
//               <th className="p-3 text-left text-sm font-semibold text-slate-600 w-[10%]">
//                 Mục đích
//               </th>
//               <th className="p-3 text-left text-sm font-semibold text-slate-600 w-[10%]">
//                 Kênh
//               </th>
//               <th className="p-3 text-left text-sm font-semibold text-slate-600 w-[12%]">
//                 Hành động
//               </th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-200">
//             {filteredTransactions.length > 0 ? (
//               filteredTransactions.map((tx, index) => (
//                 <tr
//                   key={tx.id}
//                   className="hover:bg-slate-50 transition-colors duration-150"
//                 >
//                   {editingTransactionId === tx.id ? (
//                     <>
//                       <td className="p-3 text-sm">{index + 1}</td>
//                       <td className="p-3 text-sm">
//                         <input
//                           type="date"
//                           name="date"
//                           value={editingFormData?.date || ""}
//                           onChange={handleInlineChange}
//                           className="w-full p-1 text-sm border rounded-md"
//                         />
//                       </td>
//                       <td className="p-3 text-sm">
//                         <select
//                           name="type"
//                           value={editingFormData?.type || "Chi"}
//                           onChange={handleInlineChange}
//                           className="w-full p-1 text-sm border rounded-md"
//                         >
//                           {transactionTypes.map((type) => (
//                             <option key={type} value={type}>
//                               {type}
//                             </option>
//                           ))}
//                         </select>
//                       </td>
//                       <td className="p-3 text-sm">
//                         <select
//                           name="member"
//                           value={editingFormData?.member || "Chồng"}
//                           onChange={handleInlineChange}
//                           className="w-full p-1 text-sm border rounded-md"
//                         >
//                           {members.map((member) => (
//                             <option key={member} value={member}>
//                               {member}
//                             </option>
//                           ))}
//                         </select>
//                       </td>
//                       <td className="p-3 text-sm">
//                         <select
//                           name="account"
//                           value={editingFormData?.account || "Tiền mặt"}
//                           onChange={handleInlineChange}
//                           className="w-full p-1 text-sm border rounded-md"
//                         >
//                           {accounts.map((account) => (
//                             <option key={account} value={account}>
//                               {account}
//                             </option>
//                           ))}
//                         </select>
//                       </td>
//                       <td className="p-3 text-sm">
//                         <input
//                           type="number"
//                           name="amount"
//                           value={editingFormData?.amount || 0}
//                           onChange={handleInlineChange}
//                           className="w-full p-1 text-sm border rounded-md"
//                         />
//                       </td>
//                       <td className="p-3 text-sm">
//                         <textarea
//                           name="description"
//                           value={editingFormData?.description || ""}
//                           onChange={handleInlineChange}
//                           className="w-full p-1 text-sm border rounded-md"
//                           rows={1}
//                         />
//                       </td>
//                       <td className="p-3 text-sm">
//                         <select
//                           name="purpose"
//                           value={editingFormData?.purpose || "Ăn uống"}
//                           onChange={handleInlineChange}
//                           className="w-full p-1 text-sm border rounded-md"
//                         >
//                           {purposes.map((purpose) => (
//                             <option key={purpose} value={purpose}>
//                               {purpose}
//                             </option>
//                           ))}
//                         </select>
//                       </td>
//                       <td className="p-3 text-sm">
//                         <input
//                           type="text"
//                           name="channel"
//                           value={editingFormData?.channel || ""}
//                           onChange={handleInlineChange}
//                           className="w-full p-1 text-sm border rounded-md"
//                         />
//                       </td>
//                       <td className="p-3 text-sm space-x-2 whitespace-nowrap">
//                         <button
//                           type="button"
//                           onClick={handleSaveClick}
//                           className="text-green-600 hover:text-green-800 disabled:text-gray-400"
//                           disabled={loading}
//                         >
//                           Lưu
//                         </button>
//                         <button
//                           type="button"
//                           onClick={handleCancelClick}
//                           className="text-gray-500 hover:text-gray-700 disabled:text-gray-400"
//                           disabled={loading}
//                         >
//                           Hủy
//                         </button>
//                       </td>
//                     </>
//                   ) : (
//                     <>
//                       <td className="p-3 text-sm w-[5%]">{index + 1}</td>
//                       <td className="p-3 text-sm w-[10%]">{tx.date}</td>
//                       <td className="p-3 text-sm w-[8%]">
//                         <span
//                           className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                             tx.type === "Thu"
//                               ? "bg-green-100 text-green-800"
//                               : "bg-red-100 text-red-800"
//                           }`}
//                         >
//                           {tx.type}
//                         </span>
//                       </td>
//                       <td className="p-3 text-sm w-[12%]">{tx.member}</td>
//                       <td className="p-3 text-sm w-[12%]">{tx.account}</td>
//                       <td className="p-3 text-sm w-[15%]">
//                         {tx.amount.toLocaleString("vi-VN", {
//                           style: "currency",
//                           currency: "VND",
//                         })}
//                       </td>
//                       <td className="p-3 text-sm w-[20%] break-words">
//                         {tx.description}
//                       </td>
//                       <td className="p-3 text-sm w-[10%]">
//                         <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
//                           {tx.purpose}
//                         </span>
//                       </td>
//                       <td className="p-3 text-sm w-[10%]">{tx.channel}</td>
//                       <td className="p-3 text-sm w-[12%] space-x-2 whitespace-nowrap">
//                         <button
//                           type="button"
//                           onClick={() => handleEditClick(tx)}
//                           className="text-indigo-600 hover:text-indigo-900"
//                         >
//                           Sửa
//                         </button>
//                         <button
//                           type="button"
//                           onClick={() => tx.id && handleDeleteClick(tx.id)}
//                           className="text-red-600 hover:text-red-900"
//                         >
//                           Xóa
//                         </button>
//                       </td>
//                     </>
//                   )}
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan={10} className="p-4 text-center text-gray-500">
//                   Không có giao dịch nào được tìm thấy.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Modal xác nhận xóa tùy chỉnh */}
//       {isDeleteModalOpen && (
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
//           <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full mx-4">
//             <h4 className="text-xl font-bold text-gray-800 mb-4">
//               Xác nhận xóa
//             </h4>
//             <p className="text-gray-600 mb-6">
//               Bạn có chắc chắn muốn xóa giao dịch này không? Hành động này không
//               thể hoàn tác.
//             </p>
//             <div className="flex justify-end space-x-4">
//               <button
//                 type="button"
//                 onClick={handleDeleteCancel}
//                 className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
//                 disabled={loading}
//               >
//                 Hủy
//               </button>
//               <button
//                 type="button"
//                 onClick={handleDeleteConfirm}
//                 className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
//                 disabled={loading}
//               >
//                 {loading ? "Đang xóa..." : "Xóa"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TransactionList;

// src/components/TransactionList.tsx
import React, { useState, type ChangeEvent } from "react";
// Loại bỏ các import trực tiếp của Firebase
// import { doc, deleteDoc, updateDoc } from "firebase/firestore";
// import { db, appId } from "../firebase/config";

// Import các hàm API mới
import { updateTransaction, deleteTransaction } from "../../api/firestore";

// Import các kiểu dữ liệu từ file mới
import { type Transaction, type FormElement } from "../../types";

interface TransactionListProps {
  transactions: Transaction[];
  userId: string | null;
  showMessage: (msg: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  userId,
  showMessage,
  loading,
  setLoading,
}) => {
  const [filterTerm, setFilterTerm] = useState("");
  const [editingTransactionId, setEditingTransactionId] = useState<
    string | null
  >(null);
  const [editingFormData, setEditingFormData] = useState<Transaction | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null
  );

  // --- HÀM CHO CHỈNH SỬA INLINE ---
  const handleEditClick = (tx: Transaction) => {
    setEditingTransactionId(tx.id || null);
    setEditingFormData(tx);
  };

  const handleInlineChange = (e: ChangeEvent<FormElement>) => {
    const { name, value } = e.target;
    setEditingFormData((prevData) => {
      if (!prevData) return null;
      return {
        ...prevData,
        [name]: name === "amount" ? Number(value) : value,
      };
    });
  };

  const handleSaveClick = async () => {
    if (!editingTransactionId || !editingFormData || !userId) return;
    setLoading(true);

    try {
      // Gọi hàm API mới thay vì gọi Firestore trực tiếp
      await updateTransaction(editingTransactionId, userId, editingFormData);
      showMessage("Giao dịch đã được cập nhật thành công!");
      setEditingTransactionId(null);
      setEditingFormData(null);
    } catch (error) {
      console.error("Lỗi khi cập nhật giao dịch: ", error);
      showMessage("Lỗi: Không thể cập nhật giao dịch.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    setEditingTransactionId(null);
    setEditingFormData(null);
  };

  // --- LOGIC XÓA ---
  const handleDeleteClick = (txId: string) => {
    setTransactionToDelete(txId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete || !userId) return;
    setLoading(true);
    setIsDeleteModalOpen(false);

    try {
      // Gọi hàm API mới thay vì gọi Firestore trực tiếp
      await deleteTransaction(transactionToDelete, userId);
      showMessage("Giao dịch đã được xóa thành công!");
      setTransactionToDelete(null);
    } catch (error) {
      console.error("Lỗi khi xóa giao dịch: ", error);
      showMessage("Lỗi: Không thể xóa giao dịch.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setTransactionToDelete(null);
  };

  // Logic lọc giao dịch (không thay đổi)
  const filteredTransactions = transactions.filter(
    (tx) =>
      (tx.description || "").toLowerCase().includes(filterTerm.toLowerCase()) ||
      tx.amount.toString().includes(filterTerm) ||
      tx.type.toLowerCase().includes(filterTerm.toLowerCase()) ||
      (tx.purpose || "").toLowerCase().includes(filterTerm.toLowerCase()) ||
      (tx.category || "").toLowerCase().includes(filterTerm.toLowerCase()) ||
      (tx.member || "").toLowerCase().includes(filterTerm.toLowerCase()) ||
      (tx.channel || "").toLowerCase().includes(filterTerm.toLowerCase())
  );

  const transactionTypes = ["Chi", "Thu"];
  const purposes = [
    "Ăn uống",
    "Mua sắm",
    "Hóa đơn",
    "Giải trí",
    "Sức khỏe",
    "Kinh doanh",
    "Khác",
  ];
  const members = ["Chồng", "Vợ", "Con", "Khác"];
  const accounts = ["Tiền mặt", "Tài khoản ngân hàng", "Thẻ tín dụng"];

  return (
    <div className="my-6">
      <h3 className="text-2xl font-bold text-slate-700 mb-4">
        Lịch Sử Giao Dịch
      </h3>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Lọc theo mô tả, số tiền, loại..."
          value={filterTerm}
          onChange={(e) => setFilterTerm(e.target.value)}
          className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div className="max-h-96 overflow-y-auto rounded-md shadow-sm border border-slate-200">
        <table className="min-w-full table-auto">
          <thead className="bg-slate-100 sticky top-0">
            <tr>
              <th className="p-3 text-left text-sm font-semibold text-slate-600 w-[5%]">
                Số thứ tự
              </th>
              <th className="p-3 text-left text-sm font-semibold text-slate-600 w-[10%]">
                Ngày
              </th>
              <th className="p-3 text-left text-sm font-semibold text-slate-600 w-[8%]">
                Loại
              </th>
              <th className="p-3 text-left text-sm font-semibold text-slate-600 w-[12%]">
                Người thực hiện
              </th>
              <th className="p-3 text-left text-sm font-semibold text-slate-600 w-[12%]">
                Tài khoản
              </th>
              <th className="p-3 text-left text-sm font-semibold text-slate-600 w-[15%]">
                Số Tiền
              </th>
              <th className="p-3 text-left text-sm font-semibold text-slate-600 w-[20%]">
                Nội dung
              </th>
              <th className="p-3 text-left text-sm font-semibold text-slate-600 w-[10%]">
                Mục đích
              </th>
              <th className="p-3 text-left text-sm font-semibold text-slate-600 w-[10%]">
                Kênh
              </th>
              <th className="p-3 text-left text-sm font-semibold text-slate-600 w-[12%]">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx, index) => (
                <tr
                  key={tx.id}
                  className="hover:bg-slate-50 transition-colors duration-150"
                >
                  {editingTransactionId === tx.id ? (
                    <>
                      <td className="p-3 text-sm">{index + 1}</td>
                      <td className="p-3 text-sm">
                        <input
                          type="date"
                          name="date"
                          value={editingFormData?.date || ""}
                          onChange={handleInlineChange}
                          className="w-full p-1 text-sm border rounded-md"
                        />
                      </td>
                      <td className="p-3 text-sm">
                        <select
                          name="type"
                          value={editingFormData?.type || "Chi"}
                          onChange={handleInlineChange}
                          className="w-full p-1 text-sm border rounded-md"
                        >
                          {transactionTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 text-sm">
                        <select
                          name="member"
                          value={editingFormData?.member || "Chồng"}
                          onChange={handleInlineChange}
                          className="w-full p-1 text-sm border rounded-md"
                        >
                          {members.map((member) => (
                            <option key={member} value={member}>
                              {member}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 text-sm">
                        <select
                          name="account"
                          value={editingFormData?.account || "Tiền mặt"}
                          onChange={handleInlineChange}
                          className="w-full p-1 text-sm border rounded-md"
                        >
                          {accounts.map((account) => (
                            <option key={account} value={account}>
                              {account}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 text-sm">
                        <input
                          type="number"
                          name="amount"
                          value={editingFormData?.amount || 0}
                          onChange={handleInlineChange}
                          className="w-full p-1 text-sm border rounded-md"
                        />
                      </td>
                      <td className="p-3 text-sm">
                        <textarea
                          name="description"
                          value={editingFormData?.description || ""}
                          onChange={handleInlineChange}
                          className="w-full p-1 text-sm border rounded-md"
                          rows={1}
                        />
                      </td>
                      <td className="p-3 text-sm">
                        <select
                          name="purpose"
                          value={editingFormData?.purpose || "Ăn uống"}
                          onChange={handleInlineChange}
                          className="w-full p-1 text-sm border rounded-md"
                        >
                          {purposes.map((purpose) => (
                            <option key={purpose} value={purpose}>
                              {purpose}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 text-sm">
                        <input
                          type="text"
                          name="channel"
                          value={editingFormData?.channel || ""}
                          onChange={handleInlineChange}
                          className="w-full p-1 text-sm border rounded-md"
                        />
                      </td>
                      <td className="p-3 text-sm space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={handleSaveClick}
                          className="text-green-600 hover:text-green-800 disabled:text-gray-400"
                          disabled={loading}
                        >
                          Lưu
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelClick}
                          className="text-gray-500 hover:text-gray-700 disabled:text-gray-400"
                          disabled={loading}
                        >
                          Hủy
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-3 text-sm w-[5%]">{index + 1}</td>
                      <td className="p-3 text-sm w-[10%]">{tx.date}</td>
                      <td className="p-3 text-sm w-[8%]">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            tx.type === "Thu"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-3 text-sm w-[12%]">{tx.member}</td>
                      <td className="p-3 text-sm w-[12%]">{tx.account}</td>
                      <td className="p-3 text-sm w-[15%]">
                        {tx.amount.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </td>
                      <td className="p-3 text-sm w-[20%] break-words">
                        {tx.description}
                      </td>
                      <td className="p-3 text-sm w-[10%]">
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
                          {tx.purpose}
                        </span>
                      </td>
                      <td className="p-3 text-sm w-[10%]">{tx.channel}</td>
                      <td className="p-3 text-sm w-[12%] space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleEditClick(tx)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => tx.id && handleDeleteClick(tx.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Xóa
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="p-4 text-center text-gray-500">
                  Không có giao dịch nào được tìm thấy.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal xác nhận xóa tùy chỉnh */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h4 className="text-xl font-bold text-gray-800 mb-4">
              Xác nhận xóa
            </h4>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa giao dịch này không? Hành động này không
              thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                disabled={loading}
              >
                {loading ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
