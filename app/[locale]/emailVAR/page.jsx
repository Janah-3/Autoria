"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyEmail, resendVerification } from '../../src/API/authService';


function EmailVerificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    const emailFromUrl = searchParams.get('email');

    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }

    if (tokenFromUrl && emailFromUrl) {
      handleAutoVerify(tokenFromUrl, emailFromUrl);
    } else {
      setIsLoading(false);
      setMessage({ 
        type: 'error', 
        text: 'Invalid or missing verification link.' 
      });
    }
  }, [searchParams]);

  const handleAutoVerify = async (token, userEmail) => {
    try {
      await verifyEmail(token, userEmail);
      
      setMessage({ type: 'success', text: 'Email Verified! Welcome to Autoria 🚗' });
      
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      console.error(error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Verification failed. The link may have expired.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      await resendVerification(email);
      setMessage({ type: 'success', text: 'Verification link resent to your email!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to resend link, please try again later.' });
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
        
        {isLoading ? (
          <p className="subtitle">Verifying your account automatically...</p>
        ) : (
          <p className="subtitle">Email verification status for Autoria</p>
        )}

        <div className="verify-form">
          {message.text && (
            <div className={`message-box ${message.type}`}>
              {message.text}
            </div>
          )}

          {isLoading && (
            <div className="spinner-container">
              <div className="loading-spinner"></div>
            </div>
          )}
        </div>

        <div className="resend-section">
          <p>Didn't receive the email or token expired?</p>
          <button 
            className="resend-btn" 
            type="button"
            onClick={handleResend}
            disabled={!email}
          >
            Resend Link
          </button>
        </div>
      </div>

      <style jsx>{`
        .verify-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f7f8fa;
          font-family: "Cairo", sans-serif;
          padding: 20px;
        }

        .verify-card {
          background: white;
          width: 100%;
          max-width: 440px;
          padding: 40px;
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
          text-align: center;
        }

        .icon-wrapper {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          border-radius: 50%;
          background: #fff0f1;
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
          min-height: 60px;
          justify-content: center;
        }

        .message-box {
          padding: 14px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          text-align: center;
          line-height: 1.5;
        }

        .message-box.error {
          background: #fff0f1;
          color: #e8192c;
          border: 1px solid #ffcdd0;
        }

        .message-box.success {
          background: #E8F5E9;
          color: #2E7D32;
          border: 1px solid #C8E6C9;
        }

        .spinner-container {
          display: flex;
          justify-content: center;
          margin: 10px 0;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #E8192C;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .resend-section {
          margin-top: 8px;
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
          color: #e8192c;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
          font-size: 14px;
        }

        .resend-btn:hover {
          text-decoration: underline;
        }
        .resend-btn:disabled {
          color: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

// useSearchParams() requires a Suspense boundary in Next.js App Router
export default function EmailVerificationPage() {
  return (
    <Suspense fallback={<p style={{ textAlign: "center", marginTop: "40vh" }}>Loading...</p>}>
      <EmailVerificationContent />
    </Suspense>
  );
}