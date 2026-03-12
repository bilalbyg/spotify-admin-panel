import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()

  const cyan = "#00f3ff"
  const bg = "#000000"

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const result = login(formData.email, formData.password)
    if (result.success) {
      navigate("/")
    } else {
      setError(result.error || "AUTHENTICATION FAILED")
    }
  }

  return (
    <div
      style={{
        backgroundColor: bg,
        color: cyan,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "'Share Tech Mono', monospace",
        textTransform: "uppercase",
        fontSize: "14px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          border: `1px solid ${cyan}`,
          padding: "40px",
          width: "100%",
          maxWidth: "480px",
        }}
      >
        <div style={{ marginBottom: "30px" }}>
          <h1 style={{ fontSize: "28px", margin: 0, letterSpacing: "8px" }}>
            ACCESS TERMINAL
          </h1>
          <div
            style={{
              height: "2px",
              backgroundColor: cyan,
              width: "100px",
              marginTop: "5px",
            }}
          ></div>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "25px" }}
        >
          <div>
            <label style={{ display: "block", marginBottom: "10px" }}>
              {">"} COMM_CHANNEL (EMAIL)
            </label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: "100%",
                backgroundColor: "transparent",
                border: `1px solid ${cyan}`,
                color: cyan,
                padding: "12px",
                fontFamily: "inherit",
                outline: "none",
                boxSizing: "border-box",
              }}
              autoComplete="off"
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "10px" }}>
              {">"} ACCESS_CODE (PASSWORD)
            </label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: "100%",
                backgroundColor: "transparent",
                border: `1px solid ${cyan}`,
                color: cyan,
                padding: "12px",
                fontFamily: "inherit",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              backgroundColor: cyan,
              color: bg,
              border: "none",
              padding: "15px",
              fontWeight: "bold",
              cursor: "pointer",
              letterSpacing: "5px",
              marginTop: "10px",
              fontFamily: "inherit",
              textTransform: "uppercase",
            }}
          >
            AUTHENTICATE
          </button>
        </form>

        {error && (
          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              border: "1px solid #ff4444",
              color: "#ff4444",
              textAlign: "center",
              fontSize: "12px",
              letterSpacing: "2px",
            }}
          >
            [ERROR]: {error}
          </div>
        )}

        <div style={{ marginTop: "25px", fontSize: "12px" }}>
          UNREGISTERED ASSET?{" "}
          <Link
            to="/signup"
            style={{ color: cyan, textDecoration: "underline" }}
          >
            INITIALIZE REGISTRATION
          </Link>
        </div>
      </div>

      <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
                input:focus { background-color: ${cyan}11; box-shadow: 0 0 10px ${cyan}33; }
            `}</style>
    </div>
  )
}
