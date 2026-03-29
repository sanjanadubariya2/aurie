import axios from "axios";
import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { verifyEmailOtp, sendEmailOtp } from "../api/auth";

export default function VerifyEmail({ userId }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const { setRoute, token, user } = useApp();

  useEffect(() => {
    console.log("VerifyEmail loaded with:", { userId, token: !!token, user: user?.email });
    
    // Check for demo OTP stored from signup
    const storedDemoOTP = localStorage.getItem("demoOTP");
    if (storedDemoOTP) {
      setResendMessage(`[DEMO] OTP: ${storedDemoOTP}`);
      console.log("📧 Demo OTP from storage:", storedDemoOTP);
    }
  }, [userId, token, user]);

  async function handleVerify() {
    setError("");
    
    if (!otp || otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    const currentToken = token || localStorage.getItem("token");
    if (!currentToken) {
      setError("Session expired. Please signup again.");
      setTimeout(() => setRoute("signup"), 2000);
      return;
    }

    try {
      setLoading(true);
      console.log("Verifying OTP:", { otp, hasToken: !!currentToken });
      
      const res = await verifyEmailOtp(currentToken, otp);
      
      console.log("Verification response:", res);
      
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        console.log("✅ Email verified successfully!");
        setTimeout(() => {
          setRoute("home");
        }, 1500);
      }
    } catch (err) {
      console.error("Verification error:", err);
      const errorMsg = err.response?.data?.error || "Verification failed. Wrong OTP.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOTP() {
    setResendMessage("");
    
    const currentToken = token || localStorage.getItem("token");
    if (!currentToken) {
      setResendMessage("❌ Session expired. Please signup again.");
      return;
    }

    try {
      setResendLoading(true);
      console.log("Resending OTP...");
      
      const res = await sendEmailOtp(currentToken);
      
      console.log("Resend response:", res);
      
      if (res.error) {
        setResendMessage(`❌ ${res.error}`);
      } else {
        let message = "✅ OTP resent to your email. Check your inbox!";
        if (res.demo && res.demoOTP) {
          message = `[DEMO] OTP: ${res.demoOTP}`;
          console.log("📧 Demo OTP:", res.demoOTP);
        }
        setResendMessage(message);
        setOtp("");
      }
    } catch (err) {
      console.error("Resend error:", err);
      setResendMessage("❌ Failed to resend OTP. Try again later.");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2 text-purple-900">Verify Email</h1>
          <p className="text-gray-600">
            {user?.email ? `We sent an OTP to ${user.email}` : "Enter the OTP sent to your email"}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-4 text-sm">
            <span className="font-semibold">❌ Error: </span>
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 p-4 rounded mb-4 text-sm">
            <span className="font-semibold">✅ Success! </span>
            Email verified successfully! Redirecting to home...
          </div>
        )}

        {resendMessage && (
          <div className={`${resendMessage.includes("✅") ? "bg-green-100 border-green-400 text-green-700" : "bg-red-100 border-red-400 text-red-700"} border p-4 rounded mb-4 text-sm`}>
            {resendMessage}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter 6-Digit OTP
            </label>
            <input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={e => {
                const cleaned = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(cleaned);
              }}
              disabled={loading || success}
              maxLength="6"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-4xl tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">Numbers only</p>
          </div>

          <button 
            onClick={handleVerify} 
            disabled={loading || success || otp.length !== 6}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition duration-200"
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin mr-2">⟳</span>
                Verifying...
              </>
            ) : success ? (
              "✅ Verified!"
            ) : (
              "Verify OTP"
            )}
          </button>

          <button 
            onClick={handleResendOTP} 
            disabled={resendLoading || success}
            className="w-full bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-semibold py-2 rounded-lg transition text-sm"
          >
            {resendLoading ? "Sending..." : "Resend OTP"}
          </button>
        </div>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800 text-center mb-2">
            <strong>💡 Tips for receiving the OTP:</strong>
          </p>
          <ul className="text-xs text-blue-800 list-disc list-inside space-y-1">
            <li>Check your spam/junk folder if you don't see the email</li>
            <li>Make sure you entered a valid email address</li>
            <li>Wait a few seconds - sometimes emails take time to arrive</li>
            <li>Click "Resend OTP" to request a new code</li>
          </ul>
        </div>

        <p className="text-center text-gray-600 text-sm mt-6">
          Want to start over?{" "}
          <button
            onClick={() => setRoute("signup")}
            className="text-orange-500 hover:text-orange-600 font-semibold"
          >
            Back to Signup
          </button>
        </p>
      </div>
    </div>
  );
}
