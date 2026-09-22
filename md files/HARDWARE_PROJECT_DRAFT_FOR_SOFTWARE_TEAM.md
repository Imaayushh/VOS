# VOS Vision — Hardware Project Draft (For Software Team)

> **Track:** R&D Area 2 — VOS Vision | **Budget:** ₹30,000 Field PoC (Locked) | **Date:** 10 Sep 2026
> **Forward this to Software Guy — Contains all interfaces he needs**
> Victor Instruments & Systems — Guide: Makarand Jadhav Sir

---

### 1. Objective (What Hardware Delivers)
Build a **field-deployable vision rig for 1 weighbridge** that captures 2 video streams and makes them available to software for AI inference. Hardware owns power, networking, camera mounting, and Pi setup — software owns detection/ANPR/tracking.

**Success Criteria:** Software can `cv2.VideoCapture("rtsp://...")` both cams from Pi at 1080p, 3-5 FPS each, with stable footage of trucks on bridge.

---

### 2. Hardware BOM — ₹30k Locked (No UPS, No SSD, MinIO Local)

| # | Component | Spec / Model | IP / Config | Cost |
|---|---|---|---|---|
| 1 | **Raspberry Pi 5 8GB** + heatsink + fan + 27W USB-C adapter | 192.168.1.10 (VLAN to cams) + WiFi DHCP to router | ₹8,500 |
| 2 | **Cam A — Entry ANPR** | Dahua 2MP PoE Bullet 1080p, 2.8-12mm varifocal, IR 20m, IP67 | 192.168.1.64, RTSP | ₹5,500 |
| 3 | **Cam B — Top-Down Position** | Dahua 2MP PoE Bullet 1080p, wide angle | 192.168.1.65, RTSP | ₹5,500 |
| 4 | **PoE Switch — Budget 4-port** | Mercusys / Generic with included 48V brick | 48V powered | ₹2,800 |
| 5 | **Storage** | 64GB microSD only (SanDisk Extreme) | /data, 2-day buffer | ₹800 |
| 6 | **Cabling** | Cat6 Outdoor 15m (Cam A) + 10m (Cam B) + RJ45 | — | ₹800 |
| 7 | **Mounts** | DIY L-angle pole mount ×2 + junction box IP65 | 3.5m + 5.5m height | ₹2,000 |
| 8 | **Mains Protection** | AC terminal block + 2× 3A fuses + MOV 14D471K + PE earth | — | ₹300 |
| 9 | **Buffer** | Contingency | — | ₹2,000 |
| | **TOTAL** | **Daytime PoC, no UPS, no SSD** | | **~₹28,200 + ₹2k buffer = ~₹30,000** |

*What we CUT to hit ₹30k:* No Microtek UPS (site power only), no 500GB SSD (SD only), no 4MP Hik (+₹5k saved), no 12V→48V boost (switch has own 48V brick), no IR illuminator (daytime only), MinIO on Pi not AWS S3.

---

### 3. Block Diagram — What Software Sees

```
230V AC ─┬─[3A Fuse]─► Pi 27W Adapter (230→5V) ─► Pi 5 (192.168.1.10) ─┬─ WiFi/DHCP ─► Site Router ─► Internet (for git/MQTT)
         └─[3A Fuse]─► PoE 48V Brick ─► PoE Switch ─┬─Port1─Cat6 15m─► Cam A (192.168.1.64) RTSP
                                                      └─Port2─Cat6 10m─► Cam B (192.168.1.65) RTSP
                                                                      └─Port3─Cat6 2m─► Pi ETH (192.168.1.10)
Pi 5 ─► 64GB SD (/data/evidence, 2-day) ─► MinIO local (no cloud)
```

**Software Entry Points:**
- `rtsp://admin:password@192.168.1.64:554/cam/realmonitor?channel=1&subtype=0` — Cam A Entry
- `rtsp://admin:password@192.168.1.65:554/cam/realmonitor?channel=1&subtype=0` — Cam B Top-Down
- Pi SSH: `pi@192.168.1.10` (VLAN) or `pi@<wifi-ip>` (for remote)

---

### 4. Camera Placement — Field Coordinates (Give to Installer)

| Cam | Purpose | Height | Distance | Angle | Lens | What Software Gets |
|---|---|---|---|---|---|---|
| **A Entry** | ANPR + entry detection | 3.5m pole | 6-8m before bridge | 15° down | 8-12mm varifocal | Plate ~80-100px wide at 1080p, truck side view |
| **B Top-Down** | Positioning check | 5.5m gantry/building | Center over bridge | 90° down | 2.8mm wide | Full 18m platform + 1m margin, top view |

**Calibration Needed from Software:** Draw 4-point polygon on Cam B frame for bridge ROI → `bridge_polygon = [[x1,y1],[x2,y2],[x3,y3],[x4,y4]]` → hardware saves to `vos/KOP-001/vision/config` via MQTT. Hardware will provide sample snapshot for you to draw polygon.

---

