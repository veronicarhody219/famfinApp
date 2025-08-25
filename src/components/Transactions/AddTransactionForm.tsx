// src/components/Transactions/AddTransactionForm.tsx
import React, { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { addTransactions, saveCategoryRule } from "../../api/firestore"; // Add saveCategoryRule
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

interface AddTransactionFormProps {
  userId: string;
  showMessage: (msg: string) => void;
}

const AddTransactionForm: React.FC<AddTransactionFormProps> = ({
  userId,
  showMessage,
}) => {
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

  useEffect(() => {
    if (formData.purpose && CATEGORIES_BY_PURPOSE[formData.purpose]) {
      setFormData((prevData) => ({
        ...prevData,
        category: CATEGORIES_BY_PURPOSE[prevData.purpose][0],
      }));
    }
  }, [formData.purpose]);

  useEffect(() => {
    const parse = async () => {
      if (smsContent.trim() !== "") {
        setLoading(true);
        try {
          const parsed = await parseSms(smsContent); // Use async parseSms
          setTransactionsToReview(parsed);
        } catch (error) {
          showMessage("Lỗi khi phân tích SMS. Vui lòng thử lại.");
        } finally {
          setLoading(false);
        }
      } else {
        setTransactionsToReview([]);
      }
    };
    parse();
  }, [smsContent, showMessage]);

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

  const handleSaveRule = async (index: number) => {
    const tx = transactionsToReview[index];
    try {
      await saveCategoryRule(userId, tx.description, tx.category, tx.purpose);
      showMessage("Đã lưu quy tắc phân loại!");
    } catch (error) {
      showMessage("Lỗi khi lưu quy tắc phân loại.");
    }
  };

  const handleClearSms = () => {
    setSmsContent("");
    setTransactionsToReview([]);
  };

  const handleDeleteReviewItem = (index: number) => {
    const newTransactions = transactionsToReview.filter((_, i) => i !== index);
    setTransactionsToReview(newTransactions);
  };

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
          disabled={loading}
        />
        {smsContent.trim() && (
          <button
            type="button"
            onClick={handleClearSms}
            className="mt-2 text-sm text-red-600 hover:underline"
            disabled={loading}
          >
            Xóa SMS
          </button>
        )}
      </div>

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
                        disabled={loading}
                      />
                    </td>
                    <td className="p-3 text-sm min-w-[80px]">
                      <select
                        name="type"
                        value={tx.type}
                        onChange={(e) => handleReviewChange(index, e)}
                        className="w-full p-1 text-sm border rounded-md"
                        disabled={loading}
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
                        disabled={loading}
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
                        disabled={loading}
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
                        disabled={loading}
                      />
                    </td>
                    <td className="p-3 text-sm min-w-[200px]">
                      <textarea
                        name="description"
                        value={tx.description}
                        onChange={(e) => handleReviewChange(index, e)}
                        className="w-full p-1 text-sm border rounded-md"
                        rows={1}
                        disabled={loading}
                      />
                    </td>
                    <td className="p-3 text-sm min-w-[100px]">
                      <select
                        name="purpose"
                        value={tx.purpose}
                        onChange={(e) => handleReviewChange(index, e)}
                        className="w-full p-1 text-sm border rounded-md"
                        disabled={loading}
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
                        disabled={loading}
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
                        disabled={loading}
                      >
                        {CHANNELS.map((channel) => (
                          <option key={channel} value={channel}>
                            {channel}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 text-sm min-w-[120px] space-x-2">
                      <button
                        type="button"
                        onClick={() => handleSaveRule(index)}
                        className="text-green-600 hover:text-green-800"
                        disabled={loading}
                      >
                        Lưu Quy Tắc
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteReviewItem(index)}
                        className="text-red-600 hover:text-red-800"
                        disabled={loading}
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
          {/* Existing form fields */}
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
              disabled={loading}
            />
          </div>
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
              disabled={loading}
            >
              {TRANSACTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
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
              disabled={loading}
            />
          </div>
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
              disabled={loading}
            >
              {ACCOUNTS.map((account) => (
                <option key={account} value={account}>
                  {account}
                </option>
              ))}
            </select>
          </div>
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
              disabled={loading}
            >
              {MEMBERS.map((member) => (
                <option key={member} value={member}>
                  {member}
                </option>
              ))}
            </select>
          </div>
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
              disabled={loading}
            >
              {PURPOSES.map((purpose) => (
                <option key={purpose} value={purpose}>
                  {purpose}
                </option>
              ))}
            </select>
          </div>
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
              disabled={loading}
            >
              {CATEGORIES_BY_PURPOSE[formData.purpose]?.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
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
              disabled={loading}
            >
              {CHANNELS.map((channel) => (
                <option key={channel} value={channel}>
                  {channel}
                </option>
              ))}
            </select>
          </div>
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
              disabled={loading}
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
