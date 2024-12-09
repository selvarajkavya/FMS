import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login"; // Correct path for login
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import PolicyDetails from "./components/PolicyForm";
import LoanDetails from "./components/LoanDetails";
import IncomeExpense from "./components/IncomeExpense";
import PolicyDetailsPage from "./components/PolicyDetailsComponent";
import Savings from "./components/Savings";
import SavingsList from "./components/SavingsList";
import LoanList from "./components/LoanList";
import TransactionsTable from "./components/TransactionsTable";

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          {/* Layout is wrapping the Dashboard and other components */}
          <Route path="/" element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/policy" element={<PolicyDetails />} />
            <Route path="/get-policies" element={<PolicyDetailsPage />} />
            <Route path="/loan" element={<LoanDetails />} />
            <Route path="/loans/all" element={<LoanList />} />
            <Route path="/incomeExpense" element={<IncomeExpense />} />
            <Route path="/transactionsList" element={<TransactionsTable />} />
            <Route path="/savings" element={<Savings />} />
            <Route path="/savingsList" element={<SavingsList />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;
