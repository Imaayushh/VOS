"use client";

import React, { useState } from "react";
import { BOM_DATA, BOMItem } from "../data/hardwareSpecs";
import { DollarSign, CheckCircle2, AlertCircle, ArrowUpRight, Filter, Calculator, Download } from "lucide-react";

export default function CostExplorer() {
  const [tier, setTier] = useState<"poc" | "production">("poc");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Compute", "Optics", "Network", "Storage", "Infrastructure", "Power", "Buffer"];

  const filteredItems = selectedCategory === "All"
    ? BOM_DATA
    : BOM_DATA.filter((item) => item.category === selectedCategory);

  const pocTotal = BOM_DATA.reduce((acc, item) => acc + item.cost, 0);
  const upgradeDeltaTotal = BOM_DATA.reduce((acc, item) => acc + (item.upgradeDelta || 0), 0);
  const productionTotal = pocTotal + upgradeDeltaTotal;

  const currentTotal = tier === "poc" ? pocTotal : productionTotal;

  return (
    <div className="rounded-2xl border border-surfaceBorder bg-surface/80 backdrop-blur-xl p-6 shadow-2xl space-y-6">
      {/* Header & Tier Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px] font-semibold">
              OFFICIAL BILL OF MATERIALS (BOM)
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-slate-400 text-xs">Track: R&D Area 2 — VOS Vision</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Hardware Project Costing & Component Breakdown
          </h2>
        </div>

        {/* Tier Selector Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => setTier("poc")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tier === "poc"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ₹30,000 Field PoC (Locked)
          </button>
          <button
            onClick={() => setTier("production")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tier === "production"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ₹51,000 24/7 Production Tier
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Total Project Investment</span>
          <div className="text-2xl font-bold text-white font-mono flex items-baseline gap-2">
            <span className={tier === "poc" ? "text-cyan-400" : "text-emerald-400"}>
              ₹{currentTotal.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-slate-500 font-sans font-normal">
              {tier === "poc" ? "Daytime Single Bridge" : "Full 24/7 Industrial Rig"}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            {tier === "poc" ? "₹28,000 hardware + ₹2,000 field buffer" : "+₹21,000 hardware upgrade delta"}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Field Site Location</span>
          <div className="text-lg font-semibold text-slate-200 font-mono">
            Kopargaon (VOS-KOP-001)
          </div>
          <span className="text-[10px] text-slate-400 block">
            Victor Instruments and Systems
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase">Budget Optimization Strategy</span>
          <div className="text-sm font-semibold text-amber-300">
            {tier === "poc" ? "Aggressive PoC Cost Cuts" : "High Reliability Enterprise"}
          </div>
          <span className="text-[10px] text-slate-400 block">
            {tier === "poc" ? "Saved ₹21k by cutting UPS, SSD, IR & 4MP" : "Includes UPS backup, NVMe SSD & 4MP"}
          </span>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 font-mono flex items-center gap-1 text-[11px]">
          <Filter className="w-3 h-3" /> FILTER:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-lg transition-all ${
              selectedCategory === cat
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium"
                : "bg-slate-900/50 text-slate-400 border border-slate-800 hover:text-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Itemized BOM Table */}
      <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/70">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 font-mono border-b border-slate-800">
                <th className="py-3 px-4 w-10">#</th>
                <th className="py-3 px-4">Component & Model</th>
                <th className="py-3 px-4">Technical Specification</th>
                <th className="py-3 px-4">IP / Wiring Interface</th>
                <th className="py-3 px-4 text-right">PoC Cost</th>
                {tier === "production" && <th className="py-3 px-4 text-right">Production Cost</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredItems.map((item) => {
                const prodCost = item.cost + (item.upgradeDelta || 0);
                return (
                  <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500 font-bold">{item.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      <div>{item.component}</div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-cyan-400">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] max-w-xs">
                      {tier === "poc" ? item.spec : item.upgradedSpec || item.spec}
                      {tier === "poc" && item.cutInPoc && (
                        <div className="text-amber-400/80 font-mono text-[10px] mt-0.5">
                          Cut in PoC: {item.cutInPoc}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-300 max-w-xs">
                      {item.ipOrConfig}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-cyan-400 text-sm">
                      ₹{item.cost.toLocaleString("en-IN")}
                    </td>
                    {tier === "production" && (
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                        ₹{prodCost.toLocaleString("en-IN")}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900 border-t-2 border-slate-700 font-mono font-bold text-sm">
                <td colSpan={4} className="py-3.5 px-4 text-white text-right">
                  TOTAL ESTIMATED COST:
                </td>
                <td className="py-3.5 px-4 text-right text-cyan-400 text-base">
                  ₹{pocTotal.toLocaleString("en-IN")}
                </td>
                {tier === "production" && (
                  <td className="py-3.5 px-4 text-right text-emerald-400 text-base">
                    ₹{productionTotal.toLocaleString("en-IN")}
                  </td>
                )}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Explicit Cuts Explanations Box */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 space-y-2">
        <div className="font-semibold font-mono text-amber-300 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          EXPLICIT CUTS MADE TO HIT THE ₹30,000 FIELD POC BUDGET LIMIT:
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] list-disc list-inside">
          <li><strong>No Microtek UPS:</strong> Runs directly from site AC mains. Reboots cleanly via systemd.</li>
          <li><strong>No 500GB SSD:</strong> Uses 64GB Extreme MicroSD storing 2-day rotating evidence JPEGs.</li>
          <li><strong>2MP Dahua instead of 4MP Hikvision:</strong> Saves ₹5,000 while maintaining 1080p plate resolution.</li>
          <li><strong>Direct 48V Switch Brick:</strong> Avoids expensive 12V-to-48V DC boost converters.</li>
          <li><strong>Daytime Field Operation:</strong> No high-power IR illuminators; logs degraded mode after 6 PM.</li>
          <li><strong>Local MinIO / SQLite:</strong> Runs evidence store on Pi 5 rather than paid AWS S3 bucket.</li>
        </ul>
      </div>
    </div>
  );
}
