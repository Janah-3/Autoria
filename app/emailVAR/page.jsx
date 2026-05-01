"use client"; 

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { verifyEmail } from '../../src/API/authService';

export default function EmailVerificationPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const savedEmail = localStorage.getItem('email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!email || !verificationCode) {
      setMessage({ type: 'error', text: 'Please enter both email and verification code.' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await verifyEmail(verificationCode, email);
      
      setMessage({ type: 'success', text: 'Email Verified! Welcome to Autoria 🚗' });
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (error) {
      console.error(error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Verification failed. Please check your code and try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-card">
        
        <div className="icon-wrapper">
          <img 
            src="https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=200&q=80" 
            alt="Email verification envelope"
            className="envelope-img"
          />
        </div>

        <h1 className="title">Verify Your Email</h1>
        <p className="subtitle">We've sent a verification code to your email.</p>

        <form onSubmit={handleVerify} className="verify-form">
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="input-group">
            <label>Verification Code</label>
            <input
              type="text"
              className="code-input"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="••••••"
              maxLength={64}
              required
            />
          </div>

          {message.text && (
            <div className={`message-box ${message.type}`}>
              {message.text}
            </div>
          )}

          <button 
            type="submit" 
            className="verify-btn" 
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="resend-section">
          <p>Didn't receive the code?</p>
          <button className="resend-btn" type="button">Resend Code</button>
        </div>
      </div>

      <style jsx>{`
        .verify-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F7F8FA;
          font-family: 'Cairo', sans-serif;
          padding: 20px;
        }

        .verify-card {
          background: white;
          width: 100%;
          max-width: 440px;
          padding: 40px;
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.06);
          text-align: center;
        }

        .icon-wrapper {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          border-radius: 50%;
          background: #FFF0F1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .envelope-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .title {
          font-size: 26px;
          font-weight: 800;
          color: #212121;
          margin-bottom: 8px;
        }

        .subtitle {
          color: #757575;
          font-size: 15px;
          margin-bottom: 32px;
        }

        .verify-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group {
          text-align: left;
        }

        .input-group label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: #424242;
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          padding: 14px;
          border: 1.5px solid #E0E0E0;
          border-radius: 12px;
          font-size: 15px;
          outline: none;
          transition: all 0.2s;
        }

        .form-input:focus {
          border-color: #E8192C;
        }

        .code-input {
          width: 100%;
          padding: 15px;
          border: 1.5px solid #E0E0E0;
          border-radius: 12px;
          text-align: center;
          font-size: 20px;
          letter-spacing: 4px;
          outline: none;
          transition: all 0.2s;
        }

        .code-input:focus { 
          border-color: #E8192C; 
        }

        .message-box {
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          text-align: left;
        }

        .message-box.error {
          background: #FFF0F1;
          color: #E8192C;
          border: 1px solid #FFCDD0;
        }

        .message-box.success {
          background: #E8F5E9;
          color: #2E7D32;
          border: 1px solid #C8E6C9;
        }

        .verify-btn {
          width: 100%;
          padding: 16px;
          background: #E8192C;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(232, 25, 44, 0.2);
        }

        .verify-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(232, 25, 44, 0.3);
        }

        .verify-btn:disabled {
          background: #FF8A96;
          cursor: wait;
          transform: none;
          box-shadow: none;
        }

        .resend-section {
          margin-top: 32px;
          font-size: 14px;
          color: #757575;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .resend-btn {
          background: none;
          border: none;
          color: #E8192C;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
          font-size: 14px;
        }
        
        .resend-btn:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}