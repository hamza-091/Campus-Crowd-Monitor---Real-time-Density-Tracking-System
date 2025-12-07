"use client"

import { useState, useEffect } from "react"
import { LogIn, LogOut } from "lucide-react"

type HistoryPanelProps = {}

export default function HistoryPanel({}: HistoryPanelProps) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${apiUrl}/history`)
        if (response.ok) {
          const data = await response.json()
          setHistory(data.logs.slice(0, 20))
        }
      } catch (err) {
        console.error("Failed to fetch history:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
    const interval = setInterval(fetchHistory, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Activity History (Last 20)</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Action</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Location</th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry: any, idx) => (
              <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {entry.action === "enter" ? (
                      <LogIn className="w-4 h-4 text-green-400" />
                    ) : (
                      <LogOut className="w-4 h-4 text-blue-400" />
                    )}
                    <span className="capitalize font-medium text-white">{entry.action}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-300">Location {entry.location_id}</td>
                <td className="py-3 px-4 text-slate-400">{new Date(entry.timestamp).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
