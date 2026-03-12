import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/useAuth"

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const { signup } = useAuth()
  const navigate = useNavigate()

  const cyan = "#00ffcc"
  const bg = "#000000"

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (formData.password !== formData.confirmPassword) {
      setError("ACCESS CODES DO NOT MATCH")
      return
    }
    const result = signup(formData.username, formData.email, formData.password)
    if (result.success) {
      navigate("/")
    } else {
      setError(result.error || "REGISTRATION FAILED")
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
          <h1 style={{ fontSize: "24px", margin: 0, letterSpacing: "6px" }}>
            ASSET REGISTRATION
          </h1>
          <div
            style={{
              height: "2px",
              backgroundColor: cyan,
              width: "120px",
              marginTop: "5px",
            }}
          ></div>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          {[
            { name: "username", label: "DESIGNATION", type: "text" },
            { name: "email", label: "COMM_CHANNEL", type: "email" },
            { name: "password", label: "ACCESS_CODE", type: "password" },
            { name: "confirmPassword", label: "VERIFY_CODE", type: "password" },
          ].map((field) => (
            <div key={field.name}>
              <label style={{ display: "block", marginBottom: "8px" }}>
                {">"} {field.label}
              </label>
              <input
                name={field.name}
                type={field.type}
                value={formData[field.name as keyof typeof formData]}
                onChange={handleChange}
                style={{
                  width: "100%",
                  backgroundColor: "transparent",
                  border: `1px solid ${cyan}`,
                  color: cyan,
                  padding: "10px",
                  fontFamily: "inherit",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                autoComplete="off"
              />
            </div>
          ))}

          <button
            type="submit"
            style={{
              backgroundColor: cyan,
              color: bg,
              border: "none",
              padding: "15px",
              fontWeight: "bold",
              cursor: "pointer",
              letterSpacing: "4px",
              marginTop: "10px",
              fontFamily: "inherit",
              textTransform: "uppercase",
            }}
          >
            INITIALIZE REGISTRATION
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
          ALREADY CLASSIFIED?{" "}
          <Link
            to="/login"
            style={{ color: cyan, textDecoration: "underline" }}
          >
            ACCESS TERMINAL
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
