"use client";

import { useState } from "react";
import { signup } from "../../src/API/authService";
import Link from "next/link";

const validatePasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++; 
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++; 
  if (/\d/.test(password)) score++; 
  if (/[!@#$%^&*()]/.test(password)) score++;
  return score;
};

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [strength, setStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "password") {
      setStrength(validatePasswordStrength(value));
    }
  };

  const validate = () => {
    let err = {};
    if (!formData.name) err.name = "Full Name is required";
    if (!formData.email) err.email = "Email is required";
    if (!formData.phone) err.phone = "Phone number is required";
    if (strength < 3) err.password = "Password is too weak";
    if (formData.password !== formData.confirmPassword) {
      err.confirmPassword = "Passwords do not match";
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {

        const result = await signup(formData); 
        

        alert("Account created successfully");
        window.location.href = "/login"; 
      } catch (err) {
        alert(err.message); 
      }
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
          max-width: 1100px;
          min-height: 600px;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        .left {
          background: linear-gradient(rgba(212, 43, 43, 0.85), rgba(0, 0, 0, 0.8)), 
                      url('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=1000');
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
          text-transform: uppercase;
          margin-bottom: 10px;
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
          margin-bottom: 20px;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .input-group {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        input {
          padding: 12px;
          border: 1.5px solid #ddd;
          border-radius: 10px;
          font-size: 15px;
          width: 100%;
        }

        input:focus {
          border-color: #d42b2b;
          outline: none;
        }

        .strength-meter {
          height: 4px;
          width: 100%;
          background: #eee;
          margin-top: -5px;
          border-radius: 2px;
          overflow: hidden;
        }

        .strength-bar {
          height: 100%;
          transition: 0.4s ease;
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

        .signup-btn {
          padding: 16px;
          background: #d42b2b;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: bold;
          font-size: 17px;
          cursor: pointer;
          transition: 0.3s;
          margin-top: 10px;
        }

        .signup-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .signup-btn:hover:not(:disabled) {
          background: #b32424;
          transform: translateY(-2px);
        }

        .error-msg {
          color: #d42b2b;
          font-size: 12px;
          font-weight: bold;
          margin-top: -5px;
        }

        .link {
          color: #d42b2b;
          text-align: center;
          margin-top: 15px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
        }

        @media (max-width: 900px) {
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
          <h2>Expert Care</h2>
          <p>Join thousands of car owners and get access to the best mechanics and genuine spare parts.</p>
        </div>

        <div className="right">
          <form className="form" onSubmit={handleSubmit}>
            <h3>Create Account</h3>
            
            <input name="name" placeholder="Full Name" onChange={handleChange} />
            {errors.name && <span className="error-msg">{errors.name}</span>}

            <input name="email" placeholder="Email Address" onChange={handleChange} />
            {errors.email && <span className="error-msg">{errors.email}</span>}

            <input name="phone" placeholder="Phone Number" onChange={handleChange} />
            {errors.phone && <span className="error-msg">{errors.phone}</span>}

            <div className="input-group">
              <input 
                name="password" 
                type={showPw ? "text" : "password"} 
                placeholder="Password" 
                onChange={handleChange} 
              />
              <button type="button" className="eye-btn" onClick={() => setShowPw(!showPw)}>
                <i className={`fa-solid ${showPw ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>


            {formData.password && (
              <div className="strength-meter">
                <div 
                  className="strength-bar" 
                  style={{
                    width: `${(strength / 4) * 100}%`,
                    backgroundColor: strength < 2 ? "#d42b2b" : strength < 4 ? "#ffcc00" : "#2ecc71"
                  }}
                ></div>
              </div>
            )}
            {errors.password && <span className="error-msg">{errors.password}</span>}

            <input 
              name="confirmPassword" 
              type="password" 
              placeholder="Confirm Password" 
              onChange={handleChange} 
            />
            {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}
            
            <button 
              type="submit" 
              className="signup-btn" 
              disabled={strength < 3} 
            >
              Sign Up Now
            </button>

            <Link href="/login" className="link">
  Already have an account? Login
</Link>
          </form>
        </div>
      </div>
    </div>
  );
}