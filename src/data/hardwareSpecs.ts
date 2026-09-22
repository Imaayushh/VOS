export interface BOMItem {
  id: number;
  component: string;
  spec: string;
  ipOrConfig: string;
  cost: number;
  category: 'Compute' | 'Optics' | 'Network' | 'Storage' | 'Infrastructure' | 'Power' | 'Buffer';
  cutInPoc?: string;
  upgradedSpec?: string;
  upgradeDelta?: number;
}

export const BOM_DATA: BOMItem[] = [
  {
    id: 1,
    component: "Raspberry Pi 5 8GB + Active Cooler + 27W USB-C PSU",
    spec: "Broadcom BCM2712 4x Cortex-A76 @ 2.4GHz, 8GB LPDDR4X, official active fan heatsink, 27W USB-PD adapter",
    ipOrConfig: "192.168.1.10 (ETH VLAN to cams) + WiFi DHCP (Site Router)",
    cost: 8500,
    category: "Compute",
    cutInPoc: "CPU-only inference (YOLOv8n ONNX ~120ms), no GPU",
    upgradedSpec: "NVIDIA Jetson Orin Nano Super (40-67 TOPS TensorRT)",
    upgradeDelta: 24000
  },
  {
    id: 2,
    component: "Cam A — Entry / ANPR Camera",
    spec: "Dahua 2MP PoE Bullet 1080p, 2.8-12mm varifocal lens, IR 20m, IP67 weather-sealed",
    ipOrConfig: "192.168.1.64:554 (RTSP H.264, 1080p @ 15fps, sampled 3fps)",
    cost: 5500,
    category: "Optics",
    cutInPoc: "2MP Dahua instead of 4MP Hikvision DarkFighter",
    upgradedSpec: "Hikvision 4MP DarkFighter (Ultra-low light, 50fps global shutter)",
    upgradeDelta: 5000
  },
  {
    id: 3,
    component: "Cam B — Top-Down Position Camera",
    spec: "Dahua 2MP PoE Bullet 1080p, 2.8mm ultra-wide angle, IP67 weather-sealed",
    ipOrConfig: "192.168.1.65:554 (RTSP H.264, 1080p @ 15fps, sampled 3fps)",
    cost: 5500,
    category: "Optics",
    cutInPoc: "Standard IR bullet; daytime PoC operation",
    upgradedSpec: "4MP Starlight Wide with optical anti-glare lens",
    upgradeDelta: 4000
  },
  {
    id: 4,
    component: "PoE Switch — Budget 4-Port Fast Ethernet",
    spec: "Mercusys / Generic 4-Port PoE (802.3af/at) with bundled 48V/1.25A DC brick",
    ipOrConfig: "Ports 1 & 2: Cam A & B PoE. Port 3: Pi 5 ETH. Port 4: Spare",
    cost: 2800,
    category: "Network",
    cutInPoc: "No 12V-to-48V DC boost converter (uses direct 48V brick)",
    upgradedSpec: "Industrial DIN-rail Managed 8-Port Gigabit PoE Switch",
    upgradeDelta: 6500
  },
  {
    id: 5,
    component: "High-Endurance MicroSD Storage",
    spec: "64GB SanDisk Extreme A2 V30 (write speed ~40 MB/s), /data partition",
    ipOrConfig: "/data/evidence/ (stores ~180KB JPEG per txn, 2-day rotating buffer)",
    cost: 800,
    category: "Storage",
    cutInPoc: "MicroSD only; no 500GB NVMe SSD",
    upgradedSpec: "500GB PCIe NVMe SSD M.2 HAT (30-day full transaction & video clip buffer)",
    upgradeDelta: 4500
  },
  {
    id: 6,
    component: "Outdoor Cat6 Cabling & RJ45 Connectors",
    spec: "UV-resistant Cat6 Outdoor STP: 15m (Cam A) + 10m (Cam B) + 2m (Pi ETH)",
    ipOrConfig: "Pure copper conductors with shielded metal RJ45 terminations",
    cost: 800,
    category: "Infrastructure",
    cutInPoc: "Direct surface run inside flexible PVC conduit",
    upgradedSpec: "Armored underground gel-filled outdoor Cat6 with lightning surge suppressors",
    upgradeDelta: 1800
  },
  {
    id: 7,
    component: "DIY Mounting Hardware & IP65 Junction Box",
    spec: "2x Heavy-duty DIY L-angle pole mounts + IP65 weather-resistant enclosure box",
    ipOrConfig: "Cam A: 3.5m pole (15° tilt) | Cam B: 5.5m gantry (90° nadir)",
    cost: 2000,
    category: "Infrastructure",
    cutInPoc: "Mild steel L-angles with anti-rust spray paint",
    upgradedSpec: "Galvanized 304 Stainless Steel adjustable pan-tilt brackets + IP66 rated cabinet",
    upgradeDelta: 3500
  },
  {
    id: 8,
    component: "Mains Electrical Protection",
    spec: "AC DIN terminal block + 2x 3A fast-blow fuses + MOV 14D471K + PE earth wire",
    ipOrConfig: "230V AC input -> dual fused lines to Pi 27W & 48V PoE brick",
    cost: 300,
    category: "Power",
    cutInPoc: "Site power only; no Microtek line-interactive UPS",
    upgradedSpec: "Microtek 1kVA Online/Line-Interactive UPS (30 min battery backup)",
    upgradeDelta: 6000
  },
  {
    id: 9,
    component: "Contingency & Field Spares Buffer",
    spec: "Unforeseen site installation hardware, screws, gland nuts, cable ties, tape",
    ipOrConfig: "Reserved for Kopargaon field deployment contingency",
    cost: 2000,
    category: "Buffer",
    cutInPoc: "Field reserve",
    upgradedSpec: "Enhanced warranty + site replacement spare kit",
    upgradeDelta: 0
  }
];

