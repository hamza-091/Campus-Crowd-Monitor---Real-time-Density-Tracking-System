"use client"

import { useState, useEffect } from "react"
import Dashboard from "@/components/dashboard"
import LoginPage from "@/components/login-page"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token
    const token = localStorage.getItem("admin_token")
    if (token) {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    )
  }

  return isAuthenticated ? (
    <Dashboard
      onLogout={() => {
        localStorage.removeItem("admin_token")
        setIsAuthenticated(false)
      }}
    />
  ) : (
    <LoginPage onLogin={() => setIsAuthenticated(true)} />
  )
}