### 5. Network Topology — Software Contract

```
VLAN 192.168.1.0/24 (Isolated, No Internet)
  - Cam A: 192.168.1.64 / 255.255.255.0 / GW: (none)
  - Cam B: 192.168.1.65 / 255.255.255.0 / GW: (none)
  - Pi ETH: 192.168.1.10 / 255.255.255.0 (VLAN interface)
WAN (Site Network, DHCP)
  - Pi WiFi: DHCP from site router (e.g., 192.168.0.100) → internet + MQTT to cloud/MinIO

Firewall on Pi (hardware configures):
  - Allow: Pi (192.168.1.10) → Cam A/B RTSP (554) + HTTP (80)
  - Deny: Cam → WAN, Cam → Cam
```

**Software must:** Bind capture to `192.168.1.10` interface for RTSP, publish results via MQTT on WiFi interface.

---

### 6. Software Interfaces — Hardware Guarantees

| Interface | Hardware Provides | Software Uses | Topic / Path |
|---|---|---|---|
| **Video Capture** | RTSP H.264 1080p 15 FPS, 3 FPS sampled on Pi | `cv2.VideoCapture(rtsp_url)` | `rtsp://192.168.1.64` / `...65` |
| **Power Status** | Pi uptime, no UPS (reboot on power cut) | Handle `frame drop → retry` in capture.py | — |
| **Storage** | `/data/evidence/` on SD (max 2 days, ~2.5 GB) | Save JPEG 80% quality ~180KB, clean old files | `/data/evidence/{txnId}.jpg` |
| **Events Out** | WiFi internet | Publish JSON via MQTT TLS | `vos/KOP-001/vision/entry`, `/on_bridge`, `/exit`, `/anomaly` |
| **Config In** | Subscribe to config | Receive polygon, thresholds | `vos/KOP-001/vision/config` |
| **Time Sync** | NTP via WiFi | Timestamp events ISO8601 | — |

**Event JSON (Software → Cloud/MinIO):**
```json
{
  "siteId": "VOS-KOP-001",
  "cameraId": "cam-entry-A",
  "eventType": "entry",
  "timestamp": "2026-09-10T06:15:23Z",
  "plateText": "MH04AB1234",
  "plateConfidence": 0.94,
  "vehicleBbox": [320,180,890,620],
  "imageKey": "/data/evidence/entry_MH04AB1234.jpg"
}
```

**Hardware Limits Software Must Know:**
- Pi 5 CPU-only: YOLOv8n ~120ms → max ~6 FPS single cam, ~3 FPS dual cam (sampled) — enough, truck stays 5 sec
- No GPU TensorRT, use ONNX quantized
- SD write speed ~40 MB/s — don't write video, only JPEG per weighment
- No night IR — degrade mode after 6 PM, ANPR accuracy drops, log it

---

### 7. Hardware Deliverables (What Software Guy Will Receive)

1. Assembled rig at Kopargaon: Pi booted, both cams streaming, PoE powered, SD flashed (Raspberry Pi OS + OpenCV + Python)
2. Document: `hardware/wiring.md` + this draft + Pi SSH credentials + RTSP URLs + WiFi creds
3. Test Snapshot: 2× 10 sec sample videos (one per cam) + 5 sample plate crops for OCR tuning
4. Network: Pi accessible via `ssh pi@192.168.0.x` (WiFi) and `rtsp://192.168.1.64` (VLAN)

---

### 8. Timeline & Handover

| Week | Hardware | Software Parallel |
|---|---|---|
| 1 | Order Pi + 2 cams + PoE (₹30k) | Clone `vosVision/edge/src/capture.py` + YOLO test on laptop |
| 2 | Bengalore lab: bench test RTSP, verify 1080p both cams on Pi | Receive sample videos, label 100 plates in Roboflow |
| 3 | Site install at Kopargaon: mounts 3.5m/5.5m, Cat6 15m/10m, power | Deploy `detector.py` + `anpr.py` to Pi, calibrate polygon |
| 4 | Burn-in 7 days, provide snapshots | Field tuning, MQTT publish to MinIO, dashboard `/vision` |

**Hardware Support for Software:** Will provide `capture.py` RTSP loop with retry, will handle Pi OS updates, will reboot on hang via watchdog.

---

### 9. What Software Guy Needs to Confirm Back

Please reply with:
1. ONNX model name (yolov8n? yolov8s?) and input size 640?
2. RTSP handling: GStreamer pipeline or plain OpenCV? Hardware will install deps accordingly.
3. MQTT broker: Use same EMQX as VOS Connect or local MinIO only for PoC?
4. Plate format regex confirmation: `MH04AB1234`?

---

**Contact for Hardware Queries:** [Your Name, Phone] | **Pi SSH:** `pi / [password]` | **Next:** Hardware procurement after this draft approved.

> Note: This is a daytime, single-weighbridge PoC. Upgrade to 4MP + UPS + SSD + S3 = +₹21k later if Victor scales to 24/7 production.
