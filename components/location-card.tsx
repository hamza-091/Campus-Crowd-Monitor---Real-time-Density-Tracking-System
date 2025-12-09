"use client"

import { Plus, Minus, Lock, Unlock, IdCard } from "lucide-react"

interface Location {
  id: number
  name: string
  capacity: number
  current_count: number
  status: string
  entry_closed: number
  load_percentage: number
  available_capacity: number
}

interface LocationCardProps {
  location: Location
  onUpdate: (id: number, action: "enter" | "exit") => void
}

export default function LocationCard({ location, onUpdate }: LocationCardProps) {
  
  // Logic to determine the text, color, and icon
  const getStatusDisplay = () => {
    
    // SPECIAL RULE: Academic Block Priority Mode (120+ people)
    if (location.name === "Academic Block" && location.current_count >= 120 && location.current_count < location.capacity) {
      return {
        text: "Status: Students who have classes can enter only ", // <--- Updated Message
        color: "text-orange-400",
        bgColor: "bg-orange-500/10 border-orange-500/30",
        icon: <IdCard className="w-4 h-4" />
      }
    }

    // Standard Logic for other places
    if (location.status === "CRITICAL" || location.entry_closed === 1) {
      return {
        text: "Status: Entry Closed",
        color: "text-red-400",
        bgColor: "bg-red-500/10 border-red-500/30",
        icon: <Lock className="w-4 h-4" />
      }
    } else if (location.status === "WARNING") {
      return {
        text: "Status: On Warning",
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/10 border-yellow-500/30",
        icon: <Unlock className="w-4 h-4" />
      }
    } else {
      return {
        text: "Status: Normal",
        color: "text-green-400",
        bgColor: "bg-slate-700/30 border-slate-600/30",
        icon: <Unlock className="w-4 h-4" />
      }
    }
  }

  const statusDisplay = getStatusDisplay()

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
    // Special Orange for Academic Block
    if (location.name === "Academic Block" && location.current_count >= 120) return "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
    
    if (percentage >= 80) return "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
    return "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
  }

  // Calculate if we have hit the hard limit (Capacity + 1)
  const isFull = location.current_count >= location.capacity + 1;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col h-full shadow-lg transition-all duration-300 hover:border-slate-600">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">{location.name}</h3>
          <p className="text-xs text-slate-400">Capacity: {location.capacity}</p>
        </div>
        <div className={`p-1.5 rounded-lg ${
            location.entry_closed ? 'bg-red-500/20 text-red-400' : 
            (location.name === "Academic Block" && location.current_count >= 120) ? 'bg-orange-500/20 text-orange-400' :
            'bg-green-500/20 text-green-400'
        }`}>
            {statusDisplay.icon}
        </div>
      </div>

      {/* Main Count */}
      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className={`text-4xl font-bold ${
            location.status === "CRITICAL" ? "text-red-500" : 
            (location.name === "Academic Block" && location.current_count >= 120) ? "text-orange-400" :
            location.status === "WARNING" ? "text-yellow-400" : "text-white"
          }`}>
            {location.current_count}
          </span>
          <span className="text-slate-500 font-medium">/ {location.capacity}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-700/50 rounded-full h-2.5 mb-4 overflow-hidden border border-slate-700">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ease-out ${getProgressColor(location.load_percentage)}`}
          style={{ width: `${Math.min(location.load_percentage, 100)}%` }}
        ></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase">Load</p>
          <p className={`text-sm font-bold ${
             location.load_percentage >= 80 ? "text-white" : "text-slate-200"
          }`}>
            {location.load_percentage.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase">Available</p>
          <p className="text-sm font-bold text-white">{location.available_capacity}</p>
        </div>
      </div>

      {/* Descriptive Status Message */}
      <div className={`mt-auto mb-4 p-2 rounded-lg border text-xs font-medium text-center ${statusDisplay.bgColor} ${statusDisplay.color}`}>
        {statusDisplay.text}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        <button
          onClick={() => onUpdate(location.id, "enter")}
          disabled={location.entry_closed === 1 || isFull}
          className="flex items-center justify-center gap-2 py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium text-sm shadow-lg shadow-green-900/20"
        >
          <Plus className="w-4 h-4" /> Enter
        </button>
        <button
          onClick={() => onUpdate(location.id, "exit")}
          disabled={location.current_count === 0}
          className="flex items-center justify-center gap-2 py-2 px-4 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium text-sm shadow-lg shadow-orange-900/20"
        >
          <Minus className="w-4 h-4" /> Exit
        </button>
      </div>
    </div>
  )
}