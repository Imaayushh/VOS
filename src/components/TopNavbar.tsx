"use client";

import React from "react";
import { Eye, Network, Cpu, DollarSign, Activity, FileText, ChevronRight, CheckCircle2 } from "lucide-react";

interface TopNavbarProps {
  activeTab: "3d" | "pipeline" | "vision" | "cost";
  onTabChange: (tab: "3d" | "pipeline" | "vision" | "cost") => void;
  onOpenArchitecture: () => void;
}

export default function TopNavbar({ activeTab, onTabChange, onOpenArchitecture }: TopNavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-surfaceBorder bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Brand & Metadata */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white font-mono">
                VICTOR INSTRUMENTS AND SYSTEMS
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] font-semibold">
                R&D AREA 2 • FIELD PoC
              </span>
            </div>
          </div>
        </div>

        {/* Center: Main View Navigation */}
        <nav className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => onTabChange("3d")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "3d"
                ? "bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> 3D Prototype
          </button>
          <button
            onClick={() => onTabChange("pipeline")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "pipeline"
                ? "bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> HW-SW Integration
          </button>
          <button
            onClick={() => onTabChange("vision")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "vision"
                ? "bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Live Feeds & HUD
          </button>
          <button
            onClick={() => onTabChange("cost")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "cost"
                ? "bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" /> ₹30k BOM Cost
          </button>
        </nav>

        {/* Right: Quick Action & Live Telemetry Pills */}
        <div className="flex items-center gap-2.5 text-xs font-mono">
          <button
            onClick={onOpenArchitecture}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700/80 flex items-center gap-1.5 transition-all"
          >
            <Network className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Schematics</span>
          </button>

          {/* Status badge */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>KOP-001 ONLINE</span>
          </div>
        </div>
      </div>
    </header>
  );
}
