"use client"

import { useState, useEffect } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from "recharts"
import { Activity, Zap } from "lucide-react"

interface ChartsPanelProps {
  locations: any[]
}

export default function ChartsPanel({ locations }: ChartsPanelProps) {
  const [activeTab, setActiveTab] = useState<"live" | "forecast">("live")
  const [forecastData, setForecastData] = useState<any[]>([])
  const [selectedLoc, setSelectedLoc] = useState<number>(locations[0]?.id || 1)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  // Prepare Live Data
  const liveData = locations.map((loc) => ({
    name: loc.name,
    count: loc.current_count,
    capacity: loc.capacity,
    usage: loc.load_percentage,
  }))

  // Fetch Forecast when tab changes
  useEffect(() => {
    if (activeTab === "forecast" && locations.length > 0) {
        // Default to first location or currently selected
        const locId = selectedLoc || locations[0].id
        fetch(`${apiUrl}/forecast/${locId}`)
            .then(res => res.json())
            .then(data => setForecastData(data.forecast || []))
            .catch(err => console.error("Forecast error:", err))
    }
  }, [activeTab, selectedLoc, locations, apiUrl])

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            {activeTab === "live" ? <Activity className="w-5 h-5 text-blue-400" /> : <Zap className="w-5 h-5 text-purple-400" />}
            {activeTab === "live" ? "Live Occupancy" : "AI Crowd Prediction"}
        </h3>
        
        {/* Tab Switcher */}
        <div className="flex bg-slate-900/50 rounded-lg p-1 border border-slate-700">
            <button
                onClick={() => setActiveTab("live")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    activeTab === "live" ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-slate-200"
                }`}
            >
                Live
            </button>
            <button
                onClick={() => setActiveTab("forecast")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    activeTab === "forecast" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                }`}
            >
                Forecast
            </button>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        {activeTab === "live" ? (
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={liveData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f8fafc" }}
                itemStyle={{ color: "#f8fafc" }}
                cursor={{ fill: "#334155", opacity: 0.4 }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Current People" />
            </BarChart>
            </ResponsiveContainer>
        ) : (
            <div className="h-full flex flex-col">
                {/* Location Selector for Forecast */}
                <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                    {locations.map(loc => (
                        <button
                            key={loc.id}
                            onClick={() => setSelectedLoc(loc.id)}
                            className={`px-2 py-1 text-xs rounded border transition-colors whitespace-nowrap ${
                                selectedLoc === loc.id 
                                ? "bg-purple-500/20 border-purple-500 text-purple-300" 
                                : "bg-slate-700/50 border-slate-600 text-slate-400"
                            }`}
                        >
                            {loc.name}
                        </button>
                    ))}
                </div>
                <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecastData}>
                        <defs>
                            <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155" }} />
                        <Area type="monotone" dataKey="predicted_count" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorPred)" name="Predicted Count" />
                    </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        )}
      </div>
    </div>
  )
}