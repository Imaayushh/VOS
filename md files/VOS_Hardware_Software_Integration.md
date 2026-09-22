# VOS Vision — Hardware to Software Integration

## 1. Complete Hardware → Software Architecture

```text
                    VEHICLE
                        │
            ┌───────────▼───────────┐
            │                       │
      CAMERA A              CAMERA B
      Entry / ANPR          Top View
            │                       │
            └───────────┬───────────┘
                        │
                     RTSP Stream
                        │
                  PoE Switch
                        │
                 Raspberry Pi 5
                        │
          ┌─────────────┼─────────────┐
          │             │             │
        OpenCV         YOLO       PaddleOCR
          │             │             │
     Capture Frame  Vehicle Detect  Plate Read
          │             │             │
          └─────────────┼─────────────┘
                        │
                    Python
                        │
                 MQTT / API
                        │
                   Database
                        │
                 React Dashboard
```

Your hardware setup consists of a Raspberry Pi 5, two Dahua IP cameras, and a PoE network. The hardware is designed to provide two RTSP video streams to the software for AI inference.

---

## 2. How OpenCV Connects With the Hardware

In this project, OpenCV does not directly communicate with the physical camera electronics.

The Dahua cameras provide an RTSP video stream through the network.

```text
Dahua Camera
     │
     │ Ethernet Cable
     ▼
PoE Switch
     │
     │ Network
     ▼
Raspberry Pi
     │
     ▼
OpenCV
```

The software can access the camera streams using:

```python
cv2.VideoCapture(rtsp_url)
```

The two camera streams are:

- Camera A: `192.168.1.64` — Entry / ANPR
- Camera B: `192.168.1.65` — Top-down bridge position

---

## 3. Software Project Structure

A recommended structure is:

```text
vosVision/
│
├── capture.py
├── detector.py
├── anpr.py
├── tracker.py
├── mqtt_client.py
├── config.py
│
└── main.py
```

A more complete structure can be:

```text
vosVision/

├── src/
│
│   ├── main.py
│   │
│   ├── capture.py
│   │      └── RTSP + OpenCV
│   │
│   ├── detector.py
│   │      └── YOLO Vehicle Detection
│   │
│   ├── anpr.py
│   │      └── Number Plate Recognition
│   │
│   ├── tracker.py
│   │      └── Vehicle Tracking
│   │
│   ├── bridge.py
│   │      └── ROI / Polygon Check
│   │
│   ├── events.py
│   │      └── Entry / Exit / Anomaly
│   │
│   ├── mqtt_client.py
│   │      └── Send Events
│   │
│   └── storage.py
│          └── Save Evidence Images
│
├── models/
│
│   └── yolov8n.onnx
│
├── config/
│
│   └── camera_config.json
│
└── requirements.txt
```

---

## 4. Step 1 — Raspberry Pi Receives Camera Stream

### Camera A — Entry / ANPR

```text
Purpose:
Vehicle Entry Detection
+
ANPR / Number Plate Recognition
```

IP:

```text
192.168.1.64
```

### Camera B — Top-Down Position

```text
Purpose:
Vehicle Position Detection
+
Bridge Monitoring
```

IP:

```text
192.168.1.65
```

Both cameras provide RTSP streams to the Raspberry Pi.

---

## 5. Step 2 — OpenCV Captures Images From Cameras

Example `capture.py`:

```python
import cv2

CAM_A = "rtsp://admin:password@192.168.1.64:554/..."

cap = cv2.VideoCapture(CAM_A)

while True:
    ret, frame = cap.read()

    if not ret:
        print("Camera connection failed")
        continue

    cv2.imshow("Camera A", frame)

    # Press Q to exit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
```

### What happens?

```text
Camera A
    ↓
RTSP Video
    ↓
OpenCV
    ↓
frame
    ↓
Python Program
```

Each `frame` is an image captured from the live video.

---

## 6. Step 3 — Send OpenCV Frame to YOLO

After OpenCV captures a frame:

```python
ret, frame = cap.read()
```

Send it to YOLO:

```python
results = model(frame)
```

Architecture:

