"use client"

import { useState, useEffect, useCallback } from "react"
import { LogOut, AlertTriangle, Zap, RefreshCw, Play, Pause, LayoutGrid, Map as MapIcon, Heart } from "lucide-react"
import LocationCard from "./location-card"
import AlertPanel from "./alert-panel"
import ChartsPanel from "./charts-panel"
import CapacityRecommendations from "./capacity-recommendations"
import CampusMap from "./campus-map"

interface DashboardProps {
  onLogout: () => void
}

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

// Define a simpler Alert interface for frontend generation
interface GeneratedAlert {
  id: string
  location_id: number
  location_name: string
  message: string
  alert_type: "critical" | "warning"
  timestamp: string
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [alerts, setAlerts] = useState<GeneratedAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [totalCrowd, setTotalCrowd] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isAutoMode, setIsAutoMode] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid")

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const statusRes = await fetch(`${apiUrl}/status`)

      if (!statusRes.ok) {
        throw new Error(`API error: ${statusRes.status}`)
      }

      const statusData = await statusRes.json()
      
      if (statusData.locations && Array.isArray(statusData.locations)) {
        // Sort locations by ID to prevent cards from jumping positions
        const sortedLocs = statusData.locations.sort((a: Location, b: Location) => a.id - b.id)
        
        setLocations(sortedLocs)
        
        // Calculate totals
        const total = sortedLocs.reduce((sum: number, loc: Location) => sum + loc.current_count, 0)
        setTotalCrowd(total)

        // Generate Alerts purely based on Current Status
        const currentAlerts: GeneratedAlert[] = []
        
        sortedLocs.forEach((loc: Location) => {
            if (loc.status === "CRITICAL") {
                currentAlerts.push({
                    id: `crit-${loc.id}-${Date.now()}`,
                    location_id: loc.id,
                    location_name: loc.name,
                    alert_type: "critical",
                    message: `${loc.name} is overloaded (${loc.current_count}/${loc.capacity}). Entry closed.`,
                    timestamp: new Date().toISOString()
                })
            } else if (loc.status === "WARNING") {
                currentAlerts.push({
                    id: `warn-${loc.id}-${Date.now()}`,
                    location_id: loc.id,
                    location_name: loc.name,
                    alert_type: "warning",
                    message: `${loc.name} is approaching capacity (${loc.load_percentage.toFixed(0)}%).`,
                    timestamp: new Date().toISOString()
                })
            }
        })
        setAlerts(currentAlerts)
      }

      setLastUpdate(new Date())
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch data"
      console.error("[v0] Fetch error:", errorMsg)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [apiUrl])

  const runSimulation = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/simulate`, {
        method: "POST",
      })

      if (response.ok) {
        await fetchData()
      } else {
        console.error("Simulation failed")
      }
    } catch (err) {
        console.error("Backend connection failed during simulation")
    }
  }, [apiUrl, fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!isAutoMode) return
    runSimulation()
    const interval = setInterval(runSimulation, 3000)
    return () => clearInterval(interval)
  }, [isAutoMode, runSimulation])

  const handleReset = async () => {
    try {
      const response = await fetch(`${apiUrl}/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        await fetchData()
        console.log("Counts reset successfully")
      } else {
         const text = await response.text()
         console.error("Reset failed:", text)
         alert("Reset failed. Server error.")
      }
    } catch (err) {
      console.error("Reset failed:", err)
      alert("Error resetting counts. Is the backend running?")
    }
  }

  // FIX: Renamed to handleManualAction and added ACTUAL API CALL
  const handleManualAction = async (locationId: number, action: "enter" | "exit") => {
    // 1. Optimistic Update (Make UI feel fast)
    setLocations((prevLocations) =>
      prevLocations.map((loc) => {
        if (loc.id === locationId) {
          const change = action === "enter" ? 1 : -1
          // Clamp count locally so it looks right immediately
          const newCount = Math.max(0, Math.min(loc.current_count + change, loc.capacity + 1))
          
          const loadPercentage = (newCount / loc.capacity) * 100
          return {
            ...loc,
            current_count: newCount,
            load_percentage: loadPercentage,
            available_capacity: Math.max(0, loc.capacity - newCount),
            status: loadPercentage > 100 ? "CRITICAL" : loadPercentage >= 80 ? "WARNING" : "NORMAL",
            entry_closed: loadPercentage > 100 ? 1 : 0,
          }
        }
        return loc
      }).sort((a, b) => a.id - b.id)
    )
    
    // 2. Send command to Backend (The missing part!)
    try {
        const response = await fetch(`${apiUrl}/${action}?location_id=${locationId}`, {
            method: "POST"
        })
        
        if (!response.ok) {
            console.error("Failed to update backend")
        }
        
        // 3. Re-fetch to ensure sync with server logic
        await fetchData()
        
    } catch (error) {
        console.error("API Error:", error)
        // If error, reverting would happen automatically on next poll
    }
  }

  const handleRefreshClick = async () => {
    setIsRefreshing(true)
    if (isAutoMode) {
        await runSimulation()
    } else {
        await fetchData()
    }
    setIsRefreshing(false)
  }

  const criticalAlerts = alerts.filter((a) => a.alert_type === "critical").length
  const warningAlerts = alerts.filter((a) => a.alert_type === "warning").length

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-700 bg-slate-900/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 rounded-lg overflow-hidden shadow-lg shadow-blue-500/20">
              <img src="/logo.jpg" alt="Logo" className="object-cover w-full h-full" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight leading-tight">Campus Crowd Monitor</h1>
              <p className="text-xs text-slate-400 font-medium">Real-time Density Tracking System</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAutoMode(!isAutoMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm border ${
                isAutoMode
                  ? "bg-purple-600 hover:bg-purple-700 text-white border-purple-500 shadow-lg shadow-purple-900/50"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
              }`}
              title={isAutoMode ? "Switch to Manual mode" : "Switch to Auto mode"}
            >
              {isAutoMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span className="text-xs uppercase tracking-wide font-bold">{isAutoMode ? "Auto: ON" : "Auto: OFF"}</span>
            </button>

            <button
                onClick={handleRefreshClick}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-all duration-200 font-medium text-sm shadow-lg shadow-blue-900/30"
                title={isAutoMode ? "Simulate next movement immediately" : "Refresh data"}
            >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">
                    {isRefreshing ? "Updating..." : isAutoMode ? "Simulate" : "Refresh"}
                </span>
            </button>

            {error && (
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs font-medium animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                <span>Offline</span>
              </div>
            )}

            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Crowd</p>
            <p className="text-3xl font-bold text-white mt-1">{totalCrowd}</p>
            <p className="text-xs text-slate-500 mt-1">Across all locations</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Locations</p>
            <p className="text-3xl font-bold text-white mt-1">{locations.length}</p>
            <p className="text-xs text-slate-500 mt-1">Active sensors</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 backdrop-blur-sm">
            {criticalAlerts > 0 && (
              <div className="flex items-center gap-2 text-red-400 mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase">Critical</span>
              </div>
            )}
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Critical Alerts</p>
            <p className="text-3xl font-bold text-red-400 mt-1">{criticalAlerts}</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 backdrop-blur-sm">
            {warningAlerts > 0 && (
              <div className="flex items-center gap-2 text-yellow-400 mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-bold uppercase">Warning</span>
              </div>
            )}
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Warning Alerts</p>
            <p className="text-3xl font-bold text-yellow-400 mt-1">{warningAlerts}</p>
          </div>
        </div>

        {/* Locations Section with View Switcher */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Location Status
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs text-slate-400 border border-slate-700">Live</span>
            </h2>
            
            <div className="flex items-center gap-3">
                <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex gap-1">
                    <button 
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-md transition-all ${viewMode === "grid" ? "bg-slate-600 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}
                        title="Grid View"
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setViewMode("map")}
                        className={`p-2 rounded-md transition-all ${viewMode === "map" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}
                        title="Map View"
                    >
                        <MapIcon className="w-4 h-4" />
                    </button>
                </div>

                <div className="h-6 w-px bg-slate-700 mx-1"></div>

                <button
                onClick={handleReset}
                className="text-xs font-bold px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg transition-colors"
                >
                Reset System
                </button>
            </div>
          </div>

          {/* Conditional Rendering: Grid or Map */}
          <div className="transition-all duration-300 ease-in-out">
            {viewMode === "grid" ? (
                locations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* FIX: Passed handleManualAction instead of the old function */}
                    {locations.map((location) => (
                        <LocationCard key={location.id} location={location} onUpdate={handleManualAction} />
                    ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-6 animate-pulse h-40">
                            <div className="h-4 bg-slate-700 rounded w-24 mb-4"></div>
                        </div>
                    ))}
                    </div>
                )
            ) : (
                <CampusMap locations={locations} />
            )}
          </div>
        </div>

        {/* Charts and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <ChartsPanel locations={locations} />
          </div>
          <AlertPanel alerts={alerts} />
        </div>

        <div className="mb-8">
          <CapacityRecommendations locations={locations} />
        </div>

        <div className="flex justify-end items-center gap-4 mt-2 mb-4">
          <p className="text-xs text-slate-500 font-mono">
            System Synced: {lastUpdate?.toLocaleTimeString('en-PK', { timeZone: 'Asia/Karachi' }) || "Pending..."}
          </p>
          {isAutoMode && (
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs text-purple-400 font-bold animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                AI Simulation Active
              </span>
          )}
        </div>
      </main>

      <footer className="border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg overflow-hidden shadow-lg shadow-blue-900/20">
                    <img src="/logo.jpg" alt="Logo" className="object-cover w-full h-full" />
                </div>
                <div>
                    <p className="text-slate-300 font-bold text-sm">Campus Crowd Monitor</p>
                    <p className="text-slate-500 text-xs">© {new Date().getFullYear()} All rights reserved.</p>
                </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm font-medium text-slate-400 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50">
                <span>Made with</span>
                <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
                <span>by <span className="text-white font-bold">Hamza</span></span>
            </div>
        </div>
      </footer>
    </div>
  )
}