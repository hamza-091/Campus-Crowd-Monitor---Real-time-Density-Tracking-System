"use client"

import { TrendingDown, AlertTriangle, CheckCircle, Zap } from "lucide-react"

interface CapacityRecommendationsProps {
  locations: Array<{
    id: number
    name: string
    capacity: number
    current_count: number
    load_percentage: number
    status: string
    available_capacity: number
  }>
}

export default function CapacityRecommendations({ locations }: CapacityRecommendationsProps) {
  if (locations.length === 0) return null

  const safestLocation = locations.reduce((min, loc) => (loc.load_percentage < min.load_percentage ? loc : min))
  const crowdedLocations = locations
    .filter((loc) => loc.load_percentage >= 80)
    .sort((a, b) => b.load_percentage - a.load_percentage)
  const avgLoad = (locations.reduce((sum, loc) => sum + loc.load_percentage, 0) / locations.length).toFixed(1)
  const totalCapacity = locations.reduce((sum, loc) => sum + loc.capacity, 0)
  const totalCrowd = locations.reduce((sum, loc) => sum + loc.current_count, 0)
  const utilizationRate = ((totalCrowd / totalCapacity) * 100).toFixed(1)

  const recommendations = []

  if (Number.parseFloat(avgLoad) > 80) {
    recommendations.push({
      type: "critical",
      title: "Campus at High Capacity",
      message: `Average load is ${avgLoad}%. Consider redirecting visitors to off-peak locations.`,
    })
  }

  if (crowdedLocations.length === locations.length) {
    recommendations.push({
      type: "warning",
      title: "All Locations Crowded",
      message: "All monitored locations are above 80% capacity. Implement crowd control measures.",
    })
  }

  if (safestLocation.available_capacity > totalCapacity * 0.3) {
    recommendations.push({
      type: "info",
      title: "Capacity Available",
      message: `${safestLocation.name} has significant availability. Recommend visitors there.`,
    })
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <TrendingDown className="w-6 h-6 text-blue-400" />
        Smart Campus Recommendations & Analytics
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* FIXED: bg-gradient-to-br -> bg-linear-to-br */}
        <div className="p-4 bg-linear-to-br from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/30">
          <p className="text-xs text-slate-400 mb-1">Overall Utilization</p>
          <p className="text-3xl font-bold text-blue-400">{utilizationRate}%</p>
          <p className="text-xs text-slate-500 mt-2">
            {totalCrowd} / {totalCapacity} capacity
          </p>
        </div>

        {/* FIXED: bg-gradient-to-br -> bg-linear-to-br */}
        <div className="p-4 bg-linear-to-br from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/30">
          <p className="text-xs text-slate-400 mb-1">Average Campus Load</p>
          <p className="text-3xl font-bold text-purple-400">{avgLoad}%</p>
          <p className="text-xs text-slate-500 mt-2">Across {locations.length} locations</p>
        </div>

        {/* FIXED: bg-gradient-to-br -> bg-linear-to-br */}
        <div className="p-4 bg-linear-to-br from-green-500/10 to-green-600/10 rounded-lg border border-green-500/30">
          <p className="text-xs text-slate-400 mb-1">Safest Location</p>
          <p className="text-white font-semibold">{safestLocation.name}</p>
          <p className="text-xs text-slate-500 mt-2">{safestLocation.load_percentage.toFixed(1)}% loaded</p>
        </div>

        {/* FIXED: bg-gradient-to-br -> bg-linear-to-br */}
        <div className="p-4 bg-linear-to-br from-orange-500/10 to-orange-600/10 rounded-lg border border-orange-500/30">
          <p className="text-xs text-slate-400 mb-1">Available Capacity</p>
          <p className="text-3xl font-bold text-orange-400">
            {locations.reduce((sum, loc) => sum + loc.available_capacity, 0)}
          </p>
          <p className="text-xs text-slate-500 mt-2">Across all locations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Available Location */}
        <div className="p-6 bg-green-500/10 rounded-lg border border-green-500/30">
          <div className="flex items-start gap-4">
            {/* FIXED: flex-shrink-0 -> shrink-0 */}
            <CheckCircle className="w-6 h-6 text-green-400 mt-1 shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-white mb-2">Recommended Location</h4>
              <p className="text-lg font-bold text-green-400">{safestLocation.name}</p>
              <div className="mt-3 space-y-1 text-sm">
                <p className="text-slate-300">
                  <span className="text-slate-400">Load:</span> {safestLocation.load_percentage.toFixed(1)}%
                </p>
                <p className="text-slate-300">
                  <span className="text-slate-400">Available Capacity:</span> {safestLocation.available_capacity} spots
                </p>
                <p className="text-slate-300">
                  <span className="text-slate-400">Current Count:</span> {safestLocation.current_count} /{" "}
                  {safestLocation.capacity}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Crowded Locations Alert */}
        {crowdedLocations.length > 0 && (
          <div className="p-6 bg-red-500/10 rounded-lg border border-red-500/30">
            <div className="flex items-start gap-4">
              {/* FIXED: flex-shrink-0 -> shrink-0 */}
              <AlertTriangle className="w-6 h-6 text-red-400 mt-1 shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-2">Crowded Locations ({crowdedLocations.length})</h4>
                <div className="space-y-2">
                  {crowdedLocations.map((loc) => (
                    <div key={loc.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                      <span className="text-sm text-slate-300">{loc.name}</span>
                      <span
                        className={`text-sm font-semibold ${loc.status === "CRITICAL" ? "text-red-400" : "text-yellow-400"}`}
                      >
                        {loc.load_percentage.toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {recommendations.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="font-semibold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Active Recommendations
          </h4>
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border ${
                rec.type === "critical"
                  ? "bg-red-500/10 border-red-500/30 text-red-300"
                  : rec.type === "warning"
                    ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
                    : "bg-blue-500/10 border-blue-500/30 text-blue-300"
              }`}
            >
              <p className="font-medium">{rec.title}</p>
              <p className="text-xs mt-1 text-slate-300">{rec.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Statistics */}
      <div className="mt-6 pt-6 border-t border-slate-700">
        <p className="text-xs text-slate-400 mb-3">System Statistics</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-2">
            <p className="text-2xl font-bold text-white">{locations.length}</p>
            <p className="text-xs text-slate-400">Total Locations</p>
          </div>
          <div className="text-center p-2">
            <p className="text-2xl font-bold text-white">{locations.filter((l) => l.status === "NORMAL").length}</p>
            <p className="text-xs text-slate-400">Normal Status</p>
          </div>
          <div className="text-center p-2">
            <p className="text-2xl font-bold text-yellow-400">
              {locations.filter((l) => l.status === "WARNING").length}
            </p>
            <p className="text-xs text-slate-400">Warnings</p>
          </div>
          <div className="text-center p-2">
            <p className="text-2xl font-bold text-red-400">{locations.filter((l) => l.status === "CRITICAL").length}</p>
            <p className="text-xs text-slate-400">Critical</p>
          </div>
        </div>
      </div>
    </div>
  )
}