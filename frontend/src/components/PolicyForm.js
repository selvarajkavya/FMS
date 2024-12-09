import React, { useState } from "react";
import { addPolicy, getPolicies } from "../api/endpoint"; // Import the API function
import "../styles/PolicyForm.css"; // Make sure to import your updated CSS file
import { useNavigate } from "react-router-dom";

const AddPolicyComponent = () => {
  const [policyData, setPolicyData] = useState({
    policy_no: "",
    policy_amount: "",
    start_date: "",
    policy_due_date: "",
    policy_method: "monthly",
    next_due_date: "",
  });

  const [modalMessage, setModalMessage] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Utility function to calculate due date
  const calculateDueDate = (startDate, method) => {
    if (!startDate) return ""; // Return empty if no start date is provided

    const date = new Date(startDate); // Create a date object from the start date

    // Add months based on the policy method
    switch (method) {
      case "monthly":
        date.setMonth(date.getMonth() + 1);
        break;
      case "quarterly":
        date.setMonth(date.getMonth() + 3);
        break;
      case "half_yearly":
        date.setMonth(date.getMonth() + 6);
        break;
      case "annual":
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        break;
    }

    return date.toISOString().split("T")[0]; // Format the date to YYYY-MM-DD
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Update policy data
    setPolicyData((prevData) => {
      const updatedData = { ...prevData, [name]: value };

      // Automatically calculate due date when start_date or policy_method changes
      if (name === "start_date" || name === "policy_method") {
        updatedData.policy_due_date = calculateDueDate(
          updatedData.start_date,
          updatedData.policy_method
        );
      }

      return updatedData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await addPolicy(policyData);
      if (response) {
        setModalMessage("Policy added successfully!");
        // goToPolicyTable();
      }
    } catch (error) {
      // Enhanced error handling
      setModalMessage(
        error.response ? error.response.data.detail : "Network or server error"
      );
    }
    setIsModalVisible(true);
  };

  const handleShowPolicies = async () => {
    try {
      const policies = await getPolicies();
      navigate("/get-policies", { state: { policies } });
    } catch (error) {
      console.error("Error fetching policies:", error);
      alert("Failed to fetch policies.");
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setModalMessage("");
  };

  const navigate = useNavigate();

  return (
    <div className="add-policy-container">
      <h2 className="head">Add Policy</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label className="policyLabel">Policy No:</label>
          <input
            type="text"
            name="policy_no"
            value={policyData.policy_no}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label className="policyLabel">Amount:</label>
          <input
            type="number"
            name="policy_amount"
            value={policyData.policy_amount}
            onChange={handleInputChange}
            required
            min="0"
          />
        </div>
        <div>
          <label className="policyLabel">Start Date:</label>
          <input
            type="date"
            name="start_date"
            value={policyData.start_date}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label className="policyLabel">Next Due Date:</label>
          <input
            type="date"
            name="policy_due_date"
            value={policyData.policy_due_date}
            onChange={handleInputChange}
            readOnly
          />
        </div>
        <div>
          <label className="policyLabel">Method:</label>
          <select
            name="policy_method"
            value={policyData.policy_method}
            onChange={handleInputChange}
            required
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="half_yearly">Half Yearly</option>
            <option value="annual">Annual</option>
          </select>
        </div>
        <button className="add-btn" type="submit">
          Add Policy
        </button>
        <button type="button" className="add-btn" onClick={handleShowPolicies}>
          Show Policies
        </button>
      </form>

      {/* Modal Display */}
      {isModalVisible && (
        <div className="modal">
          <div className="modal-content">
            <p>{modalMessage}</p>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddPolicyComponent;
