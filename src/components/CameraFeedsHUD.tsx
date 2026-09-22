"use client";

import React from "react";
import { Camera, ShieldCheck, AlertTriangle, CheckCircle, Wifi, Database, Radio } from "lucide-react";

interface CameraFeedsHUDProps {
  truckProgress: number; // 0 to 1
}

export default function CameraFeedsHUD({ truckProgress }: CameraFeedsHUDProps) {
  // Derive simulation state from truckProgress
  // 0.0 - 0.2: Approach
  // 0.2 - 0.35: Cam A ANPR trigger
  // 0.35 - 0.7: On bridge, Cam B verified, stable weighment
  // 0.7 - 1.0: Exit
  const isApproaching = truckProgress < 0.2;
  const isAnprActive = truckProgress >= 0.15 && truckProgress <= 0.65;
  const isOnBridge = truckProgress >= 0.35 && truckProgress <= 0.7;
  const isExiting = truckProgress > 0.7;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* CAM A: Entry / ANPR Vision Stream */}
      <div className="rounded-2xl border border-surfaceBorder bg-surface/80 backdrop-blur-xl p-4 shadow-xl flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <Camera className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-xs font-semibold text-white">CAM A — ENTRY ANPR</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span>192.168.1.64</span>
              <span className="text-cyan-400">1080p @ 3 FPS (Sampled)</span>
            </div>
          </div>

          {/* Video Feed Canvas Simulation */}
          <div className="relative mt-3 h-52 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center scanline-effect">
            {/* Background grid & road lane */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 opacity-90" />
            <div className="absolute bottom-0 inset-x-0 h-28 bg-slate-900/60 border-t border-slate-800 flex items-center justify-center">
              <div className="w-1 h-full bg-dashed border-r border-dashed border-slate-700" />
            </div>

            {/* Truck Visual representation in Cam A FOV */}
            {truckProgress < 0.75 && (
              <div
                className="absolute transition-all duration-100 flex flex-col items-center"
                style={{
                  transform: `scale(${Math.min(1.4, 0.4 + truckProgress * 1.5)}) translate(${
                    (0.35 - truckProgress) * 200
                  }px, ${truckProgress * 30}px)`,
                  opacity: truckProgress < 0.05 ? 0.3 : 1,
                }}
              >
                {/* Truck outline box */}
                <div className="relative w-40 h-24 rounded-lg border-2 border-cyan-400 bg-cyan-950/30 backdrop-blur-sm p-1.5 flex flex-col justify-between">
                  {/* YOLO Bounding Box Header */}
                  <div className="flex items-center justify-between text-[9px] font-mono bg-cyan-500 text-slate-950 font-bold px-1 rounded-sm w-fit">
                    <span>TRUCK 96.4%</span>
                  </div>

                  {/* License Plate Crop Overlay */}
                  <div className="self-center my-auto p-1 bg-white border border-slate-900 rounded shadow-md text-slate-950 text-center font-mono font-bold text-xs tracking-wider">
                    MH04AB1234
                  </div>

                  <div className="text-[8px] font-mono text-cyan-300 self-end">
                    bbox: [320, 180, 890, 620]
                  </div>
                </div>
              </div>
            )}

            {truckProgress >= 0.75 && (
              <div className="text-slate-600 font-mono text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Lane Clear — Awaiting Next Vehicle
              </div>
            )}

            {/* Live Telemetry Overlay */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 text-[10px] font-mono bg-slate-950/80 p-2 rounded-lg border border-slate-800">
              <span className="text-cyan-400">INFERENCE: YOLOv8n CPU (~118ms)</span>
              <span className="text-slate-400">TRACK_ID: {isAnprActive ? "#25 (ByteTrack)" : "NONE"}</span>
              <span className="text-emerald-400">OCR_ENGINE: PaddleOCR Mobile</span>
            </div>
          </div>
        </div>

        {/* OCR Result Card */}
        <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold text-sm tracking-wider">
              {isAnprActive ? "MH04AB1234" : "WAITING..."}
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">Recognized Plate</div>
              <div className="text-xs text-slate-300 font-medium">
                {isAnprActive ? "HSRP Validated (Match 94.2%)" : "Scanning Approach Zone..."}
              </div>
            </div>
          </div>
          <div className="text-right font-mono text-[11px]">
            <span className="text-slate-500 block text-[10px]">EVIDENCE JPEG:</span>
            <span className="text-cyan-400 text-xs">/data/evidence/25.jpg</span>
          </div>
        </div>
      </div>

      {/* CAM B: Top-Down Position & Weighment Verification */}
      <div className="rounded-2xl border border-surfaceBorder bg-surface/80 backdrop-blur-xl p-4 shadow-xl flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <Camera className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-xs font-semibold text-white">CAM B — TOP-DOWN POSITION</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span>192.168.1.65</span>
              <span className="text-emerald-400">1080p @ 90° Nadir</span>
            </div>
          </div>

          {/* Video Feed Canvas Simulation (Bird's-Eye View) */}
          <div className="relative mt-3 h-52 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center scanline-effect">
            {/* Top-down 18m Platform Graphic */}
            <div className="relative w-4/5 h-28 rounded-lg border-2 border-dashed border-emerald-500/50 bg-emerald-950/20 p-2 flex items-center justify-center">
              {/* 4-point polygon line overlay */}
              <div className="absolute inset-2 border-2 border-emerald-400 rounded bg-emerald-500/5 flex items-center justify-between px-2">
                <span className="text-[9px] font-mono text-emerald-400">POINT [X1, Y1]</span>
                <span className="text-[9px] font-mono text-emerald-400">POINT [X2, Y2]</span>
              </div>

              {/* Truck Body Representation Top-down */}
              <div
                className={`relative h-16 rounded-md border transition-all duration-150 flex items-center justify-center ${
                  isOnBridge
                    ? "w-44 bg-emerald-500/30 border-emerald-400 shadow-lg shadow-emerald-950"
                    : "w-36 bg-amber-500/30 border-amber-400"
                }`}
                style={{
                  transform: `translateX(${(truckProgress - 0.5) * 240}px)`,
                }}
              >
                <span className="text-[10px] font-mono font-bold text-white">
                  {isOnBridge ? "TRUCK POSITION: VALID" : "TRANSITIONING..."}
                </span>
              </div>
            </div>

            {/* Telemetry Badge */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 text-[10px] font-mono bg-slate-950/80 p-2 rounded-lg border border-slate-800">
              <span className="text-emerald-400">POLYGON_TEST: {isOnBridge ? "INSIDE (SAFE)" : "PARTIAL / OFF"}</span>
              <span className="text-slate-300">PLATFORM_DECK: 18.0 Meters</span>
              <span className="text-amber-400">AXLE_CONTACT: 3 Tandem Axles</span>
            </div>
          </div>
        </div>

        {/* Weighing Indicator Fusion Card */}
        <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono font-bold text-base">
              {isOnBridge ? "38,420 KG" : isApproaching ? "0 KG (TARE)" : "0 KG (CLEARED)"}
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">Digital Scale Fusion</div>
              <div className="text-xs text-slate-300 font-medium">
                {isOnBridge ? "Stable Weight Locked • Victor RS-485" : "Platform Ready for Next Axle"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isOnBridge ? "MATCHED" : "AWAITING"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
