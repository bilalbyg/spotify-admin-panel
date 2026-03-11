import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [classification, setClassification] = useState("PENDING")
  const [scanLine, setScanLine] = useState(0)
  const [glitchText, setGlitchText] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [typedTitle, setTypedTitle] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const fullTitle = "ASSET REGISTRATION"

  // Typewriter effect for the title
  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i <= fullTitle.length) {
        setTypedTitle(fullTitle.slice(0, i))
        i++
      } else {
        clearInterval(interval)
        setTimeout(() => setShowForm(true), 300)
      }
    }, 80)
    return () => clearInterval(interval)
  }, [])

  // Scan line animation
  useEffect(() => {
    const interval = setInterval(() => {
      setScanLine((prev) => (prev >= 100 ? 0 : prev + 0.5))
    }, 30)
    return () => clearInterval(interval)
  }, [])

  // Random glitch text
  useEffect(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@!%&*"
    const interval = setInterval(() => {
      let result = ""
      for (let i = 0; i < 24; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      setGlitchText(result)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  // Matrix rain canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const columns = Math.floor(canvas.width / 14)
    const drops: number[] = Array(columns).fill(1)
    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノ"

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "#0f0"
      ctx.font = "12px monospace"

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)]
        ctx.fillStyle = `rgba(0, ${150 + Math.random() * 105}, 0, ${0.3 + Math.random() * 0.3})`
        ctx.fillText(text, i * 14, drops[i] * 14)
        if (drops[i] * 14 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
    }

    const interval = setInterval(draw, 50)

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener("resize", handleResize)

    return () => {
      clearInterval(interval)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Classification logic based on form fill
  useEffect(() => {
    const filled = Object.values(formData).filter((v) => v.length > 0).length
    if (filled === 0) setClassification("PENDING")
    else if (filled === 1) setClassification("IRRELEVANT")
    else if (filled === 2) setClassification("CONTINGENCY")
    else if (filled === 3) setClassification("INDIGO")
    else setClassification("ASSET")
  }, [formData])

  const getClassColor = (cls: string) => {
    switch (cls) {
      case "IRRELEVANT":
        return "#ffffff"
      case "THREAT":
        return "#e74c3c"
      case "CONTINGENCY":
        return "#f1c40f"
      case "INDIGO":
        return "#3498db"
      case "ASSET":
        return "#2ecc71"
      default:
        return "#666666"
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setClassification("THREAT")
    setTimeout(() => setClassification("ASSET"), 2000)
  }

  const classColor = getClassColor(classification)

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflowY: "auto",
        padding: "60px 20px",
        boxSizing: "border-box",
        fontFamily: "'Share Tech Mono', 'Courier New', monospace",
      }}
    >
      {/* Matrix rain background */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0.15,
          zIndex: 0,
        }}
      />

      {/* Scanline overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 0, 0.03) 2px,
            rgba(0, 255, 0, 0.03) 4px
          )`,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Moving scan line */}
      <div
        style={{
          position: "absolute",
          top: `${scanLine}%`,
          left: 0,
          right: 0,
          height: "2px",
          background:
            "linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.3), transparent)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* Surveillance corner markers */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          color: "#333",
          fontSize: "10px",
          letterSpacing: "2px",
          zIndex: 3,
        }}
      >
        <div style={{ opacity: 0.4 }}>
          REC ● {new Date().toLocaleTimeString()}
        </div>
        <div style={{ opacity: 0.3, marginTop: "4px" }}>{glitchText}</div>
      </div>

      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          color: "#333",
          fontSize: "10px",
          letterSpacing: "2px",
          textAlign: "right",
          zIndex: 3,
        }}
      >
        <div style={{ opacity: 0.4 }}>CAM_07 // SECTOR_9</div>
        <div style={{ opacity: 0.3, marginTop: "4px" }}>
          LAT: 40.7128 LON: -74.0060
        </div>
      </div>

      {/* Main card */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "480px",
          margin: "0 20px",
          zIndex: 5,
        }}
      >
        {/* Form container */}
        <div
          style={{
            border: `1px solid ${classColor}22`,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            padding: "40px 32px",
            position: "relative",
            transition: "border-color 1s ease",
          }}
        >
          {/* Corner decorations on form */}
          {[
            {
              top: "-1px",
              left: "-1px",
              borderTop: `2px solid ${classColor}`,
              borderLeft: `2px solid ${classColor}`,
            },
            {
              top: "-1px",
              right: "-1px",
              borderTop: `2px solid ${classColor}`,
              borderRight: `2px solid ${classColor}`,
            },
            {
              bottom: "-1px",
              left: "-1px",
              borderBottom: `2px solid ${classColor}`,
              borderLeft: `2px solid ${classColor}`,
            },
            {
              bottom: "-1px",
              right: "-1px",
              borderBottom: `2px solid ${classColor}`,
              borderRight: `2px solid ${classColor}`,
            },
          ].map((style, i) => (
            <div
              key={i}
              style={
                {
                  ...style,
                  position: "absolute",
                  width: "16px",
                  height: "16px",
                  transition: "all 1s ease",
                } as React.CSSProperties
              }
            />
          ))}

          {/* Title */}
          <h1
            style={{
              textAlign: "center",
              fontSize: "32px",
              letterSpacing: "12px",
              color: classColor,
              fontWeight: "900",
              marginBottom: "8px",
              transition: "color 1s ease",
              minHeight: "38px",
              textShadow: `0 0 15px ${classColor}66`,
            }}
          >
            {typedTitle}
            <span
              style={{
                animation: "blink 1s step-end infinite",
                marginLeft: "4px",
              }}
            >
              _
            </span>
          </h1>
          <div style={{ marginBottom: "48px" }} />

          {/* Status indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginBottom: "24px",
              padding: "8px",
              border: `1px dashed ${classColor}44`,
              transition: "border-color 1s ease",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: classColor,
                boxShadow: `0 0 8px ${classColor}`,
                animation: "pulse 2s infinite",
                transition: "all 1s ease",
              }}
            />
            <span
              style={{
                fontSize: "14px",
                letterSpacing: "5px",
                color: classColor,
                fontWeight: "900",
                transition: "color 1s ease",
              }}
            >
              STATUS: {classification}
            </span>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              opacity: showForm ? 1 : 0,
              transform: showForm ? "translateY(0)" : "translateY(10px)",
              transition: "all 0.6s ease",
            }}
          >
            {[
              {
                name: "username",
                label: "DESIGNATION",
                type: "text",
                placeholder: "Enter asset designation...",
              },
              {
                name: "email",
                label: "COMM CHANNEL",
                type: "email",
                placeholder: "Enter communication channel...",
              },
              {
                name: "password",
                label: "ACCESS CODE",
                type: "password",
                placeholder: "Enter access code...",
              },
              {
                name: "confirmPassword",
                label: "VERIFY ACCESS CODE",
                type: "password",
                placeholder: "Re-enter access code...",
              },
            ].map((field) => (
              <div key={field.name}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    letterSpacing: "3px",
                    color: "#888",
                    fontWeight: "bold",
                    marginBottom: "8px",
                  }}
                >
                  {`> ${field.label}`}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name as keyof typeof formData]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  autoComplete="off"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    backgroundColor: "rgba(0, 255, 0, 0.03)",
                    border: "1px solid #222",
                    color: "#00ff00",
                    fontSize: "15px",
                    fontWeight: "900",
                    fontFamily: "'Share Tech Mono', 'Courier New', monospace",
                    letterSpacing: "2px",
                    outline: "none",
                    transition: "all 0.3s ease",
                    boxSizing: "border-box",
                    textShadow: "0 0 5px rgba(0, 255, 0, 0.7)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = classColor
                    e.target.style.boxShadow = `0 0 10px ${classColor}22, inset 0 0 10px ${classColor}11`
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#1a1a1a"
                    e.target.style.boxShadow = "none"
                  }}
                />
              </div>
            ))}

            {/* Submit button */}
            <button
              type="submit"
              style={{
                marginTop: "12px",
                padding: "14px",
                backgroundColor: "transparent",
                border: `2px solid ${classColor}`,
                color: classColor,
                fontSize: "16px",
                fontWeight: "900",
                letterSpacing: "8px",
                fontFamily: "'Share Tech Mono', 'Courier New', monospace",
                cursor: "pointer",
                transition: "all 0.3s ease",
                textTransform: "uppercase",
                position: "relative",
                overflow: "hidden",
                textShadow: `0 0 10px ${classColor}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${classColor}20`
                e.currentTarget.style.boxShadow = `0 0 25px ${classColor}33`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent"
                e.currentTarget.style.boxShadow = "none"
              }}
            >
              INITIALIZE ASSET
            </button>
          </form>

          {/* Footer */}
          <div
            style={{
              marginTop: "32px",
              textAlign: "center",
              fontSize: "12px",
              letterSpacing: "3px",
              color: "#555",
              fontWeight: "bold",
            }}
          >
            <div>
              ALREADY CLASSIFIED?{" "}
              <Link
                to="/login"
                style={{
                  color: classColor,
                  textDecoration: "none",
                  borderBottom: `1px solid ${classColor}`,
                  transition: "color 1s ease",
                }}
              >
                ACCESS TERMINAL
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Inject keyframe animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        
        @keyframes blink {
          50% { opacity: 0; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        
        input::placeholder {
          color: #2a2a2a !important;
          font-family: 'Share Tech Mono', 'Courier New', monospace;
          letter-spacing: 1px;
        }
        
        /* Remove autofill background */
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px #000 inset !important;
          -webkit-text-fill-color: #00ff00 !important;
          caret-color: #00ff00;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: #000;
        }
        ::-webkit-scrollbar-thumb {
          background: #1a1a1a;
        }
      `}</style>
    </div>
  )
}
