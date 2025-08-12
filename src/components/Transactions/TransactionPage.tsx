// // src/components/Transactions/TransactionPage.tsx
// import React from "react";
// import AddTransactionForm from "./AddTransactionForm";
// import TransactionList from "./TransactionList";
// import type { Transaction } from "../../types";

// interface TransactionPageProps {
//   userId: string;
//   transactions: Transaction[];
//   showMessage: (msg: string) => void;
//   loading: boolean;
//   setLoading: (loading: boolean) => void;
// }

// const TransactionPage: React.FC<TransactionPageProps> = ({
//   userId,
//   transactions,
//   showMessage,
//   loading,
//   setLoading,
// }) => {
//   return (
//     <div className="bg-white rounded-xl shadow-lg p-6">
//       {userId && (
//         <>
//           <AddTransactionForm userId={userId} showMessage={showMessage} />
//           <div className="my-6">
//             <div className="flex items-center space-x-2 text-sm text-slate-500">
//               <span className="font-semibold">ID người dùng:</span>
//               <span className="bg-slate-100 p-1 rounded-md">{userId}</span>
//             </div>
//           </div>
//           <TransactionList
//             transactions={transactions}
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

// export default TransactionPage;
