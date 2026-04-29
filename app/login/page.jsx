"use client";

import { useState } from "react";
import { login } from "../../src/API/authService";
import Signup from "../signup/page";
import ForgotPassword from "../forgot-password/page";

export default function LoginPage() {
  const [page, setPage] = useState("login");

  if (page === "signup") return <Signup goToLogin={() => setPage("login")} />;
  if (page === "forgot") return <ForgotPassword goToLogin={() => setPage("login")} />;

  return <LoginView setPage={setPage} />;
}

function LoginView({ setPage }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.email || !formData.password) {
      setError("All fields required");
      return;
    }

    setLoading(true);
    try {
      const result = await login(formData);

      if (result.success) {
        localStorage.setItem("token", result.data.accessToken);
        alert("Welcome Back to Autoria!");
        window.location.href = "/dashboard"; 
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-wrapper">
      <style>{`
        .main-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: #f0f2f5;
          padding: 20px;
          font-family: sans-serif;
        }

        .container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: 85%;
          max-width: 1000px;
          min-height: 550px;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        .left {
          background: linear-gradient(rgba(212, 43, 43, 0.85), rgba(0, 0, 0, 0.8)), 
                      url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80');
          background-size: cover;
          background-position: center;
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 40px;
        }

        .left h1 {
          font-size: 4rem;
          font-weight: 900;
          margin-bottom: 5px;
          text-transform: uppercase;
        }

        .left h2 {
          font-size: 1.8rem;
          font-weight: 300;
          opacity: 0.9;
        }

        .right {
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .form h3 {
          font-size: 2rem;
          font-weight: 800;
          color: #222;
          margin-bottom: 25px;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .input-group {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        input {
          padding: 14px;
          border: 1.5px solid #ddd;
          border-radius: 10px;
          font-size: 16px;
          width: 100%;
        }

        input:focus {
          border-color: #d42b2b;
          outline: none;
        }

        .eye-btn {
          position: absolute;
          right: 15px;
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
        }

        .login-btn {
          padding: 18px;
          background: #d42b2b;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: bold;
          font-size: 18px;
          cursor: pointer;
          transition: 0.3s;
          margin-top: 10px;
        }

        .login-btn:hover:not(:disabled) {
          background: #b32424;
          transform: translateY(-2px);
        }

        .login-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .error-msg {
          color: #d42b2b;
          font-size: 13px;
          font-weight: bold;
          background: #fff5f5;
          padding: 8px;
          border-radius: 5px;
          text-align: center;
        }

        .link {
          color: #d42b2b;
          text-align: center;
          margin-top: 10px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: 0.2s;
        }

        .link:hover {
          text-decoration: underline;
        }

        @media (max-width: 850px) {
          .container {
            grid-template-columns: 1fr;
            width: 100%;
          }
          .left {
            display: none;
          }
        }
      `}</style>

      <div className="container">
        <div className="left">
          <h1>Autoria</h1>
          <h2>Your Car's Best Friend</h2>
          <p>Book expert mechanics and find genuine spare parts in one place. Keep your car running like new.</p>
        </div>
        <div className="right">
          <form className="form" onSubmit={handleSubmit}>
            <h3>Login to your account</h3>
            
            <input 
              name="email" 
              type="email"
              placeholder="Email Address" 
              required
              onChange={handleChange} 
            />

            <div className="input-group">
              <input 
                name="password" 
                type={showPw ? "text" : "password"} 
                placeholder="Password" 
                required
                onChange={handleChange} 
              />
              <button type="button" className="eye-btn" onClick={() => setShowPw(!showPw)}>
                <i className={`fa-solid ${showPw ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>

            {error && <span className="error-msg">{error}</span>}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Checking..." : "Login Now"}
            </button>

            <div className="link" onClick={() => setPage("forgot")}>Forgot Password?</div>
            <div className="link" onClick={() => setPage("signup")}>Don't have an account? Signup</div>
          </form>
        </div>
      </div>
    </div>
  );
}