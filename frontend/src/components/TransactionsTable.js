import React, { useEffect, useState } from "react";
import {
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "../api/endpoint"; // Import the API call for deletion
import { useNavigate } from "react-router-dom";
import "../styles/TransactionTable.css";
import update from "../assets/update.png";
import deleteimg from "../assets/deleteimg.png";
const TransactionsTable = () => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    amount: "",
    transction_type: "",
    description: "",
  });
  // Fetch transactions data when the component mounts
  // useEffect(() => {
  //   const fetchTransactions = async () => {
  //     try {
  //       const data = await getTransactions(); // Fetch transactions data
  //       setTransactions(data);
  //     } catch (error) {
  //       console.error("Error fetching transactions:", error);
  //     }
  //   };

  //   fetchTransactions();
  // }, []);

  const fetchTransactions = async () => {
    try {
      const data = await getTransactions(); // Fetch transactions data
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    // Fetch transactions when the component mounts
    fetchTransactions();
  }, []);

  const handleRowClick = (transaction) => {
    console.log("varuthaa.....", transaction);
    setSelectedTransaction(transaction);
    setFormData({
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date,
      transaction_type: transaction.transaction_type,
    });
    setModalVisible(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateTransaction = async () => {
    try {
      console.log(selectedTransaction, "----------------------");
      const transactionId = selectedTransaction.id;

      if (!transactionId) {
        throw new Error("Policy ID is missing.");
      }

      const updatedTransactionRequest = {
        amount: formData.amount,
        date: formData.date,
        transaction_type: formData.transaction_type,
        description: formData.description,
      };
      console.log(updatedTransactionRequest, transactionId, "==============");
      const response = await updateTransaction(
        transactionId,
        updatedTransactionRequest
      );
      console.log(response.status);
      if (response.status === 200) {
        alert("Policy updated successfully.");
        setModalVisible(false);
        await fetchTransactions();
      } else {
        setError("Error updating policy.");
      }
    } catch (error) {
      console.error("Error updating policy:", error);
      setError("Error updating policy.");
    }
  };

  const handleDeleteTransaction = async (transactiontoDelete) => {
    console.log(transactiontoDelete);
    try {
      await deleteTransaction(transactiontoDelete.id);
      alert("Transactions deleted successfully.");
      setTransactions(
        transactions.filter(
          (transaction) => transaction.id !== transactiontoDelete.id
        )
      ); // Remove deleted policy from the list
    } catch (error) {
      setError("Error deleting transactions.");
      console.error("Error deleting transactions:", error);
    }
  };

  return (
    <div className="transactions-table-container">
      <h2 style={{ color: "white" }}>Transaction List</h2>
      <table className="transactions-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Description</th>
            <th>Transaction Type</th>
            <th>Actions</th> {/* Added Actions column */}
          </tr>
        </thead>
        <tbody>
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.date}</td>
                <td>{transaction.amount}</td>
                <td>{transaction.description}</td>
                <td>{transaction.transaction_type}</td>
                <td className="updel" style={{ display: "flex" }}>
                  <img
                    onClick={() => handleRowClick(transaction)}
                    src={update}
                    className="update"
                    alt="update"
                  />
                  <img
                    onClick={() => handleDeleteTransaction(transaction)}
                    src={deleteimg}
                    className="delete"
                    alt="delete"
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No transactions available</td>
            </tr>
          )}
        </tbody>
      </table>
      <button
        className="back-transaction"
        onClick={() => navigate("/incomeExpense")}
      >
        Back to Transaction
      </button>
      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h3>Edit Transaction:</h3>
            <label>
              Amount:
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Date:
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Transaction Type:
              <select
                name="transaction_type"
                value={formData.transaction_type}
                onChange={handleInputChange}
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="investment">Investment</option>
                <option value="savings">Savings</option>
              </select>
            </label>
            <button onClick={handleUpdateTransaction}>Save</button>
            <button onClick={() => setModalVisible(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsTable;
