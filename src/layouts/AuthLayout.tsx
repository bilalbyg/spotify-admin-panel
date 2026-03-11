import { Outlet } from "react-router-dom"

export default function AuthLayout() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: "#000",
      }}
    >
      <Outlet />
    </div>
  )
}
