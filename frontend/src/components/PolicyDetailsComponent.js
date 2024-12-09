import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPolicies, updatePolicy, deletePolicy } from "../api/endpoint";
import update from "../assets/update.png";
import deleteimg from "../assets/deleteimg.png";
import "../styles/PolicyTable.css";
const PolicyDetailsPage = () => {
  const [policyAmount, setPolicyAmount] = useState("");
  const [policyStartDate, setPolicyStartDate] = useState("");
  const [policyMethod, setPolicyMethod] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    policy_amount: "",
    policy_start_date: "",
    policy_method: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const policies = await getPolicies();
        setPolicies(policies);
      } catch (error) {
        console.error("Error fetching policies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleRowClick = (policy) => {
    setSelectedPolicy(policy);
    setFormData({
      policy_amount: policy.policy_amount,
      policy_start_date: policy.policy_start_date,
      policy_method: policy.policy_method,
    });
    setModalVisible(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdatePolicy = async () => {
    try {
      console.log(selectedPolicy, "----------------------");
      // Ensure 'selectedPolicy.policy_no' is the correct ID
      const policyId = selectedPolicy.id; // Use the correct ID here

      if (!policyId) {
        throw new Error("Policy ID is missing.");
      }

      const updatedPolicy = {
        policy_amount: formData.policy_amount,
        policy_start_date: formData.policy_start_date,
        policy_method: formData.policy_method,
      };
      console.log(updatedPolicy, policyId, "==============");
      const response = await updatePolicy(policyId, updatedPolicy);
      console.log(response.status);
      if (response.status === 200) {
        alert("Policy updated successfully.");
        setModalVisible(false);
      } else {
        setError("Error updating policy.");
      }
    } catch (error) {
      console.error("Error updating policy:", error);
      setError("Error updating policy.");
    }
  };
  const handleDeletePolicy = async (policytoDelete) => {
    try {
      await deletePolicy(policytoDelete.id);
      alert("Policy deleted successfully.");
      setPolicies(policies.filter((policy) => policy.id !== policytoDelete.id)); // Remove deleted policy from the list
    } catch (error) {
      setError("Error deleting policy.");
      console.error("Error deleting policy:", error);
    }
  };
  if (loading) {
    return <div style={styles.loading}>Loading policies...</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Policy Details</h2>
      {message && <div style={styles.successMessage}>{message}</div>}
      {error && <div style={styles.errorMessage}>{error}</div>}

      {policies.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Policy No</th>
              <th style={styles.th}>Amount</th>
              <th style={styles.th}>Start Date</th>
              <th style={styles.th}>Next Due Date</th>
              <th style={styles.th}>Method</th>
              <th style={styles.th}>Reminder Date</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((policy) => (
              <tr key={policy.policy_no} style={styles.tr}>
                <td style={styles.td}>{policy.policy_no}</td>
                <td style={styles.td}>${policy.policy_amount}</td>
                <td style={styles.td}>
                  {formatDate(policy.policy_start_date)}
                </td>
                <td style={styles.td}>{formatDate(policy.next_due_date)}</td>
                <td style={styles.td}>{policy.policy_method}</td>
                <td style={styles.td}>{formatDate(policy.reminder_date)}</td>
                <td style={styles.td}>
                  <img
                    onClick={() => handleRowClick(policy)}
                    src={update}
                    className="update"
                    alt="update"
                  />
                  <img
                    onClick={() => handleDeletePolicy(policy)}
                    src={deleteimg}
                    className="delete"
                    alt="delete"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No policies available.</p>
      )}
      <button style={styles.backButton} onClick={() => navigate("/policy")}>
        Back to Add Policy
      </button>

      {modalVisible && (
        <div style={styles.modal}>
          <h3>Edit Policy</h3>
          <label>
            Policy Amount:
            <input
              type="number"
              name="policy_amount"
              value={formData.policy_amount}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Policy Start Date:
            <input
              type="date"
              name="policy_start_date"
              value={formData.policy_start_date}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Policy Method:
            <select
              name="policy_method"
              value={formData.policy_method}
              onChange={handleInputChange}
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="half_yearly">Half-Yearly</option>
              <option value="annual">Annual</option>
            </select>
          </label>
          <button onClick={handleUpdatePolicy}>Save</button>
          <button onClick={() => setModalVisible(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "black",
    borderRadius: "8px",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
    color: "white",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "20px",
  },
  th: {
    padding: "12px 15px",
    textAlign: "left",
    borderBottom: "1px solid #ddd",
    backgroundColor: "#4CAF50",
    color: "white",
  },
  td: {
    padding: "12px 15px",
    textAlign: "left",
    borderBottom: "1px solid #ddd",
    color: "white",
  },
  tr: {
    cursor: "pointer",
  },
  loading: {
    textAlign: "center",
    fontSize: "18px",
    color: "white",
  },
  backButton: {
    marginBottom: "20px",
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#007BFF",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    width: "22%",
    marginLeft: "36%",
  },
  modal: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.25)",
    zIndex: 1000,
  },
  successMessage: {
    color: "green",
    textAlign: "center",
    marginBottom: "10px",
  },
  errorMessage: {
    color: "red",
    textAlign: "center",
    marginBottom: "10px",
  },
};

export default PolicyDetailsPage;
