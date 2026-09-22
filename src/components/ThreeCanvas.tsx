"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
// We can use a lightweight custom orbit controller or Three.js OrbitControls
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Eye, Focus, Play, RotateCcw, Video, Maximize2, Layers } from "lucide-react";

interface ThreeCanvasProps {
  onSelectComponent: (componentId: string) => void;
  selectedComponent: string | null;
  truckProgress: number; // 0 to 1
  isSimulating: boolean;
  onToggleSimulate: () => void;
  onResetSimulate: () => void;
  showFrustums: boolean;
  onToggleFrustums: () => void;
  showCables: boolean;
  onToggleCables: () => void;
  viewPreset: string;
  onSetViewPreset: (preset: string) => void;
}

export default function ThreeCanvas({
  onSelectComponent,
  selectedComponent,
  truckProgress,
  isSimulating,
  onToggleSimulate,
  onResetSimulate,
  showFrustums,
  onToggleFrustums,
  showCables,
  onToggleCables,
  viewPreset,
  onSetViewPreset,
}: ThreeCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const truckGroupRef = useRef<THREE.Group | null>(null);
  const frustumGroupRef = useRef<THREE.Group | null>(null);
  const cablesGroupRef = useRef<THREE.Group | null>(null);
  const polygonMeshRef = useRef<THREE.LineLoop | null>(null);
  const pulseParticlesRef = useRef<THREE.Points[]>([]);
  const interactableObjectsRef = useRef<THREE.Object3D[]>([]);

  // Track hover state for cursor
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060912);
    scene.fog = new THREE.FogExp2(0x060912, 0.015);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 200);
    camera.position.set(-22, 14, 24);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go below ground
    controls.minDistance = 3;
    controls.maxDistance = 75;
    controls.target.set(0, 2, 0);
    controlsRef.current = controls;

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0xdde8ff, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff6e8, 1.8);
    sunLight.position.set(20, 30, 15);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 80;
    sunLight.shadow.camera.left = -25;
    sunLight.shadow.camera.right = 25;
    sunLight.shadow.camera.top = 20;
    sunLight.shadow.camera.bottom = -20;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Cyan & Amber industrial accent lights
    const cyanLight = new THREE.PointLight(0x00f0ff, 1.2, 25);
    cyanLight.position.set(-8, 5, 4);
    scene.add(cyanLight);

    const amberLight = new THREE.PointLight(0xf59e0b, 1.0, 25);
    amberLight.position.set(5, 7, 0);
    scene.add(amberLight);

    // 6. Ground & Road
    const groundGeo = new THREE.PlaneGeometry(120, 80);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Subtle road surface
    const roadGeo = new THREE.PlaneGeometry(70, 8);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x182030,
      roughness: 0.8,
      metalness: 0.2,
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0.02;
    road.receiveShadow = true;
    scene.add(road);

    // Road dashed center line
    const roadLineGeo = new THREE.PlaneGeometry(66, 0.2);
    const roadLineMat = new THREE.MeshBasicMaterial({ color: 0x64748b });
    const roadLine = new THREE.Mesh(roadLineGeo, roadLineMat);
    roadLine.rotation.x = -Math.PI / 2;
    roadLine.position.y = 0.03;
    scene.add(roadLine);

    // 7. Industrial 18m Weighbridge Platform
    // 18m long (X axis) x 3.4m wide (Z axis), 0.4m thick
    const bridgeGroup = new THREE.Group();
    bridgeGroup.name = "weighbridge";
    (bridgeGroup as any).userData = { id: "weighbridge", label: "18m Weighbridge Platform Deck" };
    interactableObjectsRef.current.push(bridgeGroup);

    // Concrete pit foundation
    const pitGeo = new THREE.BoxGeometry(19, 0.4, 3.8);
    const pitMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
    const pit = new THREE.Mesh(pitGeo, pitMat);
    pit.position.set(0, 0.2, 0);
    pit.receiveShadow = true;
    bridgeGroup.add(pit);

    // Steel Platform Deck (18m x 3.2m x 0.25m)
    const deckGeo = new THREE.BoxGeometry(18, 0.25, 3.2);
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0x243247,
      roughness: 0.4,
      metalness: 0.8,
    });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(0, 0.45, 0);
    deck.castShadow = true;
    deck.receiveShadow = true;
    bridgeGroup.add(deck);

    // Yellow & Black hazard border stripes on sides of the weighbridge
    const hazardMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.5,
      metalness: 0.3,
    });
    const borderLeftGeo = new THREE.BoxGeometry(18, 0.28, 0.15);
    const borderLeft = new THREE.Mesh(borderLeftGeo, hazardMat);
    borderLeft.position.set(0, 0.46, 1.6);
    bridgeGroup.add(borderLeft);

    const borderRight = borderLeft.clone();
    borderRight.position.set(0, 0.46, -1.6);
    bridgeGroup.add(borderRight);

    // Guard rails on both sides
    const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
    [-1.65, 1.65].forEach((zPos) => {
      // Horizontal rail bar
      const barGeo = new THREE.CylinderGeometry(0.05, 0.05, 18, 16);
      const bar = new THREE.Mesh(barGeo, railMat);
      bar.rotation.z = Math.PI / 2;
      bar.position.set(0, 1.0, zPos);
      bar.castShadow = true;
      bridgeGroup.add(bar);

      // Vertical posts along 18m length
      for (let x = -8; x <= 8; x += 4) {
        const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.6, 12);
        const post = new THREE.Mesh(postGeo, railMat);
        post.position.set(x, 0.7, zPos);
        post.castShadow = true;
        bridgeGroup.add(post);
      }
    });

    // Concrete Approach Ramps
    const rampMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85 });
    // Left ramp (entry)
    const rampLeftGeo = new THREE.BoxGeometry(4, 0.35, 3.4);
    const rampLeft = new THREE.Mesh(rampLeftGeo, rampMat);
    rampLeft.position.set(-11, 0.18, 0);
    rampLeft.rotation.z = -0.06;
    rampLeft.receiveShadow = true;
    bridgeGroup.add(rampLeft);

    // Right ramp (exit)
    const rampRight = rampLeft.clone();
    rampRight.position.set(11, 0.18, 0);
    rampRight.rotation.z = 0.06;
    bridgeGroup.add(rampRight);

    // 4 Heavy-duty Load Cells under platform
    const loadCellMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, metalness: 0.9, roughness: 0.2 });
    [
      [-7, -1.2],
      [-7, 1.2],
      [7, -1.2],
      [7, 1.2],
      [0, -1.2],
      [0, 1.2],
    ].forEach(([x, z]) => {
      const cellGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.2, 16);
      const cell = new THREE.Mesh(cellGeo, loadCellMat);
      cell.position.set(x, 0.25, z);
      bridgeGroup.add(cell);
    });

    scene.add(bridgeGroup);

    // 8. Camera A (Entry ANPR) on 3.5m Pole
    // Positioned 7m before bridge: X = -16, Z = 3.5, Height = 3.5m, pitch 15° down
    const camAGroup = new THREE.Group();
    camAGroup.name = "cam-a";
    (camAGroup as any).userData = { id: "cam-a", label: "Camera A — Entry ANPR (192.168.1.64)" };
    interactableObjectsRef.current.push(camAGroup);

    // Pole
    const poleAGeo = new THREE.CylinderGeometry(0.1, 0.12, 3.5, 16);
    const poleAMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.3 });
    const poleA = new THREE.Mesh(poleAGeo, poleAMat);
    poleA.position.set(-16, 1.75, 3.8);
    poleA.castShadow = true;
    camAGroup.add(poleA);

    // L-Angle Mounting arm
    const armGeo = new THREE.BoxGeometry(0.1, 0.1, 0.8);
    const armA = new THREE.Mesh(armGeo, poleAMat);
    armA.position.set(-16, 3.4, 3.4);
    camAGroup.add(armA);

    // Camera housing (Dahua 2MP PoE Bullet)
    const camBodyGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.45, 16);
    const camBodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.2 });
    const camAHead = new THREE.Mesh(camBodyGeo, camBodyMat);
    camAHead.rotation.x = Math.PI / 2;
    // Rotate to point toward incoming lane (-X direction and angled down 15 degrees)
    camAHead.rotation.y = -Math.PI / 5;
    camAHead.rotation.z = -0.26; // ~15 degrees pitch down
    camAHead.position.set(-16, 3.4, 3.0);
    camAHead.castShadow = true;
    camAGroup.add(camAHead);

    // Lens ring & front glass
    const lensRingGeo = new THREE.TorusGeometry(0.12, 0.02, 16, 32);
    const lensRingMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, metalness: 0.9 });
    const lensRingA = new THREE.Mesh(lensRingGeo, lensRingMat);
    lensRingA.position.set(-16.15, 3.32, 2.75);
    lensRingA.rotation.y = -Math.PI / 5;
    camAGroup.add(lensRingA);

    scene.add(camAGroup);

    // 9. Camera B (Top-Down Position) on 5.5m Gantry
    // Gantry arches over center of bridge at X = 0, height 5.5m
    const camBGroup = new THREE.Group();
    camBGroup.name = "cam-b";
    (camBGroup as any).userData = { id: "cam-b", label: "Camera B — Top-Down Position (192.168.1.65)" };
    interactableObjectsRef.current.push(camBGroup);

    // Overhead steel gantry frame
    const gantryMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });
    // Left leg
    const legLeftGeo = new THREE.CylinderGeometry(0.12, 0.15, 5.5, 16);
    const legLeft = new THREE.Mesh(legLeftGeo, gantryMat);
    legLeft.position.set(0, 2.75, 2.8);
    legLeft.castShadow = true;
    camBGroup.add(legLeft);

    // Right leg
    const legRight = legLeft.clone();
    legRight.position.set(0, 2.75, -2.8);
    camBGroup.add(legRight);

    // Overhead horizontal truss
    const trussGeo = new THREE.BoxGeometry(0.25, 0.25, 5.8);
    const truss = new THREE.Mesh(trussGeo, gantryMat);
    truss.position.set(0, 5.5, 0);
    truss.castShadow = true;
    camBGroup.add(truss);

    // Cam B bullet camera pointing straight down (90° nadir)
    const camBHead = new THREE.Mesh(camBodyGeo, camBodyMat);
    camBHead.rotation.x = 0; // pointing down
    camBHead.position.set(0, 5.25, 0);
    camBHead.castShadow = true;
    camBGroup.add(camBHead);

    // Cam B lens ring
    const lensRingB = new THREE.Mesh(lensRingGeo, lensRingMat);
    lensRingB.position.set(0, 5.0, 0);
    lensRingB.rotation.x = Math.PI / 2;
    camBGroup.add(lensRingB);

    scene.add(camBGroup);

    // 10. IP65 Control Enclosure (Raspberry Pi 5 + PoE Switch + Mains Terminal)
    // Mounted on Cam A pole at 1.4m height
    const enclosureGroup = new THREE.Group();
    enclosureGroup.name = "control-enclosure";
    (enclosureGroup as any).userData = { id: "control-enclosure", label: "IP65 Control Enclosure (Pi 5 + PoE Switch)" };
    interactableObjectsRef.current.push(enclosureGroup);

    // Outer Weatherproof Box (Grey Polycarbonate)
    const boxGeo = new THREE.BoxGeometry(0.5, 0.7, 0.3);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.4,
      transparent: true,
      opacity: 0.92,
    });
    const enclosureBox = new THREE.Mesh(boxGeo, boxMat);
    enclosureBox.position.set(-16, 1.5, 4.05);
    enclosureBox.castShadow = true;
    enclosureGroup.add(enclosureBox);

    // Inside component 1: Raspberry Pi 5 (Green PCB + Silver active cooler)
    const piGeo = new THREE.BoxGeometry(0.18, 0.25, 0.05);
    const piMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.5 });
    const piMesh = new THREE.Mesh(piGeo, piMat);
    piMesh.position.set(-16, 1.65, 4.05);
    enclosureGroup.add(piMesh);

    // Pi Cooler Fan / Heatsink
    const heatsinkGeo = new THREE.BoxGeometry(0.1, 0.1, 0.04);
    const heatsinkMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
    const heatsink = new THREE.Mesh(heatsinkGeo, heatsinkMat);
    heatsink.position.set(-16, 1.65, 4.08);
    enclosureGroup.add(heatsink);

    // Blinking Green Pi Power/Activity LED
    const ledGeo = new THREE.SphereGeometry(0.015, 8, 8);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const piLed = new THREE.Mesh(ledGeo, ledMat);
    piLed.position.set(-15.93, 1.74, 4.09);
    enclosureGroup.add(piLed);

    // Inside component 2: 4-Port PoE Switch (Black metallic chassis + yellow PoE ports)
    const switchGeo = new THREE.BoxGeometry(0.28, 0.15, 0.08);
    const switchMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.8 });
    const switchMesh = new THREE.Mesh(switchGeo, switchMat);
    switchMesh.position.set(-16, 1.35, 4.05);
    enclosureGroup.add(switchMesh);

    // PoE Port indicator lights (Amber/Green dots)
    for (let p = -0.1; p <= 0.1; p += 0.06) {
      const portLedGeo = new THREE.SphereGeometry(0.008, 6, 6);
      const portLedMat = new THREE.MeshBasicMaterial({ color: p > 0 ? 0x00f0ff : 0xf59e0b });
      const portLed = new THREE.Mesh(portLedGeo, portLedMat);
      portLed.position.set(-16 + p, 1.35, 4.1);
      enclosureGroup.add(portLed);
    }

    // Inside component 3: Mains Terminal + Dual 3A Fuses & MOV
    const fuseGeo = new THREE.BoxGeometry(0.18, 0.08, 0.04);
    const fuseMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 });
    const fuseBlock = new THREE.Mesh(fuseGeo, fuseMat);
    fuseBlock.position.set(-16, 1.18, 4.05);
    enclosureGroup.add(fuseBlock);

    scene.add(enclosureGroup);

    // 11. 4-Point Polygon Projection on Bridge Deck for Cam B Calibration
    // Hardware doc specifies: bridge_polygon = [[x1,y1],[x2,y2],[x3,y3],[x4,y4]]
    const polyPoints = [
      new THREE.Vector3(-8.5, 0.58, -1.45),
      new THREE.Vector3(8.5, 0.58, -1.45),
      new THREE.Vector3(8.5, 0.58, 1.45),
      new THREE.Vector3(-8.5, 0.58, 1.45),
    ];
    const polyGeo = new THREE.BufferGeometry().setFromPoints(polyPoints);
    const polyMat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 });
    const polygonLoop = new THREE.LineLoop(polyGeo, polyMat);
    polygonMeshRef.current = polygonLoop;
    scene.add(polygonLoop);

    // Polygon corner marker beacons
    polyPoints.forEach((pt) => {
      const pinGeo = new THREE.CylinderGeometry(0.08, 0.02, 0.15, 8);
      const pinMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.6 });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.copy(pt);
      scene.add(pin);
    });

    // 12. Frustums & Optical Cones
    const frustumGroup = new THREE.Group();
    frustumGroupRef.current = frustumGroup;

    // Cam A Frustum (Entry view cone targeting approaching truck)
    const coneAGeo = new THREE.ConeGeometry(3.5, 12, 16, 1, true);
    const coneAMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.12,
      wireframe: true,
      side: THREE.DoubleSide,
    });
    const coneA = new THREE.Mesh(coneAGeo, coneAMat);
    // Orient cone to project from Cam A downwards toward (-24, 0, 0)
    coneA.position.set(-19.5, 1.8, 1.6);
    coneA.rotation.z = -1.35;
    coneA.rotation.y = -0.6;
    frustumGroup.add(coneA);

    // Cam B Frustum (Nadir top-down cone covering full 18m platform)
    const coneBGeo = new THREE.ConeGeometry(9.2, 5.2, 16, 1, true);
    const coneBMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.1,
      wireframe: true,
      side: THREE.DoubleSide,
    });
    const coneB = new THREE.Mesh(coneBGeo, coneBMat);
    coneB.position.set(0, 2.6, 0);
    coneB.rotation.x = Math.PI; // pointing down
    frustumGroup.add(coneB);

    scene.add(frustumGroup);

    // 13. Animated Cat6 Cabling Paths
    const cablesGroup = new THREE.Group();
    cablesGroupRef.current = cablesGroup;

    // Cable A: Enclosure (-16, 1.5, 4.05) -> up pole to Cam A (-16, 3.4, 3.0)
    const curveA = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-16, 1.4, 4.0),
      new THREE.Vector3(-16, 2.5, 3.8),
      new THREE.Vector3(-16, 3.3, 3.5),
      new THREE.Vector3(-16, 3.4, 3.0),
    ]);
    const tubeAGeo = new THREE.TubeGeometry(curveA, 20, 0.025, 8, false);
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6 });
    const tubeA = new THREE.Mesh(tubeAGeo, cableMat);
    cablesGroup.add(tubeA);

    // Cable B: Enclosure (-16, 1.4, 4.0) -> down pole, along trench, up Gantry to Cam B (0, 5.25, 0)
    const curveB = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-16, 1.3, 4.0),
      new THREE.Vector3(-16, 0.1, 3.8),
      new THREE.Vector3(-8, 0.1, 3.2),
      new THREE.Vector3(0, 0.1, 2.8),
      new THREE.Vector3(0, 3.0, 2.8),
      new THREE.Vector3(0, 5.4, 1.5),
      new THREE.Vector3(0, 5.3, 0.2),
    ]);
    const tubeBGeo = new THREE.TubeGeometry(curveB, 40, 0.025, 8, false);
    const tubeB = new THREE.Mesh(tubeBGeo, cableMat);
    cablesGroup.add(tubeB);

    // Data packets (particles traveling along cables)
    [curveA, curveB].forEach((curve, idx) => {
      const pointsCount = 12;
      const positions = new Float32Array(pointsCount * 3);
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const pMat = new THREE.PointsMaterial({
        color: idx === 0 ? 0x00f0ff : 0x10b981,
        size: 0.15,
        transparent: true,
        opacity: 0.9,
      });
      const points = new THREE.Points(pGeo, pMat);
      (points as any).userData = { curve, speed: 0.12 + idx * 0.05, offset: 0 };
      cablesGroup.add(points);
      pulseParticlesRef.current.push(points);
    });

    scene.add(cablesGroup);

    // 14. 3D Industrial Multi-Axle Truck Model
    const truckGroup = new THREE.Group();
    truckGroupRef.current = truckGroup;
    truckGroup.name = "truck";
    (truckGroup as any).userData = { id: "truck", label: "Commercial Cargo Truck (Plate: MH04AB1234)" };
    interactableObjectsRef.current.push(truckGroup);

    // Truck Cab
    const cabGeo = new THREE.BoxGeometry(2.5, 2.4, 2.3);
    const cabMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.4 });
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.set(5.5, 1.8, 0);
    cab.castShadow = true;
    truckGroup.add(cab);

    // Windshield glass
    const glassGeo = new THREE.BoxGeometry(0.1, 0.8, 2.1);
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.1, metalness: 0.9 });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(6.76, 2.2, 0);
    truckGroup.add(glass);

    // Front License Plate (MH04AB1234)
    const plateGeo = new THREE.PlaneGeometry(0.8, 0.22);
    const plateCanvas = document.createElement("canvas");
    plateCanvas.width = 256;
    plateCanvas.height = 64;
    const ctx = plateCanvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 256, 64);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, 252, 60);
      ctx.fillStyle = "#000000";
      ctx.font = "bold 32px monospace";
      ctx.textAlign = "center";
      ctx.fillText("MH04AB1234", 128, 44);
    }
    const plateTexture = new THREE.CanvasTexture(plateCanvas);
    const plateMat = new THREE.MeshBasicMaterial({ map: plateTexture });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.rotation.y = Math.PI / 2;
    plate.position.set(6.8, 0.95, 0);
    truckGroup.add(plate);

    // Chassis frame
    const chassisGeo = new THREE.BoxGeometry(11, 0.35, 2.0);
    const chassisMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.4 });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.set(0.8, 0.8, 0);
    chassis.castShadow = true;
    truckGroup.add(chassis);

    // Cargo Container (Large box)
    const cargoGeo = new THREE.BoxGeometry(8.2, 2.6, 2.4);
    const cargoMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.5,
      metalness: 0.2,
    });
    const cargo = new THREE.Mesh(cargoGeo, cargoMat);
    cargo.position.set(-0.6, 2.3, 0);
    cargo.castShadow = true;
    truckGroup.add(cargo);

    // VOS Vision Logo on Cargo Side
    const sideBannerGeo = new THREE.PlaneGeometry(3.5, 1.2);
    const bannerCanvas = document.createElement("canvas");
    bannerCanvas.width = 512;
    bannerCanvas.height = 160;
    const bCtx = bannerCanvas.getContext("2d");
    if (bCtx) {
      bCtx.fillStyle = "#0f172a";
      bCtx.fillRect(0, 0, 512, 160);
      bCtx.fillStyle = "#00f0ff";
      bCtx.font = "bold 44px sans-serif";
      bCtx.fillText("VOS VISION", 30, 75);
      bCtx.fillStyle = "#94a3b8";
      bCtx.font = "24px sans-serif";
      bCtx.fillText("AI WEIGHBRIDGE MONITORING", 30, 115);
    }
    const bannerTex = new THREE.CanvasTexture(bannerCanvas);
    const bannerMat = new THREE.MeshBasicMaterial({ map: bannerTex });
    const bannerLeft = new THREE.Mesh(sideBannerGeo, bannerMat);
    bannerLeft.position.set(-0.6, 2.3, 1.22);
    truckGroup.add(bannerLeft);

    // Wheels (Steering front axle + dual rear tandem axles)
    const wheelGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.35, 20);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });

    const wheelPositions = [
      [5.5, 0.48, 1.05],
      [5.5, 0.48, -1.05],
      [-2.8, 0.48, 1.05],
      [-2.8, 0.48, -1.05],
      [-4.0, 0.48, 1.05],
      [-4.0, 0.48, -1.05],
    ];

    wheelPositions.forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(wx, wy, wz);
      wheel.castShadow = true;
      truckGroup.add(wheel);

      // Hub rim
      const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.36, 12);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.set(wx, wy, wz);
      truckGroup.add(rim);
    });

    // Initial position: start back on approach road
    truckGroup.position.set(-28, 0, 0);
    scene.add(truckGroup);

    // 15. Raycaster for Component Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactableObjectsRef.current, true);

      if (intersects.length > 0) {
        // Find topmost named parent group
        let obj: THREE.Object3D | null = intersects[0].object;
        let matchedLabel = null;
        while (obj && obj !== scene) {
          if ((obj as any).userData && (obj as any).userData.label) {
            matchedLabel = (obj as any).userData.label;
            break;
          }
          obj = obj.parent;
        }
        setHoveredName(matchedLabel);
        renderer.domElement.style.cursor = matchedLabel ? "pointer" : "default";
      } else {
        setHoveredName(null);
        renderer.domElement.style.cursor = "default";
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactableObjectsRef.current, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && obj !== scene) {
          if ((obj as any).userData && (obj as any).userData.id) {
            onSelectComponent((obj as any).userData.id);
            break;
          }
          obj = obj.parent;
        }
      }
    };

    renderer.domElement.addEventListener("mousemove", handlePointerMove);
    renderer.domElement.addEventListener("click", handleClick);

    // 16. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Animate cable pulse particles
      pulseParticlesRef.current.forEach((points) => {
        const u = (points as any).userData;
        if (!u.curve) return;
        u.offset = (u.offset + delta * u.speed) % 1;

        const posAttr = points.geometry.attributes.position as THREE.BufferAttribute;
        const count = posAttr.count;
        for (let i = 0; i < count; i++) {
          const t = (u.offset + i / count) % 1;
          const pt = u.curve.getPoint(t);
          posAttr.setXYZ(i, pt.x, pt.y, pt.z);
        }
        posAttr.needsUpdate = true;
      });

      // Subtle pulse on polygon loop color
      if (polygonMeshRef.current) {
        const mat = polygonMeshRef.current.material as THREE.LineBasicMaterial;
        mat.opacity = 0.6 + 0.4 * Math.sin(elapsed * 3);
      }

      // Smooth camera transition if controls active
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // 17. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("mousemove", handlePointerMove);
      renderer.domElement.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Truck Position based on truckProgress (0 to 1)
  // Map progress: 0 = X: -28 (Entry lane), 0.5 = X: 0 (Dead center on 18m weighbridge), 1.0 = X: +28 (Exit)
  useEffect(() => {
    if (!truckGroupRef.current) return;
    const startX = -28;
    const endX = 28;
    const currentX = startX + truckProgress * (endX - startX);
    truckGroupRef.current.position.x = currentX;

    // Change polygon color if truck is inside the 18m weighbridge bounds (-8 to +8)
    if (polygonMeshRef.current) {
      const isInside = currentX >= -6 && currentX <= 6;
      const mat = polygonMeshRef.current.material as THREE.LineBasicMaterial;
      mat.color.setHex(isInside ? 0x10b981 : 0xf59e0b); // Green if centered, Amber if transitioning
    }
  }, [truckProgress]);

  // Toggle Visibility of Frustums & Cables
  useEffect(() => {
    if (frustumGroupRef.current) {
      frustumGroupRef.current.visible = showFrustums;
    }
  }, [showFrustums]);

  useEffect(() => {
    if (cablesGroupRef.current) {
      cablesGroupRef.current.visible = showCables;
    }
  }, [showCables]);

  // Handle Camera Presets
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    switch (viewPreset) {
      case "overview":
        cam.position.set(-24, 16, 26);
        ctrl.target.set(0, 2, 0);
        break;
      case "cam-a":
        // View from Cam A Entry perspective
        cam.position.set(-16, 4.0, 3.2);
        ctrl.target.set(-10, 1.5, 0);
        break;
      case "cam-b":
        // View directly top-down from Cam B gantry
        cam.position.set(0, 22, 0.1);
        ctrl.target.set(0, 0.5, 0);
        break;
      case "enclosure":
        // Close-up on the IP65 control box
        cam.position.set(-14.5, 2.0, 4.8);
        ctrl.target.set(-16, 1.5, 4.05);
        break;
      case "weighbridge":
        // Platform level view
        cam.position.set(-12, 3.5, 6);
        ctrl.target.set(0, 1, 0);
        break;
    }
    ctrl.update();
  }, [viewPreset]);

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden rounded-2xl border border-surfaceBorder bg-background">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Floating Hover Indicator */}
      {hoveredName && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/40 text-cyan-300 text-xs font-mono tracking-wide shadow-lg shadow-cyan-950/50 backdrop-blur-md flex items-center gap-2">
          <Focus className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Click to inspect: {hoveredName}</span>
        </div>
      )}

      {/* View Presets Bar (Top Right) */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-xl text-xs">
        <span className="px-2 text-slate-400 font-mono text-[11px] hidden sm:inline">PRESET:</span>
        <button
          onClick={() => onSetViewPreset("overview")}
          className={`px-2.5 py-1 rounded-lg transition-all ${
            viewPreset === "overview"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          Site Overview
        </button>
        <button
          onClick={() => onSetViewPreset("cam-a")}
          className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
            viewPreset === "cam-a"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Video className="w-3 h-3 text-cyan-400" /> Cam A (Entry)
        </button>
        <button
          onClick={() => onSetViewPreset("cam-b")}
          className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
            viewPreset === "cam-b"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          <Eye className="w-3 h-3 text-emerald-400" /> Cam B (Top-Down)
        </button>
        <button
          onClick={() => onSetViewPreset("enclosure")}
          className={`px-2.5 py-1 rounded-lg transition-all ${
            viewPreset === "enclosure"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          }`}
        >
          Enclosure (Pi 5)
        </button>
      </div>

      {/* Layer Toggles (Bottom Left) */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/85 border border-slate-800 backdrop-blur-md shadow-xl text-xs">
        <span className="px-2 text-slate-400 font-mono text-[11px] flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" /> LAYERS:
        </span>
        <button
          onClick={onToggleFrustums}
          className={`px-2.5 py-1 rounded-lg transition-all text-xs ${
            showFrustums
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium"
              : "text-slate-500 bg-slate-800/40 line-through"
          }`}
        >
          FOV Frustums
        </button>
        <button
          onClick={onToggleCables}
          className={`px-2.5 py-1 rounded-lg transition-all text-xs ${
            showCables
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium"
              : "text-slate-500 bg-slate-800/40 line-through"
          }`}
        >
          Cat6 Cabling
        </button>
      </div>

      {/* Truck Animation & Weighment Simulation Bar (Bottom Right) */}
      <div className="absolute bottom-4 right-4 flex items-center gap-3 p-2 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-2xl text-xs">
        <button
          onClick={onToggleSimulate}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
            isSimulating
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-pulse"
              : "bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-semibold shadow-lg shadow-cyan-500/20"
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {isSimulating ? "Pause Weighment" : "Run Weighment Cycle"}
        </button>
        <button
          onClick={onResetSimulate}
          title="Reset Truck to Approach Road"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Progress scrub bar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <span className="text-slate-400 font-mono text-[10px]">PROGRESS:</span>
          <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-75"
              style={{ width: `${truckProgress * 100}%` }}
            />
          </div>
          <span className="font-mono text-cyan-400 text-[11px] w-8">
            {Math.round(truckProgress * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
