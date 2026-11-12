
import { useState } from "react";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";

function App() {
  const [currentPage, setCurrentPage] = useState("login");

  return (
    <>
      {currentPage === "login" && (
        <LoginPage
          onRegisterClick={() => setCurrentPage("register")}
          onLoginSuccess={() => setCurrentPage("dashboard")}
        />
      )}

      {currentPage === "register" && (
        <RegisterPage
          onLoginClick={() => setCurrentPage("login")}
        />
      )}

      {currentPage === "dashboard" && (
        <DashboardPage
  onLogout={() => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setCurrentPage("login");
  }}
/>
      )}
    </>
  );
}

export default App;
