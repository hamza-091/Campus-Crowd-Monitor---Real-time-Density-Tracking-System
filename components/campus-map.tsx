"use client"

import { useState } from "react"
import { MapPin } from "lucide-react"

interface Location {
  id: number
  name: string
  status: string
  load_percentage: number
}

interface CampusMapProps {
  locations: Location[]
}

export default function CampusMap({ locations }: CampusMapProps) {
  // CONFIGURATION: Adjust these coordinates (%) to match your specific map image
  const mapCoordinates: Record<string, { top: string; left: string }> = {
    "Admin Block": { top: "18%", left: "55%" },
    "Basketball Court": { top: "50%", left: "35%" },
    "Cafeteria": { top: "53%", left: "80%" },
    "Academic Block": { top: "85%", left: "46%" },
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CRITICAL": return "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]"
      case "WARNING": return "bg-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.6)]"
      default: return "bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]"
    }
  }

  return (
    // UPDATED: Removed 'aspect-video'. 'w-full' lets it fill width, height adapts to image.
    <div className="relative w-full bg-slate-800 rounded-xl overflow-hidden border border-slate-700 group">
      
      {/* UPDATED IMAGE STYLES: 
         - 'w-full h-auto': Ensures image fills width and maintains aspect ratio.
         - 'block': Removes tiny bottom gap typical with inline images.
      */}
      <img 
        src="/campus-map.png" 
        alt="Campus Map" 
        className="w-full h-auto block opacity-60 group-hover:opacity-70 transition-opacity duration-300"
        onError={(e) => {
            e.currentTarget.style.display = 'none'
            e.currentTarget.parentElement?.classList.add('h-96', 'flex', 'items-center', 'justify-center')
        }}
      />
      
      {/* Fallback Text (only visible if image fails) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <span className="text-slate-600 font-bold text-4xl opacity-20 select-none hidden group-hover:block">CAMPUS MAP</span>
      </div>

      {/* Heatmap Dots */}
      {locations.map((loc) => {
        const coords = mapCoordinates[loc.name] || { top: "50%", left: "50%" }
        
        return (
          <div
            key={loc.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all duration-300 hover:scale-110 z-10"
            style={{ top: coords.top, left: coords.left }}
          >
            {/* Pin Icon - Big Size */}
            <MapPin className="w-6 h-6 text-white absolute -top-6 drop-shadow-md" />

            {/* Pulsing Dot - Big Size */}
            <div className={`w-8 h-8 rounded-full border-2 border-white ${getStatusColor(loc.status)} animate-pulse shadow-lg`}></div>
            
            {/* Label */}
            <div className="mt-2 px-2 py-1 bg-slate-900/90 rounded text-[10px] font-bold text-white border border-slate-600 whitespace-nowrap shadow-sm">
              {loc.name} ({loc.load_percentage.toFixed(0)}%)
            </div>
            
          </div>
        )
      })}
    </div>
  )
}