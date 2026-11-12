
import { useState } from "react";
import "./LoginPage.css";

function LoginPage({ onRegisterClick, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    // Temporary frontend login
    // Real authentication will be implemented with MERN backend
    onLoginSuccess();
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <h1>Welcome to CloudVault</h1>

        <p className="login-subtitle">
          Securely store and manage your files.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="login-form-group">
            <label>Email address</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-form-group">
            <label>Password</label>

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="button"
            className="show-password-btn"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide Password" : "Show Password"}
          </button>

          <button type="submit" className="login-btn">
            Login
          </button>

        </form>

        <p className="login-footer">
          Don't have an account?{" "}
          <span onClick={onRegisterClick}>
            Create an account
          </span>
        </p>

      </div>
    </div>
  );
}

export default LoginPage;
