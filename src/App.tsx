import { useState, useEffect, useMemo } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import DashboardPage from "./components/Dashboard/DashboardPage";
import TransactionPage from "./components/Transactions/TransactionPage";
import ReportsPage from "./components/Reports/ReportsPage"; // Import mới cho tab Biểu đồ
import TabView from "./components/Shared/TabView"; // Import TabView
import Login from "./components/Login";
import { db, auth, appId } from "./firebase/config";
import type { Transaction, MonthlyData } from "./types";

// Hàm tính toán dữ liệu hàng tháng (giữ nguyên)
const calculateMonthlyTrend = (transactions: Transaction[]): MonthlyData[] => {
  const monthlyData: { [key: string]: MonthlyData } = {};

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const month = date.toLocaleString("vi-VN", {
      month: "long",
      year: "numeric",
    });
    const amount = transaction.amount;
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
  const [activeTab, setActiveTab] = useState("dashboard"); // State mới cho tabs

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
  // useEffect(() => {
  //   if (!userId) {
  //     setAllTransactions([]);
  //     return;
  //   }

  //   const transactionsQuery = query(
  //     collection(db, `artifacts/${appId}/users/${userId}/transactions`)
  //   );

  //   const unsubscribe = onSnapshot(
  //     transactionsQuery,
  //     (snapshot) => {
  //       const fetchedTransactions: Transaction[] = [];
  //       snapshot.forEach((doc) => {
  //         const data = doc.data() as Omit<Transaction, "date" | "timestamp"> & {
  //           date: { toDate: () => Date };
  //           timestamp: any;
  //         };
  //         const transactionDate = data.date.toDate().toISOString().slice(0, 10);
  //         fetchedTransactions.push({
  //           id: doc.id,
  //           ...data,
  //           date: transactionDate,
  //           timestamp: data.timestamp
  //             ? new Date(data.timestamp.seconds * 1000).toISOString()
  //             : "", // Convert Timestamp thành string
  //         });
  //       });
  //       fetchedTransactions.sort(
  //         (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  //       );
  //       setAllTransactions(fetchedTransactions);
  //     },
  //     (error) => {
  //       console.error("Lỗi khi fetch giao dịch: ", error);
  //       showMessage("Lỗi: Không thể tải giao dịch. Vui lòng kiểm tra console.");
  //     }
  //   );

  //   return () => unsubscribe();
  // }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const transactionsRef = collection(
      db,
      `artifacts/${appId}/users/${userId}/transactions`
    );

    const unsubscribe = onSnapshot(transactionsRef, (snapshot) => {
      const fetchedTransactions: Transaction[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as Omit<Transaction, "date" | "timestamp"> & {
          date: any; // Tạm để xử lý nhiều type
          timestamp: any;
        };
        let transactionDate = "";
        if (data.date && typeof data.date === "string") {
          // Nếu date là string, kiểm tra format
          const parsedDate = new Date(data.date);
          if (!isNaN(parsedDate.getTime())) {
            transactionDate = parsedDate.toISOString().slice(0, 10);
          } else {
            console.warn(
              `Invalid date format for transaction ${doc.id}: ${data.date}`
            );
            transactionDate = new Date().toISOString().slice(0, 10); // Fallback
          }
        } else if (data.date && typeof data.date.toDate === "function") {
          // Nếu date là Firestore Timestamp
          const parsedDate = data.date.toDate();
          if (!isNaN(parsedDate.getTime())) {
            transactionDate = parsedDate.toISOString().slice(0, 10);
          } else {
            console.warn(
              `Invalid Firestore Timestamp for transaction ${doc.id}`
            );
            transactionDate = new Date().toISOString().slice(0, 10); // Fallback
          }
        } else {
          console.warn(`Missing or invalid date for transaction ${doc.id}`);
          transactionDate = new Date().toISOString().slice(0, 10); // Fallback
        }

        fetchedTransactions.push({
          id: doc.id,
          ...data,
          date: transactionDate,
          timestamp:
            data.timestamp && typeof data.timestamp.toDate === "function"
              ? data.timestamp.toDate().toISOString()
              : data.timestamp || "",
        });
      });
      setAllTransactions(fetchedTransactions);
    });

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
          <TabView activeTab={activeTab} setActiveTab={setActiveTab} />{" "}
          {/* Thêm TabView */}
          {activeTab === "dashboard" && (
            <DashboardPage transactions={allTransactions} />
          )}
          {activeTab === "reports" && (
            <ReportsPage transactions={allTransactions} />
          )}
          {activeTab === "transactions" && (
            <TransactionPage
              userId={userId}
              transactions={allTransactions}
              showMessage={showMessage}
              loading={loading}
              setLoading={setLoading}
            />
          )}
        </>
      ) : (
        <Login onLogin={setUserId} />
      )}
    </div>
  );
}

export default App;
