// src/api/firestore.ts
// import {
//   doc,
//   deleteDoc,
//   updateDoc,
//   type DocumentData,
//   collection,
//   addDoc,
//   serverTimestamp,
// } from "firebase/firestore";
// import { db, appId } from "../firebase/config";
// import type { Transaction } from "../types";

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  type DocumentData,
  serverTimestamp,
} from "firebase/firestore";
import { db, appId } from "../firebase/config";
import { type Transaction } from "../types";

const getCollectionPath = (userId: string) => {
  // Thay thế 'expense-tracker-app' bằng tên dự án thực tế của bạn
  return `artifacts/${appId}/users/${userId}/transactions`;
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
  updatedData: Transaction
): Promise<void> => {
  const dataToSend = {
    ...updatedData,
    date: new Date(updatedData.date),
  };

  const docRef = doc(
    db,
    `artifacts/${appId}/users/${userId}/transactions`,
    transactionId
  );
  await updateDoc(docRef, dataToSend as DocumentData);
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
): Promise<void> => {
  if (!userId) {
    throw new Error("User ID is required to add transactions.");
  }

  const transactionsCollectionRef = collection(
    db,
    `artifacts/${appId}/users/${userId}/transactions`
  );

  await Promise.all(
    transactions.map((transaction) =>
      addDoc(transactionsCollectionRef, {
        ...transaction,
        date: new Date(transaction.date),
        timestamp: serverTimestamp(),
      })
    )
  );
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
          // Chuyển đổi đối tượng Timestamp thành chuỗi 'YYYY-MM-DD'
          date: (data.date as any).toDate().toISOString().split("T")[0],
        });
      });
      onUpdateCallback(fetchedTransactions);
    },
    (error) => {
      console.error("Lỗi khi lắng nghe giao dịch:", error);
    }
  );

  return unsubscribe;
};
