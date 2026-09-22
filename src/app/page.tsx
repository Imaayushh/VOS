"use client";

import React, { useState, useEffect } from "react";
import TopNavbar from "../components/TopNavbar";
import ThreeCanvas from "../components/ThreeCanvas";
import InspectionDrawer from "../components/InspectionDrawer";
import PipelineSimulator from "../components/PipelineSimulator";
import CameraFeedsHUD from "../components/CameraFeedsHUD";
import CostExplorer from "../components/CostExplorer";
import ArchitectureModal from "../components/ArchitectureModal";
import { Play, RotateCcw, Cpu, Eye, Activity, DollarSign, Sparkles, HelpCircle, Terminal } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"3d" | "pipeline" | "vision" | "cost">("3d");
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);

  // 3D Canvas States
  const [truckProgress, setTruckProgress] = useState(0.0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showFrustums, setShowFrustums] = useState(true);
  const [showCables, setShowCables] = useState(true);
  const [viewPreset, setViewPreset] = useState("overview");

  // Simulation Animation Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulating) {
      interval = setInterval(() => {
        setTruckProgress((prev) => {
          if (prev >= 1.0) {
            setIsSimulating(false);
            return 1.0;
          }
          return Math.min(1.0, prev + 0.005);
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  const handleToggleSimulate = () => {
    if (truckProgress >= 1.0) {
      setTruckProgress(0);
      setIsSimulating(true);
    } else {
      setIsSimulating(!isSimulating);
    }
  };

  const handleResetSimulate = () => {
    setIsSimulating(false);
    setTruckProgress(0);
  };

  // Derive active pipeline step based on truckProgress
  const getPipelineStepIndex = (progress: number) => {
    if (progress < 0.1) return 0; // RTSP
    if (progress < 0.18) return 1; // PoE VLAN
    if (progress < 0.28) return 2; // OpenCV Capture
    if (progress < 0.38) return 3; // YOLOv8n
    if (progress < 0.45) return 4; // ByteTrack
    if (progress < 0.52) return 5; // Vehicle Crop
    if (progress < 0.60) return 6; // PaddleOCR
    if (progress < 0.70) return 7; // Cam B Polygon
    if (progress < 0.80) return 8; // Weighment Fusion
    if (progress < 0.88) return 9; // Local Evidence
    if (progress < 0.95) return 10; // MQTT Publish
    return 11; // Backend & Dashboard
  };

  const currentStep = getPipelineStepIndex(truckProgress);

  return (
    <div className="min-h-screen flex flex-col bg-[#070a12] text-slate-100 bg-tech-grid">
      {/* Top Navbar */}
      <TopNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Quick Context Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-purple-950/40 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-xs font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> 3D Digital Twin & Systems Integration Engine
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Interactive 3D model of the 18m weighbridge, Dahua PoE cameras, Raspberry Pi 5 edge compute, and the ₹30,000 BOM cost analysis.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedComponent("cam-a")}
              className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors"
            >
              Cam A (Entry)
            </button>
            <button
              onClick={() => setSelectedComponent("cam-b")}
              className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors"
            >
              Cam B (Top-Down)
            </button>
            <button
              onClick={() => setSelectedComponent("control-enclosure")}
              className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors"
            >
              Pi 5 Enclosure
            </button>
            <button
              onClick={() => setSelectedComponent("weighbridge")}
              className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-colors"
            >
              18m Deck
            </button>
          </div>
        </div>

        {/* Tab 1: 3D Interactive Digital Twin */}
        {activeTab === "3d" && (
          <div className="space-y-6">
            {/* 3D WebGL Viewport */}
            <div className="h-[560px] w-full">
              <ThreeCanvas
                onSelectComponent={(id) => setSelectedComponent(id)}
                selectedComponent={selectedComponent}
                truckProgress={truckProgress}
                isSimulating={isSimulating}
                onToggleSimulate={handleToggleSimulate}
                onResetSimulate={handleResetSimulate}
                showFrustums={showFrustums}
                onToggleFrustums={() => setShowFrustums(!showFrustums)}
                showCables={showCables}
                onToggleCables={() => setShowCables(!showCables)}
                viewPreset={viewPreset}
                onSetViewPreset={setViewPreset}
              />
            </div>

            {/* Synchronized HUD previews below the 3D scene */}
            <CameraFeedsHUD truckProgress={truckProgress} />

            {/* Real-time Hardware to Software Integration Tracker */}
            <PipelineSimulator
              currentStepIndex={currentStep}
              onStepChange={(stepIdx) => {
                // Approximate truck progress to jump to that step
                setTruckProgress(stepIdx / 11);
              }}
            />
          </div>
        )}

        {/* Tab 2: Hardware-Software Integration Pipeline */}
        {activeTab === "pipeline" && (
          <div className="space-y-6">
            <PipelineSimulator
              currentStepIndex={currentStep}
              onStepChange={(stepIdx) => setTruckProgress(stepIdx / 11)}
            />
            <CameraFeedsHUD truckProgress={truckProgress} />
          </div>
        )}

        {/* Tab 3: Dual Camera Feeds & AI Inference HUD */}
        {activeTab === "vision" && (
          <div className="space-y-6">
            {/* Controls Bar for Testing HUD */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleSimulate}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isSimulating
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md shadow-cyan-500/20"
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {isSimulating ? "Pause Simulation" : "Run Live Vehicle Ingestion"}
                </button>
                <button
                  onClick={handleResetSimulate}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700"
                  title="Reset vehicle position"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Slider Scrub */}
              <div className="flex items-center gap-3 w-full sm:w-80">
                <span className="text-[11px] font-mono text-slate-400">Scrub:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={truckProgress}
                  onChange={(e) => {
                    setIsSimulating(false);
                    setTruckProgress(parseFloat(e.target.value));
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <span className="font-mono text-xs text-cyan-400 w-10 text-right">
                  {Math.round(truckProgress * 100)}%
                </span>
              </div>
            </div>

            <CameraFeedsHUD truckProgress={truckProgress} />

            {/* Live MQTT Output Terminal */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl font-mono text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold">
                  <Terminal className="w-4 h-4" />
                  <span>Live MQTT Event Stream (EMQX Broker • Topic: vos/KOP-001/vision/entry)</span>
                </div>
                <span className="text-[10px] text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  CONNECTED (WiFi WAN)
                </span>
              </div>
              <pre className="text-cyan-200/90 leading-relaxed overflow-x-auto p-2 bg-slate-900/50 rounded-lg">
                {JSON.stringify(
                  {
                    siteId: "VOS-KOP-001",
                    cameraId: "cam-entry-A",
                    eventType: truckProgress > 0.7 ? "exit" : truckProgress > 0.35 ? "on_bridge" : "entry",
                    timestamp: new Date().toISOString(),
                    plateText: truckProgress > 0.15 ? "MH04AB1234" : "SCANNING...",
                    plateConfidence: truckProgress > 0.15 ? 0.942 : null,
                    vehicleBbox: truckProgress > 0.15 ? [320, 180, 890, 620] : null,
                    weightKg: truckProgress >= 0.35 && truckProgress <= 0.7 ? 38420 : 0,
                    bridgePolygonValid: truckProgress >= 0.35 && truckProgress <= 0.7,
                    imageKey: "/data/evidence/entry_MH04AB1234.jpg",
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 4: ₹30,000 BOM Cost Explorer */}
        {activeTab === "cost" && <CostExplorer />}
      </main>

      {/* Component Technical Inspector Drawer */}
      <InspectionDrawer
        selectedComponent={selectedComponent}
        onClose={() => setSelectedComponent(null)}
      />

      {/* Architecture Schematics Modal */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-surfaceBorder bg-slate-950/60 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        Victor Instruments and Systems • VOS Vision Prototype • R&D Area 2 • Kopargaon PoC
      </footer>
    </div>
  );
}
