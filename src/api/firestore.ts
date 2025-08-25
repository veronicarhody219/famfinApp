// src/api/firestore.ts
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db, appId } from "../firebase/config";
import type { Transaction } from "../types";

const getCollectionPath = (userId: string) => {
  return `artifacts/${appId}/users/${userId}/transactions`;
};

const getRulesCollectionPath = (userId: string) => {
  return `artifacts/${appId}/users/${userId}/rules`;
};

/**
 * Cập nhật một giao dịch hiện có trong Firestore.
 * @param transactionId ID của giao dịch cần cập nhật.
 * @param userId ID người dùng.
 * @param updatedData Dữ liệu mới của giao dịch.
 * @returns Promise<void>
 */
export const updateTransaction = async (
  transactionId: string,
  userId: string,
  data: Transaction
) => {
  const transactionRef = doc(
    db,
    `artifacts/${appId}/users/${userId}/transactions/${transactionId}`
  );
  await updateDoc(transactionRef, {
    ...data,
    date: data.date,
    timestamp: serverTimestamp(),
  });
};

/**
 * Xóa một giao dịch khỏi Firestore.
 * @param transactionId ID của giao dịch cần xóa.
 * @param userId ID người dùng.
 * @returns Promise<void>
 */
export const deleteTransaction = async (
  transactionId: string,
  userId: string
): Promise<void> => {
  const docRef = doc(
    db,
    `artifacts/${appId}/users/${userId}/transactions`,
    transactionId
  );
  await deleteDoc(docRef);
};

/**
 * Thêm một hoặc nhiều giao dịch vào Firestore.
 * @param transactions Mảng các giao dịch cần thêm.
 * @param userId ID người dùng.
 * @returns Promise<void>.
 */
export const addTransactions = async (
  transactions: Transaction[],
  userId: string
) => {
  const transactionsRef = collection(
    db,
    `artifacts/${appId}/users/${userId}/transactions`
  );

  const promises = transactions.map((tx) =>
    addDoc(transactionsRef, {
      ...tx,
      date: tx.date || new Date().toISOString().slice(0, 10),
      timestamp: serverTimestamp(),
    })
  );

  await Promise.all(promises);
};

/**
 * Lắng nghe các thay đổi trong bộ sưu tập giao dịch của người dùng.
 * @param userId ID của người dùng hiện tại.
 * @param onUpdateCallback Hàm callback được gọi mỗi khi có dữ liệu mới.
 * @returns Hàm unsubscribe để hủy lắng nghe.
 */
export const subscribeToTransactions = (
  userId: string,
  onUpdateCallback: (transactions: Transaction[]) => void
) => {
  const collectionRef = collection(db, getCollectionPath(userId));
  const q = query(collectionRef);

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const fetchedTransactions: Transaction[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<Transaction, "id">;
        fetchedTransactions.push({
          id: doc.id,
          ...data,
          date: (data.date as any).toDate().toISOString().split("T")[0],
        });
      });
      // Sort by date descending (recent first)
      fetchedTransactions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      onUpdateCallback(fetchedTransactions);
    },
    (error) => {
      console.error("Lỗi khi lắng nghe giao dịch:", error);
    }
  );

  return unsubscribe;
};

/**
 * Lưu quy tắc phân loại vào Firestore.
 * @param userId ID người dùng.
 * @param description Mô tả giao dịch (keyword).
 * @param category Danh mục.
 * @param purpose Mục đích.
 * @returns Promise<void>
 */
export const saveCategoryRule = async (
  userId: string,
  description: string,
  category: string,
  purpose: string
) => {
  if (!userId) {
    throw new Error("User ID is required to save rules.");
  }
  const rulesRef = collection(db, getRulesCollectionPath(userId));
  await addDoc(rulesRef, {
    description: description.toLowerCase(),
    category,
    purpose,
    timestamp: serverTimestamp(),
  });
};

/**
 * Lấy quy tắc phân loại của người dùng từ Firestore.
 * @param userId ID người dùng.
 * @returns Promise<{ [key: string]: { category: string; purpose: string } }>
 */
export const getCategoryRules = async (
  userId: string
): Promise<{
  [key: string]: { category: string; purpose: string; member: string };
}> => {
  const rulesRef = collection(db, getRulesCollectionPath(userId));
  const snapshot = await getDocs(query(rulesRef));
  const rules: {
    [key: string]: { category: string; purpose: string; member: string };
  } = {};
  snapshot.forEach((doc) => {
    const data = doc.data() as {
      description: string;
      category: string;
      purpose: string;
      member: string;
    };
    rules[data.description] = {
      category: data.category,
      purpose: data.purpose,
      member: data.member,
    };
  });
  return rules;
};
