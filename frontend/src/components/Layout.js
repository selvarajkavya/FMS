import React, { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import "../styles/layout.css"; // Ensure this file contains the styles
import logo from "../assets/logo.png";

const Layout = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    document.body.className = isDarkTheme ? "dark-theme" : "light-theme"; // Apply theme to the body
    localStorage.setItem("theme", isDarkTheme ? "dark" : "light"); // Persist the theme
  }, [isDarkTheme]);

  const toggleTheme = () => {
    setIsDarkTheme((prevTheme) => !prevTheme);
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-container">
          <div className="logo-container">
            <img src={logo} className="logo" alt="Logo" />
            <h1 className="logo-text">Financial Management System</h1>
          </div>
          <div
            className={`theme-toggle-icon ${isDarkTheme ? "dark" : "light"}`}
            onClick={toggleTheme}
          >
            {/* Icon container dynamically toggles classes */}
          </div>
          <nav className="menu">
            <ul>
              <li>
                <Link to="/dashboard">DASHBOARD</Link>
              </li>
              <li>
                <Link to="/policy">POLICY DETAILS</Link>
              </li>
              <li>
                <Link to="/loan">LOAN DETAILS</Link>
              </li>
              <li>
                <Link to="/incomeExpense">INCOME & EXPENSES</Link>
              </li>
              <li>
                <Link to="/savings">SAVINGS</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <div className="main-container">
        <main className="content">
          <Outlet />
        </main>
      </div>
      <footer className="footer">
        <p className="footer-text">&copy; 2024 Financial Management System</p>
      </footer>
    </div>
  );
};

export default Layout;
