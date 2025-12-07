"use client"

import { Lock, AlertCircle, Plus, Minus, LogIn, LogOut } from "lucide-react"
import { useState } from "react"

interface LocationCardProps {
  location: {
    id: number
    name: string
    capacity: number
    current_count: number
    status: string
    entry_closed: number
    load_percentage: number
    available_capacity: number
  }
  onUpdate?: (locationId: number, newCount: number) => void
}

export default function LocationCard({ location, onUpdate }: LocationCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [hoverEnter, setHoverEnter] = useState(false)
  const [hoverExit, setHoverExit] = useState(false)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  const getStatusColor = () => {
    if (location.entry_closed) return "status-closed"
    if (location.status === "CRITICAL") return "status-critical"
    if (location.status === "WARNING") return "status-warning"
    return "status-normal"
  }

  const getProgressColor = () => {
    if (location.entry_closed) return "bg-gray-500"
    if (location.status === "CRITICAL") return "bg-red-500"
    if (location.status === "WARNING") return "bg-yellow-500"
    return "bg-green-500"
  }

  const handleEntry = async () => {
    setIsUpdating(true)
    try {
      console.log("[v0] Entry button clicked for location:", location.id)
      const response = await fetch(`${apiUrl}/enter?location_id=${location.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("[v0] Entry response status:", response.status)
      const data = await response.json()
      console.log("[v0] Entry response data:", data)

      if (response.ok && data.success && onUpdate) {
        console.log("[v0] Entry successful, new count:", data.current_count)
        onUpdate(location.id, data.current_count)
      } else if (!data.success && data.is_reroute) {
        console.log("[v0] Entry closed, reroute suggestion:", data.reroute_location)
        alert(`Entry closed! Suggested location: ${data.reroute_location}`)
      }
    } catch (err) {
      console.error("[v0] Entry error:", err)
      alert("Error recording entry. Please try again.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleExit = async () => {
    setIsUpdating(true)
    try {
      console.log("[v0] Exit button clicked for location:", location.id)
      const response = await fetch(`${apiUrl}/exit?location_id=${location.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("[v0] Exit response status:", response.status)
      const data = await response.json()
      console.log("[v0] Exit response data:", data)

      if (response.ok && data.success && onUpdate) {
        console.log("[v0] Exit successful, new count:", data.current_count)
        onUpdate(location.id, data.current_count)
      }
    } catch (err) {
      console.error("[v0] Exit error:", err)
      alert("Error recording exit. Please try again.")
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{location.name}</h3>
          <p className="text-xs text-slate-400 mt-1">Capacity: {location.capacity}</p>
        </div>
        {location.entry_closed && <Lock className="w-5 h-5 text-red-400" />}
      </div>

      {/* Current Count */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-3xl font-bold text-white">{location.current_count}</span>
        <span className="text-slate-400 text-sm">/ {location.capacity}</span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all ${getProgressColor()}`}
            style={{ width: `${Math.min(location.load_percentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-slate-400">Load</p>
          <p className="text-white font-semibold">{location.load_percentage.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-slate-400">Available</p>
          <p className="text-white font-semibold">{location.available_capacity}</p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <span className={`status-badge ${getStatusColor()}`}>
          {location.entry_closed ? "ENTRY CLOSED" : location.status}
        </span>
        {location.status === "CRITICAL" && <AlertCircle className="w-4 h-4 text-red-400" />}
      </div>

      {/* Entry Closed Warning */}
      {location.entry_closed && (
        <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
          Entry automatically closed due to overcrowding
        </div>
      )}

      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700">
        <button
          onClick={handleEntry}
          disabled={isUpdating || location.entry_closed}
          onMouseEnter={() => setHoverEnter(true)}
          onMouseLeave={() => setHoverEnter(false)}
          className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed text-white text-xs font-medium py-2 rounded transition-all duration-200"
          title="Random people enter"
        >
          {hoverEnter ? <LogIn className="w-4 h-4" /> : <Plus className="w-3 h-3" />}
          {isUpdating ? "..." : "Enter"}
        </button>
        <button
          onClick={handleExit}
          disabled={isUpdating || location.current_count === 0}
          onMouseEnter={() => setHoverExit(true)}
          onMouseLeave={() => setHoverExit(false)}
          className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-600/50 disabled:cursor-not-allowed text-white text-xs font-medium py-2 rounded transition-all duration-200"
          title="Random people exit"
        >
          {hoverExit ? <LogOut className="w-4 h-4" /> : <Minus className="w-3 h-3" />}
          {isUpdating ? "..." : "Exit"}
        </button>
      </div>
    </div>
  )
}
