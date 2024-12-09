import React, { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import {
  fetchDashboardData,
  fetchLoans,
  getPolicies,
  getSavings,
} from "../api/endpoint";
import "../styles/dashboard.css";

ChartJS.register(
  Title,
  BarElement,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale
);

const Dashboard = () => {
  const [loans, setLoans] = useState([]);
  const [policies, setPolicies] = useState([]);
  // const [savings, setSavings] = useState([]);
  const [filteredPolicies, setFilteredPolicies] = useState([]);
  const [filteredSavings, setFilteredSavings] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [savings, setSavings] = useState([]);
  const [pieChartData, setPieChartData] = useState({
    transactions: {},
    savings: {},
  });
  const [filterOption, setFilterOption] = useState("all");
  const [savingsFilter, setSavingsFilter] = useState("all");
  const [error, setError] = useState(null);

  const savingsColorMap = {
    RD: "#ff6384",
    SIP: "#36a2eb",
    "Jewel Advance": "#cc65fe",
    Other: "#ffce56",
  };

  // const fetchSavings = async () => {
  //   try {
  //     const data = await getSavings();
  //     setSavings(data);
  //   } catch (error) {
  //     setError("Failed to fetch savings data.");
  //     console.error("Error fetching savings data", error);
  //   }
  // };

  // useEffect(() => {
  //   const getLoans = async () => {
  //     try {
  //       const data = await fetchLoans();
  //       setLoans(data);
  //       setFilteredLoans(data);
  //     } catch (error) {
  //       setError("Failed to fetch loan data.");
  //       console.error("Error fetching loan data", error);
  //     }
  //   };

  //   const getPieChartData = async () => {
  //     try {
  //       const data = await fetchDashboardData();
  //       setPieChartData(data);
  //     } catch (error) {
  //       setError("Failed to fetch pie chart data.");
  //       console.error("Error fetching pie chart data", error);
  //     }
  //   };

  //   getLoans();
  //   getPieChartData();
  // }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [loanData, policyData] = await Promise.all([
          fetchLoans(),
          getPolicies(),
          // fetchSavings(),
        ]);
        setLoans(loanData);
        setFilteredLoans(loanData);
        setPolicies(policyData);
        setFilteredPolicies(policyData);
        // setSavings(savingsData);
        // setFilteredSavings(savingsData);
      } catch (error) {
        setError("Failed to fetch data.");
        console.error("Error fetching data", error);
      }
    };

    const getPieChartData = async () => {
      try {
        const data = await fetchDashboardData();
        setPieChartData(data);
      } catch (error) {
        setError("Failed to fetch pie chart data.");
        console.error("Error fetching pie chart data", error);
      }
    };

    fetchData();
    getPieChartData();
  }, []);

  useEffect(() => {
    if (filterOption === "all") {
      setFilteredLoans(loans);
    } else {
      const filtered = loans.filter(
        (loan) =>
          loan.loan_type && loan.loan_type.toLowerCase() === filterOption
      );
      setFilteredLoans(filtered);
    }
  }, [filterOption, loans]);

  const handleFilterChange = (event) => {
    const value = event.target.value;
    setFilterOption(value);

    if (value === "all") {
      setFilteredLoans(loans);
      setFilteredPolicies(policies);
      setFilteredSavings(savings);
    } else {
      setFilteredLoans(
        loans.filter(
          (loan) => loan.loan_type && loan.loan_type.toLowerCase() === value
        )
      );
      setFilteredPolicies(
        policies.filter(
          (policy) =>
            policy.policy_method && policy.policy_method.toLowerCase() === value
        )
      );
      // setFilteredSavings(
      //   savings.filter(
      //     (savings) =>
      //       savings.savings_category &&
      //       savings.savings_category.toLowerCase() === value
      //   )
      // );
    }
  };

  const handleSavingsFilterChange = (event) => {
    setSavingsFilter(event.target.value);
  };

  const filteredSavingsData =
    savingsFilter === "all"
      ? pieChartData.savings
      : {
          [savingsFilter]: pieChartData.savings[savingsFilter],
        };

  const savingsData = {
    labels: Object.keys(filteredSavingsData),
    datasets: [
      {
        data: Object.values(filteredSavingsData),
        backgroundColor: Object.keys(filteredSavingsData).map(
          (key) => savingsColorMap[key] || "#ffce56"
        ),
        hoverOffset: 4,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        title: { display: true, text: "Savings Categories" },
      },
      y: {
        title: { display: true, text: "Amount" },
      },
    },
  };

  // Function to determine the icon color for loan due date reminder
  const getReminderColor = (dueDate) => {
    const today = new Date(); // Current date
    const due = new Date(dueDate); // Due date
    const daysRemaining = Math.ceil((due - today) / (1000 * 60 * 60 * 24)); // Calculate the remaining days

    if (daysRemaining === 0) {
      return "red"; // Due date is today
    } else if (daysRemaining === 1) {
      return "green"; // 1 day before due date
    } else if (daysRemaining === 2 || daysRemaining === 3) {
      return "blue"; // 2-3 days before due date
    } else if (daysRemaining === 4 || daysRemaining === 5) {
      return "blue"; // 4-5 days before due date (optional, can be customized)
    } else if (daysRemaining >= 6 && daysRemaining <= 7) {
      return "blue"; // 6-7 days before due date
    }
    return "gray"; // Overdue or more than 7 days left
  };

  return (
    <div className="dashboard-container">
      {error && <p className="error-message">{error}</p>}

      <div className="pie-chart-container">
        <h3 style={{ color: "white" }}>Transaction Types Distribution</h3>
        <Pie
          data={{
            labels: Object.keys(pieChartData.transactions),
            datasets: [
              {
                data: Object.values(pieChartData.transactions),
                backgroundColor: ["#ff6384", "#36a2eb", "#cc65fe", "#ffce56"],
              },
            ],
          }}
          options={pieChartOptions}
        />
      </div>

      <div className="bar-chart-container">
        <h3 style={{ color: "white" }}>Savings Categories Distribution</h3>
        <div>
          <label htmlFor="savingsFilter" style={{ color: "white" }}>
            Filter:
          </label>
          <select
            id="savingsFilter"
            value={savingsFilter}
            onChange={handleSavingsFilterChange}
          >
            <option value="all">All</option>
            <option value="RD">RD</option>
            <option value="SIP">SIP</option>
            <option value="Jewel Advance">Jewel Advance</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <Bar data={savingsData} options={barChartOptions} />
      </div>

      <table className="loan-table">
        <thead className="header-table">
          <tr>
            <th>Category</th>
            <th>Amount</th>
            <th>Due Date</th>
            <th>Reminder</th>
            <th>
              Filter
              <select
                name="filterOptions"
                id="filterOptions"
                value={filterOption}
                onChange={handleFilterChange}
              >
                <option value="all">All</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="half-yearly">Half Yearly</option>
                <option value="annual">Annual</option>
              </select>
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredLoans.length > 0 ? (
            filteredLoans.map((loan) => (
              <tr key={loan.id}>
                <td>{loan.loan_category}</td>
                <td>{loan.loan_amount}</td>
                <td>{loan.next_due_date}</td>
                <td>
                  <i
                    className="fas fa-bell"
                    style={{
                      color: getReminderColor(loan.next_due_date),
                      fontSize: "29px",
                      marginLeft: "35%",
                      animation: "zoom-in-out 1.5s infinite",
                    }}
                  ></i>
                </td>
                <td>{loan.loan_type}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10">No data available</td>
            </tr>
          )}

          {filteredPolicies.length > 0 ? (
            filteredPolicies.map((policy) => (
              <tr key={policy.id}>
                <td>{policy.policy_no}</td>
                <td>{policy.policy_amount}</td>
                <td>{policy.next_due_date}</td>
                <td>
                  <i
                    className="fas fa-bell"
                    style={{
                      color: getReminderColor(policy.next_due_date),
                      fontSize: "29px",
                      animation: "zoom-in-out 1.5s infinite",
                    }}
                  ></i>
                </td>
                <td>{policy.policy_method}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No policy data available</td>
            </tr>
          )}

          {/* {filteredSavings.length > 0 ? (
            filteredSavings.map((savings) => (
              <tr key={savings.id}>
                <td>{savings.savings_category}</td>
                <td>{savings.savings_amount}</td>
                <td>{savings.reminder}</td>
                <td>
                  <i
                    className="fas fa-bell"
                    style={{
                      color: getReminderColor(savings.reminder),
                      fontSize: "29px",
                      marginLeft: "35%",
                      animation: "zoom-in-out 1.5s infinite",
                    }}
                  ></i>
                </td>
                <td>{savings.savings_category}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10">No data available</td>
            </tr>
          )} */}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