```text
OpenCV Frame
      ↓
     YOLO
      ↓
┌──────────────┐
│ Truck        │
│ Confidence   │
│ Bounding Box │
└──────────────┘
```

For example, YOLO may provide:

```text
Truck Found!

Position:

x1 = 200
y1 = 150

x2 = 800
y2 = 600
```

---

## 7. Step 4 — Crop Vehicle Image Using OpenCV

YOLO gives the vehicle location.

```text
Original Camera Frame

┌────────────────────────────┐
│                            │
│        ┌──────────┐        │
│        │  Truck   │        │
│        └──────────┘        │
│                            │
└────────────────────────────┘
```

YOLO provides coordinates:

```text
x1, y1
x2, y2
```

OpenCV/NumPy can crop the vehicle:

```python
vehicle = frame[y1:y2, x1:x2]

cv2.imwrite(
    "/data/evidence/truck.jpg",
    vehicle
)
```

The hardware setup provides `/data/evidence/` for evidence images.

---

## 8. Step 5 — Camera A → Number Plate Recognition

Camera A should be used for the ANPR pipeline:

```text
CAMERA A
    │
    ▼
OpenCV
Capture Frame
    │
    ▼
YOLO
Detect Truck
    │
    ▼
Crop Vehicle
    │
    ▼
Detect Plate Region
    │
    ▼
PaddleOCR
    │
    ▼
MH12AB1234
```

Example:

```python
plate_result = paddle_ocr.predict(vehicle_image)
```

The software can produce:

```text
Plate Number

MH12AB1234

Confidence

94%
```

---

## 9. Step 6 — Camera B → Bridge Position Detection

Camera B has a different purpose: checking whether the vehicle is positioned on the weighbridge.

```text
       CAMERA B
          │
          ▼

    ┌──────────────┐
    │              │
    │    BRIDGE    │
    │     TRUCK    │
    │              │
    └──────────────┘
```

The hardware document specifies that software needs to define a 4-point polygon ROI for the bridge.

Example:

```python
bridge_polygon = [
    [100, 200],
    [1000, 200],
    [1000, 700],
    [100, 700]
]
```

The software can then check:

```text
Is Truck Inside Bridge?

YES
    ↓
Vehicle On Bridge Event
```

---

## 10. Step 7 — Use Two Cameras Together

### Camera A

```text
TRUCK ENTERS
     ↓
Detect Truck
     ↓
Capture Image
     ↓
Read Number Plate
     ↓
Generate Vehicle Event
```

### Camera B

```text
TRUCK ON BRIDGE
      ↓
Detect Truck
      ↓
Check ROI Polygon
      ↓
Confirm Position
```

### Combined

```text
CAMERA A                    CAMERA B

Entry                       Position
  │                            │
  ▼                            ▼

TRUCK DETECTED            TRUCK ON BRIDGE
  │                            │
  └─────────────┬──────────────┘
                │
                ▼

          VEHICLE EVENT
                │
                ▼

         Send to Backend
```

---

## 11. Step 8 — MQTT Integration

The hardware setup defines MQTT topics for software events.

Example:

```text
vos/KOP-001/vision/entry
vos/KOP-001/vision/on_bridge
vos/KOP-001/vision/exit
vos/KOP-001/vision/anomaly
```

The software can publish events like:

```text
YOLO Detection
      ↓
Python
      ↓
Create JSON
      ↓
MQTT
      ↓
Cloud / Backend
      ↓
Database
      ↓
React Dashboard
```

Example event JSON:

```json
{
  "siteId": "VOS-KOP-001",
  "cameraId": "cam-entry-A",
  "eventType": "entry",
  "timestamp": "2026-09-10T06:15:23Z",
  "plateText": "MH04AB1234",
  "plateConfidence": 0.94,
  "vehicleBbox": [320, 180, 890, 620],
  "imageKey": "/data/evidence/entry_MH04AB1234.jpg"
}
```

---

## 12. Complete Software Pipeline

