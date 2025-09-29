// src/pages/ComingSoon.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Passcode configuration
const PASSCODES = {
  "metierlab": "admin",     // Admin access - full features
  "metierparts": "customer" // Customer access - limited features
};

export default function ComingSoon() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function unlock(e) {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate a brief loading state for better UX
    setTimeout(() => {
      const role = PASSCODES[code.trim().toLowerCase()];
      
      if (role) {
        // Set authentication and role in session storage
        sessionStorage.setItem("metier_auth", "authenticated");
        sessionStorage.setItem("metier_role", role);
        
        setMsg(`Welcome ${role === 'admin' ? 'Admin' : 'Customer'}!`);
        
        // Navigate based on role
        if (role === 'admin') {
          navigate("/admin", { replace: true });
        } else {
          navigate("/products", { replace: true });
        }
      } else {
        setMsg("Incorrect passcode. Please try again.");
        setCode(""); // Clear the input on wrong code
      }
      setIsLoading(false);
    }, 800);
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: "linear-gradient(135deg, #0b0b0b 0%, #1a1a1a 100%)",
      color: "#fff",
      padding: 24,
      textAlign: "center"
    }}>
      <div style={{ maxWidth: 520 }}>
        {/* Logo/Brand */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ 
            fontSize: 48, 
            marginBottom: 8, 
            background: "linear-gradient(45deg, #fff, #aaa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: "bold"
          }}>
            Métier CX
          </h1>
          <h2 style={{ 
            fontSize: 20, 
            color: "#888", 
            marginBottom: 16,
            fontWeight: "300"
          }}>
            Automotive Parts & Performance
          </h2>
        </div>

        {/* Coming Soon Message */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ 
            lineHeight: 1.6, 
            color: "#ccc", 
            fontSize: 16,
            marginBottom: 24
          }}>
            We're engineering the next evolution of automotive performance. 
            Enter your access code to continue.
          </p>
        </div>

        {/* Access Form */}
        <form onSubmit={unlock} style={{
          marginBottom: 32
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 12,
            maxWidth: 400,
            margin: "0 auto 20px"
          }}>
            <input
              type="password"
              placeholder="Enter access code"
              value={code}
              onChange={e => setCode(e.target.value)}
              disabled={isLoading}
              style={{
                padding: "14px 16px",
                borderRadius: 8,
                border: "1px solid #333",
                background: "#111",
                color: "#fff",
                fontSize: 16,
                outline: "none",
                transition: "border-color 0.2s",
                opacity: isLoading ? 0.7 : 1
              }}
              onFocus={(e) => e.target.style.borderColor = "#1f9d55"}
              onBlur={(e) => e.target.style.borderColor = "#333"}
            />
            <button
              type="submit"
              disabled={isLoading || !code.trim()}
              style={{
                padding: "14px 20px",
                borderRadius: 8,
                border: "none",
                background: isLoading || !code.trim() ? "#333" : "#1f9d55",
                color: "#fff",
                cursor: isLoading || !code.trim() ? "not-allowed" : "pointer",
                fontSize: 16,
                fontWeight: "500",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "80px"
              }}
            >
              {isLoading ? (
                <div style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid transparent",
                  borderTop: "2px solid currentColor",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }} />
              ) : (
                "Enter"
              )}
            </button>
          </div>

          {/* Message Display */}
          {msg && (
            <div style={{
              padding: "12px 16px",
              borderRadius: 8,
              background: msg.startsWith("Welcome") ? "rgba(31, 157, 85, 0.1)" : "rgba(239, 68, 68, 0.1)",
              border: `1px solid ${msg.startsWith("Welcome") ? "#1f9d55" : "#ef4444"}`,
              color: msg.startsWith("Welcome") ? "#4ade80" : "#f87171",
              fontSize: 14,
              fontWeight: "500"
            }}>
              {msg}
            </div>
          )}
        </form>

        {/* Access Levels Info */}
        <div style={{
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: 12,
          padding: 24,
          marginBottom: 32,
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
          <h3 style={{ 
            fontSize: 16, 
            marginBottom: 16, 
            color: "#fff",
            fontWeight: "600"
          }}>
            Access Levels
          </h3>
          <div style={{ 
            display: "grid", 
            gap: 12, 
            textAlign: "left",
            fontSize: 14
          }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 12,
              padding: "8px 0"
            }}>
              <span style={{ 
                width: 8, 
                height: 8, 
                borderRadius: "50%", 
                background: "#3b82f6" 
              }} />
              <span style={{ color: "#ccc" }}>
                <strong style={{ color: "#fff" }}>Admin Access:</strong> Full system management
              </span>
            </div>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 12,
              padding: "8px 0"
            }}>
              <span style={{ 
                width: 8, 
                height: 8, 
                borderRadius: "50%", 
                background: "#10b981" 
              }} />
              <span style={{ color: "#ccc" }}>
                <strong style={{ color: "#fff" }}>Customer Access:</strong> Browse & order products
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          color: "#666", 
          fontSize: 12,
          borderTop: "1px solid #333",
          paddingTop: 20
        }}>
          © {new Date().getFullYear()} Métier CX. All rights reserved.
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
