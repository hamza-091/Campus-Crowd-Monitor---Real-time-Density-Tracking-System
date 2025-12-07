"use client"

import { AlertTriangle, Info } from "lucide-react"

interface AlertPanelProps {
  alerts: any[]
}

export default function AlertPanel({ alerts }: AlertPanelProps) {
  const activeAlerts = alerts.filter((a) => a.alert_type === "critical" || a.alert_type === "warning")

  if (activeAlerts.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Alerts</h3>
        <div className="text-center py-8">
          <Info className="w-8 h-8 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400">No active critical or warning alerts</p>
        </div>
      </div>
    )
  }

  // Helper function to format time specifically for Pakistan
  const formatPKT = (timestamp: string) => {
    // Ensure the timestamp is treated as UTC by appending 'Z' if missing
    const timeString = timestamp.endsWith("Z") ? timestamp : `${timestamp}Z`
    const date = new Date(timeString)
    
    return date.toLocaleTimeString('en-PK', { 
        timeZone: 'Asia/Karachi',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    })
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
      <h3 className="text-lg font-semibold text-white mb-4 sticky top-0 bg-slate-800 py-2 z-10">
        Active Alerts ({activeAlerts.length})
      </h3>
      <div className="space-y-3">
        {activeAlerts.map((alert, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border transition-all duration-300 hover:scale-[1.02] ${
              alert.alert_type === "critical"
                ? "bg-red-500/10 border-red-500/30 hover:bg-red-500/20"
                : "bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20"
            }`}
          >
            <div className="flex gap-3">
              <div className={`p-2 rounded-full shrink-0 ${
                  alert.alert_type === "critical" ? "bg-red-500/20" : "bg-yellow-500/20"
                }`}>
                <AlertTriangle
                  className={`w-5 h-5 ${
                    alert.alert_type === "critical" ? "text-red-400" : "text-yellow-400"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0 py-0.5">
                <p
                  className={`text-sm font-bold ${
                    alert.alert_type === "critical" ? "text-red-400" : "text-yellow-400"
                  }`}
                >
                  {alert.location_name} Status Update
                </p>
                <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                  {alert.message}
                </p>
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1 font-mono">
                  {formatPKT(alert.timestamp)} (PKT)
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}