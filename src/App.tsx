// src/App.tsx

import Header from "./components/Header";
import AddTransactionForm from "./components/AddTransactionForm";

function App() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Header />

      <AddTransactionForm />
    </div>
  );
}

export default App;