export const PIPELINE_STEPS = [
  {
    step: 1,
    title: "Dahua IP Cameras RTSP Streaming",
    device: "Cam A & Cam B (1080p Dahua Bullets)",
    protocol: "RTSP over H.264 (Port 554)",
    codeSnippet: `CAM_A = "rtsp://admin:pass@192.168.1.64:554/cam/realmonitor?channel=1&subtype=0"\nCAM_B = "rtsp://admin:pass@192.168.1.65:554/cam/realmonitor?channel=1&subtype=0"`,
    description: "Two Dahua 2MP PoE cameras stream continuous 1080p H.264 video at 15 FPS over dedicated Cat6 cabling to the PoE switch."
  },
  {
    step: 2,
    title: "PoE Switching & Isolated VLAN",
    device: "4-Port PoE Switch",
    protocol: "802.3af/at PoE + 10/100 Ethernet (VLAN 192.168.1.0/24)",
    codeSnippet: `VLAN 192.168.1.0/24 (Isolated, No Internet)\n- Cam A: 192.168.1.64\n- Cam B: 192.168.1.65\n- Pi ETH: 192.168.1.10`,
    description: "Camera traffic is physically isolated on a 192.168.1.0/24 VLAN with no external gateway to guarantee cybersecurity and prevent packet collision."
  },
  {
    step: 3,
    title: "OpenCV RTSP Ingestion & Frame Buffer",
    device: "Raspberry Pi 5 (Python 3.11 + OpenCV)",
    protocol: "cv2.VideoCapture()",
    codeSnippet: `cap_a = cv2.VideoCapture(CAM_A)\nret, frame_a = cap_a.read() # Sampled at 3-5 FPS to respect Pi 5 CPU limits`,
    description: "OpenCV reads the RTSP stream. A custom loop drops intermediate frames to sample 3-5 FPS, preventing buffer queue lag on the quad-core CPU."
  },
  {
    step: 4,
    title: "YOLOv8n Vehicle Detection",
    device: "Pi 5 CPU (ONNX Runtime)",
    protocol: "Quantized ONNX FP16 / INT8 (~120ms inference)",
    codeSnippet: `results = yolov8_session.run(None, {"images": preprocessed_frame})\n# Detected: Truck | Confidence: 96% | Bbox: [320, 180, 890, 620]`,
    description: "The YOLOv8n model runs in 120ms on the Cortex-A76 cores, outputting bounding boxes, classification (Truck/Trailer), and confidence scores."
  },
  {
    step: 5,
    title: "ByteTrack Vehicle Tracking",
    device: "Pi 5 Python Runtime",
    protocol: "Kalman Filter + Hungarian Matching",
    codeSnippet: `tracks = tracker.update(detections)\n# Assigned: Vehicle #25 (Maintains state across incoming frames)`,
    description: "Associates detections across consecutive frames to assign a persistent Vehicle ID #25, tracking entry speed and trajectory."
  },
  {
    step: 6,
    title: "Vehicle & License Plate ROI Cropping",
    device: "OpenCV & NumPy",
    protocol: "Array Slicing & Perspective Rectification",
    codeSnippet: `vehicle_crop = frame[y1:y2, x1:x2]\nplate_crop = extract_plate_region(vehicle_crop) # ~80-100px width`,
    description: "Crops high-resolution region of interest for the license plate from the 1080p frame and applies bilateral filtering & sharpening."
  },
  {
    step: 7,
    title: "PaddleOCR Character Extraction",
    device: "PaddleOCR Mobile Model",
    protocol: "CRNN / SVTR Text Recognition",
    codeSnippet: `ocr_res = paddle_ocr.ocr(plate_crop, cls=True)\n# Extracted: 'MH04AB1234' | Confidence: 94.2%`,
    description: "Extracts alphanumeric characters and validates against Indian HSRP format regex (^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$)."
  },
  {
    step: 8,
    title: "Cam B 4-Point Bridge Polygon Check",
    device: "Pi 5 Geometry Engine",
    protocol: "Point-in-Polygon (Ray Casting Algorithm)",
    codeSnippet: `bridge_poly = [[100, 200], [1000, 200], [1000, 700], [100, 700]]\nis_inside = cv2.pointPolygonTest(bridge_poly, truck_center, False) >= 0\n# Result: True -> Truck fully on 18m platform deck`,
    description: "Top-down Camera B verifies all truck wheels and axles are within the calibrated 18m weighbridge perimeter before accepting weighment."
  },
  {
    step: 9,
    title: "Weighing Indicator Fusion",
    device: "Weighing Controller (Victor)",
    protocol: "RS-232 / RS-485 Modbus RTU / Ethernet",
    codeSnippet: `weight_kg = serial_gateway.read_stable_weight() # 38,420 kg\ntxn_id = "VOS-TXN-98452"`,
    description: "Fuses live weight reading from Victor load cells with the detected visual vehicle ID to create an unforgeable digital audit record."
  },
  {
    step: 10,
    title: "Local Evidence Saving",
    device: "SanDisk 64GB Extreme SD",
    protocol: "Local FS / MinIO Object Storage",
    codeSnippet: `evidence_path = "/data/evidence/txn_98452_MH04AB1234.jpg"\ncv2.imwrite(evidence_path, vehicle_crop, [cv2.IMWRITE_JPEG_QUALITY, 80])`,
    description: "Saves high-quality 180KB JPEG evidence image locally on SD card. Automatically purges snapshots older than 48 hours."
  },
  {
    step: 11,
    title: "MQTT Event Serialization",
    device: "Pi 5 WiFi Client",
    protocol: "MQTT over TLS (Port 8883) via WiFi",
    codeSnippet: `mqtt_client.publish("vos/KOP-001/vision/entry", json.dumps({\n  "siteId": "VOS-KOP-001",\n  "cameraId": "cam-entry-A",\n  "eventType": "entry",\n  "timestamp": "2026-09-10T06:15:23Z",\n  "plateText": "MH04AB1234",\n  "plateConfidence": 0.94,\n  "weightKg": 38420,\n  "vehicleBbox": [320, 180, 890, 620]\n}))`,
    description: "Transmits real-time telemetric event payload over site WiFi to central MQTT broker (EMQX) and cloud backend."
  },
  {
    step: 12,
    title: "Backend Persistence & Live Dashboard",
    device: "Central Server & React Frontend",
    protocol: "Django REST API + PostgreSQL + WebSocket",
    codeSnippet: `WebSocket.send({ type: "LIVE_WEIGHMENT", data: txn_record })\n// React Dashboard updates instantly without page reload`,
    description: "Stores record into PostgreSQL, validates against fraud/anomalies, and pushes instant live update to operator web dashboard."
  }
];

