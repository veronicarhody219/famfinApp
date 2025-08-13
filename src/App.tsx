// src/App.tsx
import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
// Sửa đường dẫn import để trỏ đến đúng vị trí của các component
import Dashboard from "./components/Dashboard/DashboardPage";
import TransactionPage from "./components/Transactions/TransactionPage";
import Login from "./components/Login";
import { db, auth, appId } from "./firebase/config";
import type { Transaction, MonthlyData } from "./types";

// Hàm tính toán dữ liệu hàng tháng với các kiểu dữ liệu rõ ràng
const calculateMonthlyTrend = (transactions: Transaction[]): MonthlyData[] => {
  // Định nghĩa kiểu cho monthlyData
  const monthlyData: { [key: string]: MonthlyData } = {};

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const month = date.toLocaleString("vi-VN", {
      month: "long",
      year: "numeric",
    });
    const amount = transaction.amount;
    // Chuyển đổi type về chữ thường để so sánh nhất quán
    const type = transaction.type.toLowerCase();

    if (!monthlyData[month]) {
      monthlyData[month] = { month, thu: 0, chi: 0, loiNhuan: 0 };
    }

    if (type === "thu") {
      monthlyData[month].thu += amount;
      monthlyData[month].loiNhuan += amount;
    } else {
      monthlyData[month].chi += amount;
      monthlyData[month].loiNhuan -= amount;
    }
  });

  return Object.values(monthlyData);
};

function App() {
  // --- STATE ---
  const [userId, setUserId] = useState<string | null>(null);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageTimeout, setMessageTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // --- EFFECT: Lắng nghe trạng thái xác thực và cập nhật userId ---
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setLoading(false);
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- EFFECT: Lắng nghe thay đổi trên Firestore
  useEffect(() => {
    if (!userId) {
      setAllTransactions([]);
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
      },
      (error) => {
        console.error("Lỗi khi fetch giao dịch: ", error);
        showMessage("Lỗi: Không thể tải giao dịch. Vui lòng kiểm tra console.");
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Sử dụng useMemo để tính toán monthlyTrend
  const monthlyTrend = useMemo(
    () => calculateMonthlyTrend(allTransactions),
    [allTransactions]
  );

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

  // --- Logic hiển thị component tương ứng ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-indigo-600 font-semibold">
          Đang tải ứng dụng...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8 px-4">
      {message && (
        <div className="fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-md transition-opacity duration-300 bg-green-500 text-white">
          {message}
        </div>
      )}

      {userId ? (
        <>
          <Dashboard
            transactions={allTransactions}
            monthlyTrend={monthlyTrend}
          />
          <hr className="my-8 border-t border-gray-300" />
          <TransactionPage
            userId={userId}
            transactions={allTransactions}
            showMessage={showMessage}
            loading={loading}
            setLoading={setLoading}
          />
        </>
      ) : (
        <Login onLogin={setUserId} />
      )}
    </div>
  );
}

export default App;
