import React, { useState } from "react";
import { addLoan, getLoanReminders } from "../api/endpoint";
import "../styles/LoanDetails.css";
import { useNavigate } from "react-router-dom";
const AddLoan = () => {
  const navigate = useNavigate();
  const [loanDetails, setLoanDetails] = useState({
    loan_category: "",
    loan_type: "",
    loan_amount: "",
    loan_due_date: "",
  });

  const [modalMessage, setModalMessage] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleChange = (e) => {
    setLoanDetails({
      ...loanDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addLoan(loanDetails);
      alert("Loan added successfully!");

      // navigate("loans/all/", { state: { newLoan: loanDetails } });
      setLoanDetails({
        loan_category: "",
        loan_type: "",
        loan_amount: "",
        loan_due_date: "",
      });
    } catch (error) {
      setModalMessage("Failed to add loan. Please try again.");
    }
    setIsModalVisible(true); // Show the modal
  };
  const handleShowLoan = async () => {
    try {
      const policies = await getLoanReminders();
      navigate("/loans/all", { state: { policies } });
    } catch (error) {
      console.error("Error fetching policies:", error);
      alert("Failed to fetch policies.");
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setModalMessage("");
  };

  return (
    <div className="add-loan-container">
      <h2>Add Loan</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="loan-label" htmlFor="loan_category">
            Loan Category
          </label>
          <select
            id="loan_category"
            name="loan_category"
            value={loanDetails.loan_category}
            onChange={handleChange}
            required
          >
            <option value="">Select Loan Category</option>
            <option value="Home Loan">Home Loan</option>
            <option value="Personal Loan">Personal Loan</option>
            <option value="Education Loan">Education Loan</option>
            <option value="Car Loan">Car Loan</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="loan_type" className="loan-label">
            Loan Type
          </label>
          <select
            id="loan_type"
            name="loan_type"
            value={loanDetails.loan_type}
            onChange={handleChange}
            required
          >
            <option value="">Select Loan Type</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Half-Yearly">Half-Yearly</option>
            <option value="Annual">Annual</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="loan_amount" className="loan-label">
            Loan Amount
          </label>
          <input
            type="number"
            id="loan_amount"
            name="loan_amount"
            value={loanDetails.loan_amount}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="loan_due_date" className="loan-label">
            Loan Due Date
          </label>
          <input
            type="date"
            id="loan_due_date"
            name="loan_due_date"
            value={loanDetails.loan_due_date}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Add Loan
        </button>
        <button type="button" className="add-btn" onClick={handleShowLoan}>
          Show Loan
        </button>
      </form>

      {/* {isModalVisible && (
        <div className="modal">
          <div className="modal-content">
            <p>{modalMessage}</p>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default AddLoan;