export const TECHNICAL_SPECS = {
  site: "VOS-KOP-001 (Kopargaon Field Weighbridge)",
  budgetLimit: 30000,
  weighbridgeLength: "18 Meters Platform + 1m margin",
  cameraA: {
    role: "Entry ANPR & Vehicle Identification",
    mount: "3.5m Pole, 6-8m before bridge, 15° downward pitch",
    lens: "8-12mm Varifocal, plate ~80-100px wide at 1080p",
    ip: "192.168.1.64",
    rtsp: "rtsp://admin:pass@192.168.1.64:554/cam/realmonitor?channel=1&subtype=0"
  },
  cameraB: {
    role: "Top-Down Bridge Positioning & Axle Verification",
    mount: "5.5m Gantry/Building over bridge center, 90° nadir",
    lens: "2.8mm Wide Angle capturing full 18m platform",
    ip: "192.168.1.65",
    rtsp: "rtsp://admin:pass@192.168.1.65:554/cam/realmonitor?channel=1&subtype=0"
  },
  pi5: {
    ipVlan: "192.168.1.10 (ETH interface to PoE Switch)",
    ipWan: "DHCP (e.g. 192.168.0.100 via WiFi to Site Router)",
    ssh: "pi@192.168.1.10 or pi@<wifi-ip>",
    inferenceTime: "~120ms per frame (YOLOv8n ONNX)",
    storagePath: "/data/evidence/ (64GB SD, 2-day buffer)"
  }
};
