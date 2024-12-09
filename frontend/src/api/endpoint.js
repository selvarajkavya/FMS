import axios from "axios";
import { jwtDecode } from "jwt-decode";
const API_URL = "http://127.0.0.1:8000/api/"; // Base API URL

const decodeToken = (token) => {
  try {
    return jwtDecode(token); // Returns the decoded payload
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

// Logout User Function
export const logoutUser = () => {
  localStorage.removeItem("jwt");
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("auth_token"); // Remove the existing token
};

// Login User Function
export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}login/`, {
      username,
      password,
    });
    console.log(response.data);
    localStorage.setItem("auth_token", response.data.accessToken);
    const token = response.data.token; // Access token
    const refreshToken = response.data.refresh; // Refresh token
    const userId = response.data.user_id;
    localStorage.setItem("jwt", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("refresh_token", refreshToken);
    localStorage.setItem("accessToken", token);
    window.location.href = "/dashboard";

    const decodedToken = decodeToken(token);
    if (decodedToken) {
      const expiresIn = decodedToken.exp * 1000 - Date.now(); // Time until expiration in ms
      setTimeout(() => {
        console.log("Access token expired. Logging out.");
        logoutUser(); // Call logout
      }, expiresIn);
    }

    return response.data; // Return login data
  } catch (error) {
    console.error(
      "Login error:",
      error.response ? error.response.data : error.message
    );
    throw error.response ? error.response.data : error.message;
  }
};

// Register User Function
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}register/`, userData);
    return response.data; // Return the registration data
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Refresh Token Function
export const refreshAuthToken = async (refresh) => {
  if (!refresh) {
    console.error("No refresh token provided.");
    return null; // Return null early if refresh token is missing
  }

  try {
    const response = await axios.post(`${API_URL}token/refresh/`, { refresh });
    console.log("Token refresh successful:", response.data);
    localStorage.setItem("auth_token", response.data.access); // Store the new access token
    return response.data.access; // Return the new access token
  } catch (error) {
    console.error("Error refreshing token:", error);
    // Optionally, you can redirect the user to login or handle other actions
    return null; // Return null to indicate token refresh failure
  }
};

// Axios request interceptor to handle token refresh
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwt");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Axios response interceptor to catch 401 errors and refresh the token
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem("refresh_token");

      if (refresh) {
        try {
          const newAccessToken = await refreshAuthToken(refresh);

          if (!newAccessToken) {
            console.error("Unable to refresh token. Logging out...");
            localStorage.clear();
            window.location.href = "/"; // Redirect to login page
            return Promise.reject(error);
          }

          console.log(
            "New access token stored in localStorage:",
            newAccessToken
          );
          localStorage.setItem("jwt", newAccessToken);

          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          console.error("Error refreshing token:", refreshError);
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

// Add Policy Function with Retry Logic
export const addPolicy = async (policyData) => {
  try {
    const token = localStorage.getItem("jwt");
    if (!token) {
      throw new Error("Token is missing, please log in.");
    }

    const response = await axios.post(`${API_URL}add-policy/`, policyData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log("Policy added successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error adding policy:", error.response?.data || error);
    throw error;
  }
};

export const getPolicies = async () => {
  try {
    const token = localStorage.getItem("jwt");
    if (!token) {
      throw new Error("Token is missing, please log in.");
    }

    const response = await axios.get(`${API_URL}get-policies/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching policies:", error.response?.data || error);
    throw error;
  }
};

export const updatePolicy = async (policyId, updatedPolicy) => {
  try {
    const response = await axios.put(
      `${API_URL}update-policy/${policyId}/`,
      updatedPolicy
    );
    return response; // Return the API response if successful
  } catch (error) {
    throw new Error(error.response.data.error || "An error occurred");
  }
};

// Function to delete a policy
export const deletePolicy = async (policyId) => {
  try {
    const response = await axios.delete(`${API_URL}delete-policy/${policyId}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting policy:", error);
    throw error;
  }
};

// Loan
export const addLoan = async (loanDetails) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("No access token found. Please log in.");
    }

    const response = await axios.post(`${API_URL}loan/`, loanDetails, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error adding loan:", error);
    throw error;
  }
};

export const getLoanReminders = async () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("No access token found. Please log in.");
    }

    const response = await axios.get(`${API_URL}loans/all/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Loan reminders retrieved successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching loan reminders:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const updateLoan = async (loanId, updatedLoan) => {
  try {
    const response = await axios.put(
      `${API_URL}loan/${loanId}/update/`,
      updatedLoan
    );
    return response; // Return the API response if successful
  } catch (error) {
    throw new Error(error.response.data.error || "An error occurred");
  }
};

export const deleteLoan = async (loanId) => {
  try {
    const response = await axios.delete(`${API_URL}loan/${loanId}/delete/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting policy:", error);
    throw error;
  }
};

