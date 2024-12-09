import React, { useState, useEffect } from "react";
import { addSavings, getSavings } from "../api/endpoint"; // Import the addSavings API function
import "../styles/Savings.css";
import { useNavigate } from "react-router-dom";

const SavingsForm = () => {
  const navigate = useNavigate();
  const [savingsCategory, setSavingsCategory] = useState("");
  const [savingsAmount, setSavingsAmount] = useState("");
  const [date, setDate] = useState("");
  const [dueDate, setDueDate] = useState(""); // State to store the due date
  const [reminder, setReminder] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Helper function to format the reminder date as YYYY-MM-01
  const formatReminderDate = () => {
    const currentDate = new Date();
    return `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-01`; // Reminder set to the 1st of the current month
  };

  // Function to auto-populate the due date (e.g., 30 days from the selected date)
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);

    // Set the due date to 30 days after the selected date (you can modify this logic as needed)
    const dueDateObj = new Date(selectedDate);
    dueDateObj.setDate(dueDateObj.getDate() + 30); // Adds 30 days to the selected date
    setDueDate(dueDateObj.toISOString().split("T")[0]); // Format due date as YYYY-MM-DD
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the data to be sent to the backend
    const savingsData = {
      savings_category: savingsCategory,
      savings_amount: savingsAmount,
      date: date,
      reminder: reminder ? formatReminderDate() : null, // Set reminder to the 1st of the month if checked
      due_date: dueDate, // Include the due date
    };

    try {
      // Use the addSavings API function to send the data
      const response = await addSavings(savingsData);
      alert("Savings entry added successfully!");
      console.log(response); // You can handle the response as needed

      await addSavings(savingsData);
      // navigate("/savingsList");
    } catch (error) {
      setModalMessage("Error adding savings entry");
      console.error(error);
    }
    setIsModalVisible(true);
  };
  const handleShowSavings = async () => {
    try {
      const savings = await getSavings();
      navigate("/savingsList", { state: { savings } });
    } catch (error) {
      console.error("Error fetching savings:", error);
      alert("Failed to fetch savings.");
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setModalMessage("");
  };

  return (
    <div className="add-savings-container">
      <h2 className="text-savings">Add Savings</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label className="label-savings">Savings Category</label>
          <select
            value={savingsCategory}
            onChange={(e) => setSavingsCategory(e.target.value)}
            required
          >
            <option value="">Select Category</option>
            <option value="RD">RD (Recurring Deposit)</option>
            <option value="Jewel Advance">Jewel Advance</option>
            <option value="SIP">SIP (Systematic Investment Plan)</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="label-savings">Savings Amount</label>
          <input
            type="number"
            value={savingsAmount}
            onChange={(e) => setSavingsAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label-savings">Date</label>
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            required
          />
        </div>
        <div>
          <label className="label-savings">Due Date</label>
          <input
            type="date"
            value={dueDate} // Display the auto-populated due date
            onChange={(e) => setDueDate(e.target.value)} // Allow user to edit if needed
            required
          />
        </div>
        <div>
          <label className="label-savings">
            <input
              style={{ color: "white" }}
              type="checkbox"
              checked={reminder}
              onChange={(e) => setReminder(e.target.checked)}
            />
            Set Reminder for Monthly Savings
          </label>
        </div>
        <button type="submit">Save Savings</button>
        <button type="button" className="add-btn" onClick={handleShowSavings}>
          Show savings
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

export default SavingsForm;