```text
1. Dahua Camera
       ↓ RTSP

2. Raspberry Pi 5
       ↓

3. OpenCV
Capture Frame
       ↓

4. YOLO
Detect Vehicle
       ↓

5. Vehicle Tracker
Assign Vehicle ID
       ↓

6. OpenCV
Crop Vehicle Image
       ↓

7. PaddleOCR
Read Number Plate
       ↓

8. Camera B
Check Bridge Position
       ↓

9. Python
Create Event JSON
       ↓

10. MQTT / Django API
       ↓

11. Database
       ↓

12. React Dashboard
```

---

## 13. Recommended Software Stack for This Hardware

### Computer Vision

```text
Python
OpenCV
NumPy
YOLOv8n
ONNX Runtime
PaddleOCR
```

### Data

```text
Pandas
PostgreSQL
```

### Communication

```text
MQTT
Django REST Framework / API
```

### Frontend

```text
React
```

### Model Optimization

```text
ONNX
```

### TensorRT

TensorRT should not be used on the current Raspberry Pi 5 setup because the hardware document specifies that the Pi is CPU-only and does not have an NVIDIA GPU.

For this PoC, the hardware plan recommends an ONNX quantized model instead.

---

## 14. Important Hardware Limitation

The Raspberry Pi 5 is CPU-only in this setup.

The hardware plan estimates:

```text
YOLOv8n ≈ 120 ms
Maximum ≈ 6 FPS for a single camera
≈ 3 FPS for two cameras when sampled
```

This is considered sufficient for the PoC because a truck remains on the bridge for several seconds.

The plan also specifies:

- No GPU TensorRT
- Use ONNX quantized model
- Do not continuously write video
- Save JPEG evidence images instead
- Daytime operation for the current PoC
- ANPR accuracy may decrease after 6 PM because there is no IR illuminator

---

## 15. Final VOS Vision Architecture

```text
                    HARDWARE

        ┌──────────────────────────┐
        │      Dahua Camera A      │
        │      Entry / ANPR        │
        └────────────┬─────────────┘
                     │
                    RTSP
                     │
        ┌────────────▼─────────────┐
        │      Dahua Camera B      │
        │      Top-Down Position   │
        └────────────┬─────────────┘
                     │
                     ▼
                PoE Switch
                     │
                     ▼
              Raspberry Pi 5
                     │
                     ▼
                   OpenCV
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
        YOLO                Camera ROI
          │                     │
          ▼                     ▼
     Vehicle Detection    Bridge Detection
          │
          ▼
     Vehicle Tracking
          │
          ▼
      PaddleOCR
          │
          ▼
    Number Plate Data
          │
          ▼
       Python Event
          │
          ▼
         MQTT
          │
          ▼
     Django / DRF
          │
          ▼
      PostgreSQL
          │
          ▼
     React Dashboard
```

## 16. Recommended Development Order

### Phase 1 — Camera Connection

First make both RTSP streams work on the Raspberry Pi using OpenCV.

### Phase 2 — Vehicle Detection

Integrate YOLO and verify that trucks are detected correctly.

### Phase 3 — Vehicle Tracking

Add tracking so the same truck can maintain an ID across frames.

### Phase 4 — ANPR

Use Camera A + PaddleOCR to recognize number plates.

### Phase 5 — Bridge Detection

Use Camera B and the 4-point ROI polygon to determine whether the truck is on the weighbridge.

### Phase 6 — Event System

Create:

```text
Entry
On Bridge
Exit
Anomaly
```

### Phase 7 — Communication

Publish events through MQTT.

### Phase 8 — Backend

Store vehicle information and evidence images through the backend/database.

### Phase 9 — Dashboard

Display:

- Live camera status
- Vehicle number
- Vehicle type
- Entry/exit events
- Bridge status
- ANPR result
- Confidence
- Evidence image
- Anomalies

---

## 17. Key Concept

The most important integration is:

```text
CAMERA
   ↓
RTSP
   ↓
RASPBERRY PI
   ↓
OpenCV
   ↓
YOLO
   ↓
PaddleOCR
   ↓
Python Event Engine
   ↓
MQTT / API
   ↓
Database
   ↓
React Dashboard
```

**OpenCV is the software layer that receives the RTSP camera stream and converts the live stream into frames that your AI models can process.**
