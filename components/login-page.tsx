"use client"

import type React from "react"

import { useState } from "react"
import { AlertCircle } from "lucide-react"

interface LoginPageProps {
  onLogin: () => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("admin")
  const [password, setPassword] = useState("admin123")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/login?username=${username}&password=${password}`,
        {
          method: "POST",
        },
      )

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("admin_token", data.access_token)
        onLogin()
      } else {
        setError("Invalid credentials")
      }
    } catch (err) {
      setError("Failed to connect to server")
    } finally {
      setLoading(false)
    }
  }

  return (
    // FIX: bg-gradient-to-br -> bg-linear-to-br
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          
          {/* Header with LOGO */}
          <div className="text-center mb-8 relative z-10">
            <div className="inline-block p-1 bg-slate-700/50 rounded-2xl mb-4 border border-slate-600 shadow-xl">
              <div className="w-20 h-20 rounded-xl overflow-hidden">
                 {/* UPDATED LOGO IMAGE */}
                <img src="/logo.jpg" alt="Campus Logo" className="w-full h-full object-cover" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Campus Monitor</h1>
            <p className="text-slate-400 text-sm font-medium">Secure Admin Access</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3 relative z-10">
              {/* FIX: flex-shrink-0 -> shrink-0 */}
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              {loading ? "Verifying..." : "Sign In to Dashboard"}
            </button>
          </form>

          {/* Demo Info */}
          <div className="mt-8 pt-6 border-t border-slate-700/50 text-center relative z-10">
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-400">Demo Credentials:</span> admin / admin123
            </p>
          </div>

          {/* Background Decoration */}
          {/* FIX: bg-gradient-to-r -> bg-linear-to-r */}
          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-blue-500 via-purple-500 to-blue-500"></div>
        </div>
      </div>
    </div>
  )
}