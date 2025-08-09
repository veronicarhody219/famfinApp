// src/components/AddTransactionForm.tsx
import React, { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db, appId, auth } from "../firebase/config";
import Dashboard from "./Dashboard";

// Giao diện dữ liệu cho một giao dịch
interface Transaction {
  id?: string;
  amount: number;
  type: "Thu" | "Chi";
  description: string;
  date: string;
  account: string;
  purpose: string;
  category: string;
  member: string;
  channel: string;
}

// Định nghĩa một kiểu dữ liệu chung cho các phần tử form
type FormElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

// --- Dữ liệu tĩnh cho dropdowns và datalists ---
const transactionTypes = ["Chi", "Thu"];
const accounts = ["Tiền mặt", "Tài khoản ngân hàng", "Thẻ tín dụng"];
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

// Bổ sung các kênh và danh mục mới dựa trên phân tích SMS
const channels = [
  "Siêu thị",
  "Chợ",
  "Online",
  "Cửa hàng",
  "Rút tiền",
  "Chuyển khoản",
  "Lãi ngân hàng",
  "Khác",
];
const categoriesByPurpose: { [key: string]: string[] } = {
  "Ăn uống": ["Đi chợ", "Nhà hàng", "Cafe", "Đồ ăn vặt"],
  "Mua sắm": ["Quần áo", "Gia dụng", "Điện tử", "Mỹ phẩm"],
  "Hóa đơn": ["Điện", "Nước", "Internet", "Điện thoại"],
  "Giải trí": ["Xem phim", "Du lịch", "Thể thao", "Game"],
  "Sức khỏe": ["Thuốc men", "Khám bệnh", "Tập gym"],
  "Kinh doanh": ["Bán vật tư", "Bảo dưỡng máy", "Bán máy"],
  Khác: ["Phát sinh", "Lãi ngân hàng"],
};

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
    account: accounts[0],
    purpose: "Ăn uống",
    category: categoriesByPurpose["Ăn uống"][0],
    member: "Chồng",
    channel: channels[0],
  });

  const [smsContent, setSmsContent] = useState("");
  const [transactionsToReview, setTransactionsToReview] = useState<
    Transaction[]
  >([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [filterTerm, setFilterTerm] = useState("");
  const [editingTransactionId, setEditingTransactionId] = useState<
    string | null
  >(null);
  const [editingFormData, setEditingFormData] = useState<Transaction | null>(
    null
  );

  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);
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
    if (formData.purpose && categoriesByPurpose[formData.purpose]) {
      setFilteredCategories(categoriesByPurpose[formData.purpose]);
      setFormData((prevData) => ({
        ...prevData,
        category: categoriesByPurpose[formData.purpose][0],
      }));
    } else {
      setFilteredCategories([]);
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

  // --- HÀM PHÂN TÍCH SMS (ĐÃ CẬP NHẬT để hỗ trợ nhiều ngân hàng) ---

  const parseSms = (smsText: string): Transaction[] => {
    const parsedTransactions: Transaction[] = [];
    const combinedSeparator = new RegExp("~|\\n|SD\\s?TK\\d+.*?(?=\\n|$)", "g");
    const messages = smsText
      .split(combinedSeparator)
      .filter((msg) => msg.trim() !== "");

    messages.forEach((msg) => {
      let transaction: Transaction | null = null;
      let lowerCaseText = msg.toLowerCase();

      // Cố gắng phân tích tin nhắn VietinBank
      if (lowerCaseText.includes("vietinbank")) {
        const vietinbankRegex =
          /VietinBank:(\d{2}\/\d{2}\/\d{4}).*?GD:([+-])([\d,]+)VND.*?ND:(.*)/;
        const match = msg.match(vietinbankRegex);
        if (match) {
          const [, dateStr, sign, amountStr, description] = match;
          const [day, month, year] = dateStr.split("/");
          const date = `${year}-${month}-${day}`;
          const amount = parseFloat(amountStr.replace(/,/g, ""));
          const type = sign === "+" ? "Thu" : "Chi";

          let member = "Chồng";
          let channel = "Chuyển khoản";

          // Cố gắng phân loại danh mục dựa trên nội dung
          let purpose = "Khác";
          let category = "Phát sinh";
          if (lowerCaseText.includes("phi thuong nien")) {
            purpose = "Hóa đơn";
            category = "Phí thẻ";
            channel = "Thẻ tín dụng";
          } else if (type === "Thu") {
            purpose = "Kinh doanh";
            category = "Bán máy";
            channel = "Chuyển khoản";
          }

          transaction = {
            amount: amount,
            type: type,
            description: description.trim(),
            date: date,
            account: "Tài khoản ngân hàng",
            purpose: purpose,
            category: category,
            member: member,
            channel: channel,
          };
        }
      }

      // Cập nhật: Phân tích tin nhắn BIDV với biểu thức chính quy được cải thiện.
      else if (lowerCaseText.includes("bidv")) {
        // Biểu thức chính quy mới:
        // - Bao gồm cả định dạng ngày 2 và 4 chữ số.
        // - Chấp nhận cả dấu chấm hoặc dấu phẩy sau ngày.
        // - Xử lý khoảng trắng thừa sau ND:.
        const bidvRegex =
          /tai BIDV ([+-])([\d,]+)VND vao (\d{2}:\d{2})\s(\d{2}\/\d{2}\/(\d{2}|\d{4}))[.;].*?ND:\s*([\s\S]*)/;
        const match = msg.match(bidvRegex);

        if (match) {
          const [, sign, amountStr, , dateStrFull, yearPart, description] =
            match;

          // Xử lý định dạng ngày linh hoạt (DD/MM/YY hoặc DD/MM/YYYY)
          const dateParts = dateStrFull.split("/");
          let year = dateParts[2];
          if (year.length === 2) {
            year = `20${year}`;
          }
          const date = `${year}-${dateParts[1]}-${dateParts[0]}`;

          const amount = parseFloat(amountStr.replace(/,/g, ""));
          const type = sign === "+" ? "Thu" : "Chi";

          let member = "Chồng";
          let channel = "Chuyển khoản";

          // Cố gắng phân loại danh mục dựa trên nội dung
          let purpose = "Khác";
          let category = "Phát sinh";
          if (
            lowerCaseText.includes("tt tien lam them gio") ||
            lowerCaseText.includes("thanh toan tien luong")
          ) {
            purpose = "Khác";
            category = "Tiền lương";
          } else if (lowerCaseText.includes("chuyen tien")) {
            purpose = "Khác";
            category = "Chuyển khoản nội bộ";
          } else if (lowerCaseText.includes("chi khoan vpp")) {
            purpose = "Kinh doanh";
            category = "Văn phòng phẩm";
          } else if (lowerCaseText.includes("tt tien dien")) {
            purpose = "Hóa đơn";
            category = "Tiền điện";
          } else if (lowerCaseText.includes("phi thuong nien")) {
            purpose = "Hóa đơn";
            category = "Phí thẻ";
            channel = "Thẻ ngân hàng";
          } else if (lowerCaseText.includes("shopeepay")) {
            purpose = "Mua sắm";
            category = "Mua sắm online";
            channel = "Ví điện tử";
          } else if (lowerCaseText.includes("zalopay")) {
            purpose = "Mua sắm";
            category = "Mua sắm online";
            channel = "Ví điện tử";
          }

          transaction = {
            amount: amount,
            type: type,
            description: description.trim(),
            date: date,
            account: "Tài khoản ngân hàng",
            purpose: purpose,
            category: category,
            member: member,
            channel: channel,
          };
        }
      }

      if (transaction) {
        parsedTransactions.push(transaction);
      }
    });

    return parsedTransactions;
  };
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

  // --- INLINE EDITING ---
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
      const docRef = doc(
        db,
        `artifacts/${appId}/users/${userId}/transactions`,
        editingTransactionId
      );
      await updateDoc(docRef, {
        ...editingFormData,
        date: new Date(editingFormData.date),
      });
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

  // --- DELETE LOGIC (without modal) ---
  const handleDeleteClick = async (txId: string) => {
    if (!userId) return;
    try {
      const docRef = doc(
        db,
        `artifacts/${appId}/users/${userId}/transactions`,
        txId
      );
      await deleteDoc(docRef);
      showMessage("Giao dịch đã được xóa thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa giao dịch: ", error);
      showMessage("Lỗi: Không thể xóa giao dịch.");
    }
  };

  // --- SUBMIT LOGIC ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!userId) {
      showMessage("Lỗi: Không tìm thấy ID người dùng. Vui lòng thử lại.");
      setLoading(false);
      return;
    }

    try {
      const transactionsCollectionRef = collection(
        db,
        `artifacts/${appId}/users/${userId}/transactions`
      );

      if (transactionsToReview.length > 0) {
        await Promise.all(
          transactionsToReview.map((transaction) =>
            addDoc(transactionsCollectionRef, {
              ...transaction,
              date: new Date(transaction.date),
              timestamp: serverTimestamp(),
            })
          )
        );
        showMessage("Tất cả giao dịch đã được thêm thành công!");
        handleClearSms();
      } else {
        await addDoc(transactionsCollectionRef, {
          ...formData,
          date: new Date(formData.date),
          timestamp: serverTimestamp(),
        });
        showMessage("Giao dịch đã được thêm thành công!");
        setFormData((prevData) => ({
          ...prevData,
          amount: 0,
          description: "",
          date: new Date().toISOString().slice(0, 10),
          category: filteredCategories[0] || "",
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

  // Logic lọc giao dịch
  const filteredTransactions = allTransactions.filter(
    (tx) =>
      (tx.description || "").toLowerCase().includes(filterTerm.toLowerCase()) ||
      tx.amount.toString().includes(filterTerm) ||
      tx.type.toLowerCase().includes(filterTerm.toLowerCase()) ||
      (tx.purpose || "").toLowerCase().includes(filterTerm.toLowerCase()) ||
      (tx.category || "").toLowerCase().includes(filterTerm.toLowerCase()) ||
      (tx.member || "").toLowerCase().includes(filterTerm.toLowerCase()) ||
      (tx.channel || "").toLowerCase().includes(filterTerm.toLowerCase())
  );

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
              <div className="bg-indigo-50 p-4 rounded-md space-y-4 max-h-60 overflow-y-auto">
                <h4 className="font-bold text-indigo-800">
                  Xem Trước Giao Dịch ({transactionsToReview.length})
                </h4>
                <div className="overflow-x-auto rounded-md shadow-sm border border-indigo-200">
                  <table className="min-w-full table-auto">
                    <thead className="bg-white sticky top-0">
                      <tr>
                        <th className="p-3 text-left text-sm font-semibold text-slate-600">
                          Loại
                        </th>
                        <th className="p-3 text-left text-sm font-semibold text-slate-600">
                          Số Tiền (VND)
                        </th>
                        <th className="p-3 text-left text-sm font-semibold text-slate-600">
                          Ngày
                        </th>
                        <th className="p-3 text-left text-sm font-semibold text-slate-600">
                          Mô Tả
                        </th>
                        <th className="p-3 text-left text-sm font-semibold text-slate-600">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-200">
                      {transactionsToReview.map((tx, index) => (
                        <tr key={index} className="bg-white">
                          <td className="p-3 text-sm">
                            <select
                              name="type"
                              value={tx.type}
                              onChange={(e) => handleReviewChange(index, e)}
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
                            <input
                              type="number"
                              name="amount"
                              value={tx.amount}
                              onChange={(e) => handleReviewChange(index, e)}
                              className="w-full p-1 text-sm border rounded-md"
                            />
                          </td>
                          <td className="p-3 text-sm">
                            <input
                              type="date"
                              name="date"
                              value={tx.date}
                              onChange={(e) => handleReviewChange(index, e)}
                              className="w-full p-1 text-sm border rounded-md"
                            />
                          </td>
                          <td className="p-3 text-sm">
                            <textarea
                              name="description"
                              value={tx.description}
                              onChange={(e) => handleReviewChange(index, e)}
                              className="w-full p-1 text-sm border rounded-md"
                              rows={1}
                            />
                          </td>
                          <td className="p-3 text-sm">
                            <button
                              type="button"
                              onClick={() => handleDeleteReviewItem(index)}
                              className="text-red-500 hover:underline"
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

            {/* Các trường nhập liệu thủ công (chỉ hiện khi không có SMS) */}
            {transactionsToReview.length === 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Loại Giao Dịch
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      {transactionTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Số Tiền (VND)
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Ngày
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Tài khoản
                    </label>
                    <select
                      name="account"
                      value={formData.account}
                      onChange={handleChange}
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      {accounts.map((account) => (
                        <option key={account} value={account}>
                          {account}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Thành viên
                    </label>
                    <select
                      name="member"
                      value={formData.member}
                      onChange={handleChange}
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      {members.map((member) => (
                        <option key={member} value={member}>
                          {member}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Mục đích
                    </label>
                    <select
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleChange}
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      {purposes.map((purpose) => (
                        <option key={purpose} value={purpose}>
                          {purpose}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Danh mục
                    </label>
                    <input
                      type="text"
                      name="category"
                      list="category-list"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                    <datalist id="category-list">
                      {filteredCategories.map((category) => (
                        <option key={category} value={category} />
                      ))}
                    </datalist>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Kênh
                    </label>
                    <input
                      type="text"
                      name="channel"
                      list="channel-list"
                      value={formData.channel}
                      onChange={handleChange}
                      className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                    <datalist id="channel-list">
                      {channels.map((channel) => (
                        <option key={channel} value={channel} />
                      ))}
                    </datalist>
                  </div>
                </div>
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mô Tả
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    rows={2}
                    required
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white p-3 rounded-md font-semibold hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50"
              disabled={loading}
            >
              {loading
                ? "Đang xử lý..."
                : transactionsToReview.length > 0
                ? `Thêm Tất Cả Giao Dịch (${transactionsToReview.length})`
                : "Thêm Giao Dịch"}
            </button>
          </form>

          <hr className="my-6 border-t border-slate-200" />

          {/* Hiển thị và Lọc các giao dịch đã có */}
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
                    <th className="p-3 text-left text-sm font-semibold text-slate-600 w-1/12">
                      Ngày
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-slate-600 w-1/12">
                      Loại
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-slate-600 w-1/12">
                      Người thực hiện
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-slate-600 w-1/12">
                      Tài khoản
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-slate-600 w-2/12">
                      Số Tiền
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-slate-600 w-2/12">
                      Nội dung
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-slate-600 w-2/12">
                      Danh mục
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-slate-600 w-2/12">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-50 transition-colors duration-150"
                      >
                        {editingTransactionId === tx.id ? (
                          <>
                            <td className="p-2 text-sm">
                              <input
                                type="date"
                                name="date"
                                value={editingFormData?.date}
                                onChange={handleInlineChange}
                                className="w-full p-1 border rounded-md"
                              />
                            </td>
                            <td className="p-2 text-sm">
                              <select
                                name="type"
                                value={editingFormData?.type}
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
                            <td className="p-2 text-sm">
                              <select
                                name="member"
                                value={editingFormData?.member}
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
                            <td className="p-2 text-sm">
                              <input
                                type="text"
                                name="channel"
                                value={editingFormData?.channel}
                                onChange={handleInlineChange}
                                className="w-full p-1 text-sm border rounded-md"
                              />
                            </td>
                            <td className="p-2 text-sm">
                              <input
                                type="number"
                                name="amount"
                                value={editingFormData?.amount}
                                onChange={handleInlineChange}
                                className="w-full p-1 border rounded-md"
                              />
                            </td>
                            <td className="p-2 text-sm">
                              <textarea
                                name="description"
                                value={editingFormData?.description}
                                onChange={handleInlineChange}
                                className="w-full p-1 text-sm border rounded-md"
                                rows={1}
                              />
                            </td>
                            <td className="p-2 text-sm">
                              <input
                                type="text"
                                name="category"
                                list="category-list"
                                value={editingFormData?.category}
                                onChange={handleInlineChange}
                                className="w-full p-1 text-sm border rounded-md"
                              />
                            </td>
                            <td className="p-2 text-sm whitespace-nowrap">
                              <button
                                type="button"
                                onClick={handleSaveClick}
                                className="text-green-600 hover:text-green-900 mr-3"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 inline-block"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M7.707 10.293a1 1 0 010-1.414L10.586 6.5a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0z" />
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 11l3.293-3.293z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelClick}
                                className="text-red-600 hover:text-red-900"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 inline-block"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-3 text-sm text-slate-800 font-medium">
                              {tx.date}
                            </td>
                            <td className="p-3 text-sm font-medium">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  tx.type === "Chi"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {tx.type}
                              </span>
                            </td>
                            <td className="p-3 text-sm text-slate-600">
                              {tx.member}
                            </td>
                            <td className="p-3 text-sm text-slate-600">
                              {tx.channel}
                            </td>
                            <td
                              className={`p-3 text-sm font-bold ${
                                tx.type === "Chi"
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {tx.amount.toLocaleString("vi-VN")} VND
                            </td>
                            <td className="p-3 text-sm text-slate-600">
                              {tx.description}
                            </td>
                            <td className="p-3 text-sm text-slate-600">
                              {tx.category}
                            </td>
                            <td className="p-3 text-sm whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleEditClick(tx)}
                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 inline-block"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                  <path
                                    fillRule="evenodd"
                                    d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  tx.id && handleDeleteClick(tx.id)
                                }
                                className="text-red-600 hover:text-red-900"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 inline-block"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="p-4 text-center text-slate-500"
                      >
                        Không có giao dịch nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AddTransactionForm;
