
import { useState } from "react";
import "./RegisterPage.css";

function RegisterPage({ onLoginClick }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.fullName,
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Registration failed!");
        return;
      }

      alert("Registration successful! Please login.");

      onLoginClick();
    } catch (error) {
      alert("Unable to connect to server. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Join CloudVault</h1>

        <p className="register-subtitle">
          Create your account and securely manage your files.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="register-form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="register-form-group">
            <label>Email address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="register-form-group">
            <label>Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              required
            />
          </div>

          <div className="register-form-group">
            <label>Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              minLength={8}
              required
            />
          </div>

          <button
            type="button"
            className="register-show-btn"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>

          <button
            type="submit"
            className="register-btn"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="register-footer">
          Already have an account?{" "}
          <span onClick={onLoginClick}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
