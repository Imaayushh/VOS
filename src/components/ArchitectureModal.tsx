"use client";

import React, { useState } from "react";
import { X, Network, Zap, Layers, ShieldCheck, ArrowRight, Radio, Server, Lock, Cpu, Camera } from "lucide-react";

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ArchitectureModal({ isOpen, onClose }: ArchitectureModalProps) {
  const [activeTab, setActiveTab] = useState<"network" | "electrical" | "hardware" | "software">("network");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-cyan-400 tracking-wider uppercase">System Architecture</span>
              <h3 className="text-base font-bold text-white">Wiring, Network, Hardware & Software Stack Schematics</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-4 pt-3 border-b border-slate-800 bg-slate-950/30 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab("network")}
            className={`pb-2.5 px-3 font-medium transition-all flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === "network"
                ? "border-cyan-400 text-cyan-300 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Network className="w-4 h-4" /> Network VLAN Topology
          </button>
          <button
            onClick={() => setActiveTab("electrical")}
            className={`pb-2.5 px-3 font-medium transition-all flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === "electrical"
                ? "border-amber-400 text-amber-300 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-4 h-4" /> Electrical & Power Schematic
          </button>
          <button
            onClick={() => setActiveTab("hardware")}
            className={`pb-2.5 px-3 font-medium transition-all flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === "hardware"
                ? "border-purple-400 text-purple-300 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Server className="w-4 h-4 text-purple-400" /> Complete Hardware Stack
          </button>
          <button
            onClick={() => setActiveTab("software")}
            className={`pb-2.5 px-3 font-medium transition-all flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === "software"
                ? "border-emerald-400 text-emerald-300 font-semibold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-4 h-4" /> Complete Software Stack
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 text-xs space-y-4">
          {/* TAB 1: Network VLAN */}
          {activeTab === "network" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-sm font-semibold text-cyan-300 font-mono flex items-center gap-2 mb-3">
                  <Lock className="w-4 h-4 text-cyan-400" /> Isolated Camera VLAN (192.168.1.0/24) vs Site WAN
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Isolated Subnet */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-cyan-900/50 space-y-2">
                    <span className="text-[11px] font-mono text-cyan-400 font-bold block">
                      ISOLATED VLAN (NO INTERNET ACCESS):
                    </span>
                    <ul className="space-y-1 font-mono text-[11px] text-slate-300">
                      <li>• <strong>Cam A (Entry):</strong> 192.168.1.64 / 24</li>
                      <li>• <strong>Cam B (Position):</strong> 192.168.1.65 / 24</li>
                      <li>• <strong>Pi 5 ETH Interface:</strong> 192.168.1.10 / 24</li>
                      <li>• <strong>Default Gateway:</strong> (None — Strict Sandbox)</li>
                    </ul>
                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                      Guarantees zero unauthorized remote access to Dahua cameras & zero malware exposure to site LAN.
                    </div>
                  </div>

                  {/* WAN Subnet */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-emerald-900/50 space-y-2">
                    <span className="text-[11px] font-mono text-emerald-400 font-bold block">
                      WAN SITE NETWORK (TELEMETRY & MQTT):
                    </span>
                    <ul className="space-y-1 font-mono text-[11px] text-slate-300">
                      <li>• <strong>Pi 5 WiFi Interface:</strong> DHCP (e.g. 192.168.0.100)</li>
                      <li>• <strong>Gateway:</strong> Site Router (192.168.0.1)</li>
                      <li>• <strong>Outbound Ports:</strong> 8883 (MQTT TLS), 123 (NTP)</li>
                      <li>• <strong>Remote SSH:</strong> pi@192.168.0.100</li>
                    </ul>
                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                      Carries lightweight JSON event telemetry and synchronizes precise ISO8601 timestamps via NTP.
                    </div>
                  </div>
                </div>
              </div>

              {/* Pi Firewall Rules Matrix */}
              <div className="rounded-xl border border-slate-800 overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-950 font-mono text-xs text-slate-300 font-semibold border-b border-slate-800">
                  Raspberry Pi 5 UFW / iptables Firewall Matrix (Configured by Hardware Team)
                </div>
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900 text-slate-400">
                    <tr>
                      <th className="p-2.5">Direction / Rule</th>
                      <th className="p-2.5">Source</th>
                      <th className="p-2.5">Destination</th>
                      <th className="p-2.5">Port / Proto</th>
                      <th className="p-2.5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950/70 text-slate-300">
                    <tr>
                      <td className="p-2.5">RTSP Capture</td>
                      <td className="p-2.5">Pi (192.168.1.10)</td>
                      <td className="p-2.5">Cam A/B (.64, .65)</td>
                      <td className="p-2.5">554 (TCP RTSP)</td>
                      <td className="p-2.5 text-emerald-400 font-bold">ALLOW</td>
                    </tr>
                    <tr>
                      <td className="p-2.5">Camera Web Config</td>
                      <td className="p-2.5">Pi (192.168.1.10)</td>
                      <td className="p-2.5">Cam A/B (.64, .65)</td>
                      <td className="p-2.5">80 (HTTP)</td>
                      <td className="p-2.5 text-emerald-400 font-bold">ALLOW</td>
                    </tr>
                    <tr>
                      <td className="p-2.5">Camera WAN Leak</td>
                      <td className="p-2.5">Cam A/B (.64, .65)</td>
                      <td className="p-2.5">Internet / Site WAN</td>
                      <td className="p-2.5">Any</td>
                      <td className="p-2.5 text-red-400 font-bold">DROP / DENY</td>
                    </tr>
                    <tr>
                      <td className="p-2.5">Inter-Camera Traffic</td>
                      <td className="p-2.5">Cam A (.64)</td>
                      <td className="p-2.5">Cam B (.65)</td>
                      <td className="p-2.5">Any</td>
                      <td className="p-2.5 text-red-400 font-bold">DROP / DENY</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Electrical Power */}
          {activeTab === "electrical" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-sm font-semibold text-amber-300 font-mono flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" /> 230V AC Mains Circuit & Surge Protection
                </h4>

                <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300 space-y-2 overflow-x-auto">
                  <pre>{`
230V AC Live  ──────[3A Fuse 1]──────► Pi 27W USB-C PSU (230V -> 5.1V 5A)  ──► Raspberry Pi 5
              │
              ├──────[3A Fuse 2]──────► 48V DC Power Brick (230V -> 48V)   ──► 4-Port PoE Switch
              │                                                                  ├─ Port 1: Cam A (PoE)
              ├──────[MOV 14D471K]────► Surge Earth Drain                         └─ Port 2: Cam B (PoE)
              │
230V Neutral  ────────────────────────► Common Return
Earth (PE)    ────────────────────────► Enclosure Ground Stud
                  `}</pre>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Mains Protection:</span>
                    <span className="text-xs text-amber-300 font-medium">Dual 3A Fast-Blow Glass Fuses</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Surge Suppressor:</span>
                    <span className="text-xs text-amber-300 font-medium">MOV 14D471K (470V Clamp)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">PoE Standards:</span>
                    <span className="text-xs text-amber-300 font-medium">IEEE 802.3af/at (48V Passive)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Complete Hardware Stack */}
          {activeTab === "hardware" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-purple-300 font-mono flex items-center gap-2">
                    <Server className="w-4 h-4 text-purple-400" /> Complete Industrial Hardware Stack (VOS Vision)
                  </h4>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    Field PoC: ₹30,000 • Production: ₹51,000
                  </span>
                </div>

                {/* 4 Main Hardware Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Pillar 1: Optics & Vision Sensors */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-cyan-400 font-bold flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5" /> 1. OPTICS & CAMERA SENSORS
                      </span>
                      <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                        1080p H.264
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-slate-300">
                      <li>• <strong>Cam A (Entry / ANPR):</strong> Dahua 2MP PoE Bullet 1080p, 2.8-12mm manual varifocal lens, IR 20m, IP67. Mounted on 3.5m pole, 6-8m before bridge, 15° pitch down.</li>
                      <li>• <strong>Cam B (Top-Down):</strong> Dahua 2MP PoE Bullet 1080p, 2.8mm ultra-wide lens, IP67. Mounted at 5.5m overhead gantry, 90° nadir covering full 18m deck.</li>
                      <li>• <strong>Production Upgrade:</strong> Hikvision 4MP DarkFighter (ultra-low light, 50fps global shutter) + 4MP Starlight wide-angle (+₹9,000).</li>
                    </ul>
                  </div>

                  {/* Pillar 2: Edge AI & Microcomputing */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5" /> 2. EDGE COMPUTE & ACCELERATOR
                      </span>
                      <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                        2.4 GHz Quad-Core
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-slate-300">
                      <li>• <strong>Edge Host:</strong> Raspberry Pi 5 8GB LPDDR4X (Broadcom BCM2712 Quad Cortex-A76 @ 2.4GHz) with Official Active Cooler & 27W USB-C PSU.</li>
                      <li>• <strong>Inference Engine:</strong> CPU ONNX Runtime (~120ms per frame for YOLOv8n, ~3-5 FPS dual camera sampled pipeline).</li>
                      <li>• <strong>Network Interfaces:</strong> 1x Gigabit ETH (192.168.1.10 VLAN) + 802.11ac WiFi (WAN MQTT / NTP).</li>
                      <li>• <strong>Production Upgrade:</strong> NVIDIA Jetson Orin Nano Super (40-67 TOPS INT8, TensorRT hardware acceleration, DeepStream pipeline).</li>
                    </ul>
                  </div>

                  {/* Pillar 3: Weighing Indicator & Sensory Fusion */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-amber-400 font-bold flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" /> 3. SENSORY & WEIGHING SYSTEM
                      </span>
                      <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">
                        0–60 Ton Range
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-slate-300">
                      <li>• <strong>Platform Deck:</strong> 18m x 3.2m industrial structural steel deck with concrete ramps, yellow hazard striping, and guard rails.</li>
                      <li>• <strong>Load Sensors:</strong> 6x heavy-duty shear-beam load cells connected to summing junction box.</li>
                      <li>• <strong>Weighing Indicator:</strong> Victor Instruments Digital Weight Indicator.</li>
                      <li>• <strong>Industrial Interfaces:</strong> RS-232 / RS-485 Modbus RTU (PySerial driver) or Victor LAN Ethernet gateway.</li>
                    </ul>
                  </div>

                  {/* Pillar 4: Power, Networking & Storage */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-purple-400 font-bold flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" /> 4. POWER, NETWORK & STORAGE
                      </span>
                      <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/40">
                        IP65 Enclosure
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-slate-300">
                      <li>• <strong>PoE Switch:</strong> Mercusys 4-Port Fast Ethernet with bundled 48V/1.25A DC brick (Ports 1 & 2: Cams PoE, Port 3: Pi ETH).</li>
                      <li>• <strong>Electrical Safety:</strong> AC terminal block, dual 3A fuses, MOV 14D471K surge protection, PE earthing stud.</li>
                      <li>• <strong>Storage:</strong> 64GB SanDisk Extreme MicroSD (/data/evidence/, 2-day buffer, 180KB JPEG per txn).</li>
                      <li>• <strong>Production Upgrade:</strong> Microtek 1kVA Line-Interactive UPS + 500GB PCIe NVMe SSD M.2 HAT (+₹10,500).</li>
                    </ul>
                  </div>
                </div>

                {/* Subsystems Comparison Table */}
                <div className="rounded-xl border border-slate-800 overflow-hidden pt-2">
                  <div className="px-3.5 py-2 bg-slate-900 font-mono text-xs text-slate-300 font-semibold border-b border-slate-800">
                    Hardware Subsystems: Field PoC vs. 24/7 Production Deployment
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] font-mono">
                      <thead className="bg-slate-950 text-slate-400">
                        <tr>
                          <th className="p-2.5">Subsystem</th>
                          <th className="p-2.5">Field PoC (₹30,000 Locked)</th>
                          <th className="p-2.5">24/7 Production Tier (₹51,000)</th>
                          <th className="p-2.5">Operational Gain</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 bg-slate-900/50 text-slate-300">
                        <tr>
                          <td className="p-2.5 font-bold text-cyan-400">ANPR Camera</td>
                          <td className="p-2.5">Dahua 2MP PoE (1080p, 2.8-12mm)</td>
                          <td className="p-2.5 text-emerald-300">Hikvision 4MP DarkFighter (50fps)</td>
                          <td className="p-2.5 text-slate-400">Night ANPR without motion blur</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-cyan-400">Position Camera</td>
                          <td className="p-2.5">Dahua 2MP PoE (2.8mm wide)</td>
                          <td className="p-2.5 text-emerald-300">4MP Starlight Ultra-Wide Anti-glare</td>
                          <td className="p-2.5 text-slate-400">Rain & wet deck reflection resilience</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-cyan-400">Edge Compute</td>
                          <td className="p-2.5">Raspberry Pi 5 8GB (CPU-only)</td>
                          <td className="p-2.5 text-emerald-300">NVIDIA Jetson Orin Nano Super</td>
                          <td className="p-2.5 text-slate-400">TensorRT acceleration (60+ FPS)</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-cyan-400">Local Storage</td>
                          <td className="p-2.5">64GB MicroSD (2-day JPEG buffer)</td>
                          <td className="p-2.5 text-emerald-300">500GB PCIe NVMe SSD M.2 HAT</td>
                          <td className="p-2.5 text-slate-400">30-day continuous video clip archive</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-cyan-400">Power Backup</td>
                          <td className="p-2.5">Site AC mains only (Clean reboot)</td>
                          <td className="p-2.5 text-emerald-300">Microtek 1kVA Line-Interactive UPS</td>
                          <td className="p-2.5 text-slate-400">Zero downtime during grid fluctuations</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Complete Software Stack */}
          {activeTab === "software" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-sm font-semibold text-emerald-300 font-mono flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" /> Multi-Tier Industrial Vision Stack (VOS Vision)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Layer 1 */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                    <span className="text-[11px] font-mono text-cyan-400 font-bold block">1. EDGE CV & AI:</span>
                    <p className="text-[11px] text-slate-300">
                      Python 3.11, OpenCV 4.x, YOLOv8n (quantized ONNX), ByteTrack tracking, PaddleOCR, NumPy.
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      Target: Cortex-A76 @ 2.4GHz (~120ms)
                    </span>
                  </div>

                  {/* Layer 2 */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                    <span className="text-[11px] font-mono text-emerald-400 font-bold block">2. FUSION & BACKEND:</span>
                    <p className="text-[11px] text-slate-300">
                      Django REST Framework, PostgreSQL, Celery + Redis, EMQX MQTT broker, MinIO evidence storage.
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      Transaction Matching & Anomaly Detect
                    </span>
                  </div>

                  {/* Layer 3 */}
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                    <span className="text-[11px] font-mono text-purple-400 font-bold block">3. OPERATOR UI:</span>
                    <p className="text-[11px] text-slate-300">
                      React.js, Next.js, Three.js Digital Twin, Tailwind CSS, Recharts analytics, WebSocket live streaming.
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      Zero-latency real-time telemetry
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-semibold text-xs hover:bg-cyan-400 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
