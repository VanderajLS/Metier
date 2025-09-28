// src/pages/ComingSoon.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// TEMP: hardcoded passcode for testing
const PASS = "metierlab";

export default function ComingSoon() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");

  function unlock(e) {
    e.preventDefault();
    if (!PASS) {
      setMsg("Passcode is not configured.");
      return;
    }
    if (code.trim() === PASS) {
      // Session flag – protects /admin and other protected routes
      sessionStorage.setItem("metier_auth", "ok");
      setMsg("Welcome!");
      // Where to send testers after login:
      navigate("/admin", { replace: true });
    } else {
      setMsg("Incorrect passcode. Try again.");
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: "#0b0b0b",
      color: "#fff",
      padding: 24,
      textAlign: "center"
    }}>
      <div style={{maxWidth: 520}}>
        <h1 style={{fontSize: 40, marginBottom: 8}}>Métier Turbo</h1>
        <h2 style={{fontSize: 20, color: "#aaa", marginBottom: 24}}>Coming Soon</h2>
        <p style={{lineHeight: 1.6, color: "#ccc", marginBottom: 28}}>
          We’re tuning the next evolution of performance. Check back soon.
        </p>
        <form onSubmit={unlock} style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 8,
          maxWidth: 420,
          margin: "0 auto"
        }}>
          <input
            type="password"
            placeholder="Tester passcode"
            value={code}
            onChange={e=>setCode(e.target.value)}
            style={{
              padding: "12px 14px",
              borderRadius: 8,
              border: "1px solid #333",
              background: "#111",
              color: "#fff"
            }}
          />
          <button
            type="submit"
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              border: "1px solid #444",
              background: "#1f9d55",
              color: "#fff",
              cursor: "pointer"
            }}
          >
            Enter
          </button>
        </form>

        {msg && (
          <div style={{marginTop: 10, color: msg.startsWith("Welcome") ? "#7ef" : "#faa"}}>
            {msg}
          </div>
        )}

        <div style={{marginTop: 36, color: "#777", fontSize: 12}}>
          © {new Date().getFullYear()} Métier Turbo. All rights reserved.
        </div>
      </div>
    </div>
  );
}
