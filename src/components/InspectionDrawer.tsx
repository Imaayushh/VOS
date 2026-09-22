"use client";

import React from "react";
import { X, Cpu, Camera, Network, HardDrive, ShieldAlert, CheckCircle2, DollarSign, Layers, ExternalLink } from "lucide-react";
import { BOM_DATA, TECHNICAL_SPECS } from "../data/hardwareSpecs";

interface InspectionDrawerProps {
  selectedComponent: string | null;
  onClose: () => void;
}

export default function InspectionDrawer({ selectedComponent, onClose }: InspectionDrawerProps) {
  if (!selectedComponent) return null;

  // Map selected component ID to detailed technical information
  let title = "";
  let category = "";
  let icon = <Cpu className="w-5 h-5 text-cyan-400" />;
  let costItem = BOM_DATA.find((b) => {
    if (selectedComponent === "cam-a") return b.id === 2;
    if (selectedComponent === "cam-b") return b.id === 3;
    if (selectedComponent === "control-enclosure") return b.id === 1;
    if (selectedComponent === "weighbridge") return b.id === 7;
    return false;
  });

  let details: {
    role: string;
    specs: string;
    networkOrWiring: string;
    softwareInterface: string;
    fieldCoords?: string;
    pocLimitations: string;
    futureUpgrade: string;
  } | null = null;

  if (selectedComponent === "cam-a") {
    title = "Camera A — Entry ANPR & Vehicle Identification";
    category = "Optics & Vision Input";
    icon = <Camera className="w-5 h-5 text-cyan-400" />;
    details = {
      role: "Captures approaching vehicle front, crops number plate region, feeds YOLOv8n detector & PaddleOCR engine.",
      specs: "Dahua 2MP PoE Bullet 1080p (1920x1080), 2.8-12mm manual varifocal lens, IR range 20m, IP67 weatherproof.",
      networkOrWiring: "IP 192.168.1.64 / 24 (Isolated VLAN). Connected via 15m Outdoor Cat6 to PoE Switch Port 1 (48V 802.3af).",
      softwareInterface: "RTSP stream: rtsp://admin:pass@192.168.1.64:554/cam/realmonitor?channel=1&subtype=0 ingested via cv2.VideoCapture() sampled at 3-5 FPS.",
      fieldCoords: "Mounted on 3.5m DIY L-angle pole, placed 6-8m before bridge entry ramp, angled 15° downward. Plate yields ~80-100px wide in 1080p.",
      pocLimitations: "Daytime PoC only. No high-power IR illuminator; accuracy drops after 6:00 PM (logged as degraded mode).",
      futureUpgrade: "Upgrade to Hikvision 4MP DarkFighter with 50fps global shutter for 24/7 night operation (+₹5,000)."
    };
  } else if (selectedComponent === "cam-b") {
    title = "Camera B — Top-Down Position & Axle Check";
    category = "Optics & Geometry Verification";
    icon = <Camera className="w-5 h-5 text-emerald-400" />;
    details = {
      role: "Monitors vehicle position on the 18m weighbridge platform; verifies all wheels/axles are strictly inside the 4-point polygon before weight is accepted.",
      specs: "Dahua 2MP PoE Bullet 1080p, 2.8mm ultra-wide angle fixed lens, IP67 weather-sealed aluminum body.",
      networkOrWiring: "IP 192.168.1.65 / 24 (Isolated VLAN). Connected via 10m Outdoor Cat6 to PoE Switch Port 2 (48V 802.3af).",
      softwareInterface: "Software defines 4-point ROI: bridge_polygon = [[x1,y1],[x2,y2],[x3,y3],[x4,y4]]. Point-in-polygon algorithm verifies truck center & wheel contact patches.",
      fieldCoords: "Mounted at 5.5m overhead gantry or building structure centered directly above the 18m platform, pointing 90° down (nadir).",
      pocLimitations: "Wide angle distortion requires 4-point perspective warp calibration before running pointPolygonTest().",
      futureUpgrade: "Starlight wide-angle 4MP sensor with optical anti-glare lens for wet rain reflective conditions (+₹4,000)."
    };
  } else if (selectedComponent === "control-enclosure") {
    title = "IP65 Weatherproof Control Enclosure";
    category = "Compute, Power & Network Core";
    icon = <Cpu className="w-5 h-5 text-amber-400" />;
    details = {
      role: "Houses the Raspberry Pi 5 8GB edge computer, 4-Port PoE Switch, 230V AC terminal with dual 3A fuses, and DC power bricks.",
      specs: "Raspberry Pi 5 8GB RAM (Broadcom BCM2712 4x Cortex-A76 @ 2.4GHz) + Active Cooler heatsink fan + Mercusys 4-Port PoE Switch.",
      networkOrWiring: "Pi ETH (192.168.1.10) to PoE Switch Port 3 (VLAN). Pi WiFi (DHCP) to Site Router for MQTT & internet sync. 230V AC mains input with MOV 14D471K surge protection.",
      softwareInterface: "Runs Raspberry Pi OS 64-bit, OpenCV 4.x, ONNX Runtime (YOLOv8n quantized ~120ms CPU), PaddleOCR, and Paho-MQTT client.",
      pocLimitations: "CPU-only inference (no TensorRT / GPU). 64GB MicroSD storage (max 2-day buffer, ~180KB JPEG per txn). No battery UPS backup (reboots cleanly via systemd on power cut).",
      futureUpgrade: "Replace with NVIDIA Jetson Orin Nano Super (40-67 TOPS TensorRT), 500GB PCIe NVMe SSD, and 1kVA Microtek Line-Interactive UPS (+₹34,500)."
    };
  } else if (selectedComponent === "weighbridge") {
    title = "18-Meter Industrial Weighbridge Platform";
    category = "Physical Infrastructure & Weighing";
    icon = <Layers className="w-5 h-5 text-cyan-400" />;
    details = {
      role: "Industrial weighbridge supporting standard multi-axle trucks up to 50–60 tons. Fuses physical weight measurements with AI vision data.",
      specs: "18m x 3.2m steel platform deck with 6 shear-beam load cells, concrete approach ramps, yellow/black hazard perimeter stripes, and guide rails.",
      networkOrWiring: "Weighing indicator connects to Pi via RS-232 / RS-485 Modbus RTU serial interface (PySerial) or Victor LAN gateway.",
      softwareInterface: "Transaction Matching Engine fuses Visual Plate (MH04AB1234) with Digital Indicator Weight (38,420 kg) & generates signed audit record.",
      fieldCoords: "Kopargaon Field Site (VOS-KOP-001). Platform length 18m with 1m safety margins on approach and exit ramps.",
      pocLimitations: "Indicator protocol varies by model; requires serial packet decoding confirmation from Victor Instruments team.",
      futureUpgrade: "Automated traffic boom barriers and bi-directional LED driver guidance scoreboards synchronized via MQTT."
    };
  } else if (selectedComponent === "truck") {
    title = "Commercial Cargo Truck (MH04AB1234)";
    category = "Vehicle Under Test";
    icon = <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    details = {
      role: "Test vehicle used during the Kopargaon field evaluation. Demonstrates entry detection, ANPR extraction, positioning check, and weighment transaction matching.",
      specs: "10-wheel heavy commercial transport vehicle. Tare weight ~14,200 kg, Gross weighment ~38,420 kg.",
      networkOrWiring: "Non-connected physical entity monitored via optics (Cam A & Cam B) and physical deck load cells.",
      softwareInterface: "Extracted plate 'MH04AB1234' with 94.2% OCR confidence. Bounding box [320, 180, 890, 620]. Stored in PostgreSQL with evidence snapshot.",
      pocLimitations: "Dirty or bent plates tested for OCR robustness. Irregular axle stopping positions checked by Cam B.",
      futureUpgrade: "Automated FASTag RFID cross-validation matching against visual ANPR plate string to eliminate fraudulent plate swaps."
    };
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900/95 border-l border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col transition-all duration-300">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            {icon}
          </div>
          <div>
            <div className="text-[10px] font-mono text-cyan-400 tracking-wider uppercase">{category}</div>
            <h3 className="text-sm font-semibold text-white leading-tight">{title}</h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Cost Badge if applicable */}
        {costItem && (
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="text-slate-400 font-mono text-[11px] block">Field PoC Cost (Locked ₹30k):</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">₹{costItem.cost.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Category</span>
              <span className="text-xs font-medium text-cyan-300 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20">
                {costItem.category}
              </span>
            </div>
          </div>
        )}

        {/* Operational Role */}
        {details && (
          <>
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-semibold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Operational Role
              </h4>
              <p className="text-slate-300 leading-relaxed bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                {details.role}
              </p>
            </div>

            {/* Hardware Specifications */}
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-semibold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" /> Hardware Specifications
              </h4>
              <div className="text-slate-300 leading-relaxed bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                {details.specs}
              </div>
            </div>

            {/* Field Coordinates / Mounting */}
            {details.fieldCoords && (
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-semibold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" /> Mounting & Field Position
                </h4>
                <div className="text-slate-300 leading-relaxed bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                  {details.fieldCoords}
                </div>
              </div>
            )}

            {/* Networking & Electrical Wiring */}
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-semibold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-purple-400" /> Network & Wiring Configuration
              </h4>
              <div className="text-slate-300 leading-relaxed bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[11px]">
                {details.networkOrWiring}
              </div>
            </div>

            {/* Software Interface & Code Contract */}
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-semibold text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" /> Software Interface
              </h4>
              <div className="text-cyan-300 leading-relaxed bg-slate-950/80 p-2.5 rounded-lg border border-cyan-950 font-mono text-[11px] break-all">
                {details.softwareInterface}
              </div>
            </div>

            {/* PoC Tradeoff / Limitation */}
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-semibold text-amber-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> PoC Budget Tradeoff (₹30k Locked)
              </h4>
              <div className="text-amber-200/90 leading-relaxed bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                {details.pocLimitations}
              </div>
            </div>

            {/* Scaled 24/7 Production Upgrade */}
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-semibold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Production Scaled Upgrade (+₹21k Path)
              </h4>
              <div className="text-emerald-300 leading-relaxed bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                {details.futureUpgrade}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Drawer Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>Site: Kopargaon (VOS-KOP-001)</span>
        <button
          onClick={onClose}
          className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
        >
          Close Inspector
        </button>
      </div>
    </div>
  );
}