// Add Transaction Function with Token Check and Retry Logic
export const createTransaction = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${API_URL}transactions/`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
};

export const getTransactions = async (user_id) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token is missing, please log in.");
    }

    const response = await axios.get(`${API_URL}transactionsList/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { user_id: user_id }, // Send the user_id as a query parameter
    });

    console.log("Transactions fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching transactions:",
      error.response?.data || error
    );
    throw error;
  }
};

export const updateTransaction = async (transactionId, updatedTransaction) => {
  try {
    const response = await axios.put(
      `${API_URL}transaction/${transactionId}/update/`,
      updatedTransaction
    );
    return response; // Return the API response if successful
  } catch (error) {
    throw new Error(error.response.data.error || "An error occurred");
  }
};

export const deleteTransaction = async (transactionId) => {
  try {
    const response = await axios.delete(
      `${API_URL}transaction/${transactionId}/delete/`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw error;
  }
};

export const addSavings = async (savingsData) => {
  try {
    // Set the reminder field to the 1st of the current month if it's not provided
    if (!savingsData.reminder) {
      const currentDate = new Date();
      savingsData.reminder = `${currentDate.getFullYear()}-${(
        currentDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-01`; // Set to the 1st of the current month
    }

    const response = await axios.post(`${API_URL}savings/`, savingsData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Assuming JWT token is stored in localStorage
      },
    });

    return response.data; // Return the response data to handle it in the component
  } catch (error) {
    throw error; // Throw the error to be caught in the component
  }
};

export const getSavings = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token is missing, please log in.");
    }

    const response = await axios.get(`${API_URL}savingsList/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Savings retrieved successfully:", response.data);
    return response.data; // Return the response data to handle it in the component
  } catch (error) {
    console.error("Error fetching savings:", error.response?.data || error);
    throw error; // Throw the error to be caught in the component
  }
};

export const handleUpdateSavings = async (savingId, updatedData) => {
  if (!savingId) {
    console.error("Saving ID is undefined.");
    return;
  }
  try {
    const response = await axios.put(
      `${API_URL}savings/${savingId}/update/`,
      updatedData,
      {
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Update successful:", response.data);
    return response;
  } catch (err) {
    console.error("Error updating savings:", err.response?.data || err.message);
  }
};

export const handleDeleteSavings = async (savingId) => {
  if (!savingId) {
    console.error("Saving ID is undefined.");
    return;
  }
  try {
    const response = await axios.delete(
      `${API_URL}savings/${savingId}/delete/`,
      {
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
      }
    );
    console.log("Delete successful:", response.data);
  } catch (err) {
    console.error("Error deleting savings:", err.response?.data || err.message);
  }
};

export const fetchLoans = async () => {
  try {
    const response = await fetch(`${API_URL}loansda/`);
    if (!response.ok) {
      throw new Error("Failed to fetch loans data");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching loans data:", error);
    throw error;
  }
};

export const fetchDashboardData = async () => {
  try {
    const response = await fetch(`${API_URL}dashboard-data/`);
    if (!response.ok) {
      throw new Error("Failed to fetch dashboard data");
    }
    return await response.json(); // Returns the data for pie chart
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error; // Rethrow error to handle it in the component
  }
};
