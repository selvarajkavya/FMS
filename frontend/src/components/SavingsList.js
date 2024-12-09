import React, { useEffect, useState } from "react";
import {
  getSavings,
  handleUpdateSavings,
  handleDeleteSavings,
} from "../api/endpoint"; // API functions
import "../styles/SavingsList.css";
import { useNavigate } from "react-router-dom";
import update from "../assets/update.png";
import deleteimg from "../assets/deleteimg.png";
const SavingsList = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSavings, setSelectedSavings] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    savings_category: "",
    savings_amount: "",
    date: "",
    reminder: "",
  });

  const fetchSavings = async () => {
    try {
      const data = await getSavings();
      console.log("Fetched savings:", data.savings);
      setSavings(data.savings);
    } catch (err) {
      setError("Failed to fetch savings data.");
    }
  };

  useEffect(() => {
    fetchSavings();
  }, []);

  const handleDelete = async (savingId) => {
    try {
      await handleDeleteSavings(savingId); // Call the delete API
      setSavings(savings.filter((saving) => saving.id !== savingId));
      alert("Savings deleted successfully!");
    } catch (err) {
      setError("Failed to delete saving.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      console.log(selectedSavings, "----------------------");
      const savingsId = selectedSavings;

      if (!savingsId) {
        throw new Error("Savings ID is missing.");
      }

      const updatedSavingsRequest = {
        savings_amount: formData.savings_amount,
        date: formData.date,
        savings_category: formData.savings_category,
        reminder: formData.reminder,
      };
      console.log(updatedSavingsRequest, savingsId, "==============");
      const response = await handleUpdateSavings(
        savingsId,
        updatedSavingsRequest
      );
      console.log(response.status);
      if (response.status === 200) {
        alert("Savings updated successfully.");
        await fetchSavings();
        setModalVisible(false);
      } else {
        setError("Error updating Savings.");
      }
    } catch (error) {
      console.error("Error updating Savings:", error);
      setError("Error updating Savings.");
    }
  };

  if (error) {
    return <p>{error}</p>;
  }

  const handleRowClick = (savings) => {
    console.log("varuthaa.....", savings);
    setSelectedSavings(savings);
    setFormData({
      savings_amount: savings.savings_amount,
      savings_category: savings.savings_category,
      date: savings.date,
      reminder: savings.reminder,
    });
    setModalVisible(true);
  };

  return (
    <div className="savings-list-container">
      <h2 style={{ color: "white" }} className="text-savings">
        Savings List
      </h2>
      <table className="savings-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Due Date</th>
            <th>Actions</th> {/* New Actions column */}
          </tr>
        </thead>
        <tbody>
          {savings.map((saving) => (
            <tr key={saving.id}>
              <td>{saving.savings_category}</td>
              <td>{saving.savings_amount}</td>
              <td>{saving.date}</td>
              <td>{saving.due_date}</td>
              <td>
                <img
                  onClick={() => handleRowClick(saving.id)}
                  src={update}
                  className="update"
                  alt="update"
                />
                <img
                  onClick={() => handleDelete(saving.id)}
                  src={deleteimg}
                  className="delete"
                  alt="delete"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="back-save-btn" onClick={() => navigate("/savings")}>
        Back to Savings
      </button>
      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h3>Edit Savings:</h3>
            <label>
              Amount:
              <input
                type="number"
                name="amount"
                value={formData.savings_amount}
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
              Savings Category:
              <select
                name="savings_category"
                value={formData.savings_category}
                onChange={handleInputChange}
              >
                <option value="rd">RD</option>
                <option value="sip">SIP</option>
                <option value="Jewel Advance">Jewel Advance</option>
                <option value="savings">Savings</option>
              </select>
            </label>
            <button onClick={handleUpdate}>Save</button>
            <button onClick={() => setModalVisible(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsList;
