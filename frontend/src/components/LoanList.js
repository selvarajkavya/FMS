import React, { useState, useEffect } from "react";
import { getLoanReminders, updateLoan, deleteLoan } from "../api/endpoint";
import "../styles/LoanList.css";
import { useLocation, useNavigate } from "react-router-dom";
import update from "../assets/update.png";
import deleteimg from "../assets/deleteimg.png";
const LoanList = () => {
  const [loan, setLoan] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [loanReminders, setLoanReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    loan_type: "",
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpdateLoan = async () => {
    console.log(selectedLoan);
    try {
      const loanId = selectedLoan.id; // Use the correct ID here

      if (!loanId) {
        throw new Error("Loan ID is missing.");
      }

      const updatedLoan = {
        loan_type: formData.loan_type,
      };
      console.log(updatedLoan, loanId, "==============");
      const response = await updateLoan(loanId, updatedLoan);
      console.log(response.status, "------------");
      if (response.status === 200) {
        setMessage("Loan updated successfully.");
        alert("Loan updated successfully!");
        setModalVisible(false);
        await fetchLoanReminders();
      } else {
        setError("Error updating Loan.");
      }
    } catch (error) {
      console.error("Error updating Loan:", error);
      setError("Error updating Loan.");
    }
  };

  const handleRowClick = (loan) => {
    console.log("uuuuuuuuuuuuuuuuuuuuuuuuuuuuu");
    setSelectedLoan(loan);
    setFormData({
      loan_type: loan.loan_type,
    });
    setModalVisible(true);
  };

  const handleDeleteLoan = async (loantoDelete) => {
    try {
      await deleteLoan(loantoDelete.id);
      alert("Loan deleted successfully.");
      await fetchLoanReminders();
      // setLoan(loan.filter((loans) => loans.id !== loantoDelete.id));
    } catch (error) {
      setError("Error deleting Loan.");
      console.error("Error deleting Loan:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchLoanReminders = async () => {
    try {
      const data = await getLoanReminders();
      setLoanReminders(data.loans); // Use "loans" from response, not "reminders"
    } catch (err) {
      setError("Failed to load loan reminders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch loan reminders when the component mounts
    fetchLoanReminders();

    // If newLoan is passed from the previous page, add it to the list
    if (location.state?.newLoan) {
      setLoanReminders((prevLoans) => [...prevLoans, location.state.newLoan]);
    }
  }, [location.state]);

  if (loading) {
    return <p>Loading loan reminders...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="loan-list-container">
      <h2>Loan Reminders</h2>
      <table className="loan-list-table">
        <thead>
          <tr>
            <th>Loan Category</th>
            <th>Loan Type</th>
            <th>Loan Amount</th>
            <th>Loan Due Date</th>
            <th>Next Due Date</th>
            <th>Actions</th> {/* New Actions Column */}
          </tr>
        </thead>
        <tbody>
          {loanReminders.length > 0 ? (
            loanReminders.map((loan) => (
              <tr key={loan.id}>
                <td>{loan.loan_category}</td>
                <td>{loan.loan_type}</td>
                <td>{loan.loan_amount}</td>
                <td>{loan.loan_due_date}</td>
                <td>{loan.next_due_date}</td>
                <td className="updel">
                  <img
                    onClick={() => handleRowClick(loan)}
                    src={update}
                    className="update"
                    alt="update"
                  />
                  <img
                    onClick={() => handleDeleteLoan(loan)}
                    src={deleteimg}
                    className="delete"
                    alt="delete"
                  />
                </td>{" "}
                {/* Add Update and Delete buttons */}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No loan reminders found</td>{" "}
              {/* Adjust column span to 6 */}
            </tr>
          )}
        </tbody>
      </table>
      <button className="back-loan" onClick={() => navigate("/loan")}>
        Back to Loan
      </button>
      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Loan</h3>
              <span
                className="modal-close"
                onClick={() => setModalVisible(false)}
              >
                &times;
              </span>
            </div>
            <label>
              Loan Method:
              <select
                name="loan_type"
                value={formData.loan_type}
                onChange={handleInputChange}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="half_yearly">Half-Yearly</option>
                <option value="annual">Annual</option>
              </select>
            </label>
            <button onClick={() => handleUpdateLoan()}>Save</button>
            <button onClick={() => setModalVisible(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanList;
