"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";

const PAGE_BG = 0x0b1220;

const STATIONS = [
  { x: -24, color: 0x3b82f6, label: "01 · APPLY" },
  { x: -15.5, color: 0x06b6d4, label: "02 · INTERVIEW" },
  { x: -7, color: 0xf59e0b, label: "03 · OFFER" },
  { x: 1.5, color: 0x34d399, label: "04 · BUILD" },
  { x: 10, color: 0xfbbf24, label: "05 · FIELD" },
  { x: 18.5, color: 0x8b5cf6, label: "06 · CAPSTONE" },
  { x: 27, color: 0x0ea5e9, label: "07 · ALUMNI" },
];

const PATH_KEYS = [
  { p: 0, x: -26 },
  { p: 0.071, x: -24 },
  { p: 0.214, x: -15.5 },
  { p: 0.357, x: -7 },
  { p: 0.5, x: 1.5 },
  { p: 0.643, x: 10 },
  { p: 0.786, x: 18.5 },
  { p: 0.929, x: 27 },
  { p: 1, x: 29 },
];

const CAMERA_SHOTS = [
  { x: -4.4, y: 3.0, z: 8.3, lookX: 0.2, lookY: 1.6 },
  { x: -3.0, y: 2.8, z: 7.2, lookX: -0.3, lookY: 1.3 },
  { x: -3.4, y: 2.9, z: 7.4, lookX: 0, lookY: 1.4 },
  { x: -3.2, y: 3.0, z: 7.6, lookX: -0.6, lookY: 1.5 },
  { x: -4.3, y: 3.3, z: 8.6, lookX: 0.1, lookY: 1.2 },
  { x: -3.6, y: 2.6, z: 7.0, lookX: 0.1, lookY: 1.55 },
  { x: -4.6, y: 3.1, z: 8.4, lookX: 0.3, lookY: 1.3 },
];

const STATION_PROCESS = [
  {
    title: "01 · APPLY",
    color: "#3B82F6",
    steps: ["Register interest", "Choose a track", "Attend induction"],
    offset: { x: -2.0, y: 2.05, z: 0.4 },
  },
  {
    title: "02 · INTERVIEW",
    color: "#06B6D4",
    steps: ["Intro & goals", "Portfolio / track fit", "Next steps"],
    offset: { x: 0, y: 2.65, z: 0.6 },
  },
  {
    title: "03 · OFFER",
    color: "#F59E0B",
    steps: ["Written offer", "Review cohort terms", "Accept and join"],
    offset: { x: 2.0, y: 2.6, z: 0.4 },
  },
  {
    title: "04 · LEARN & BUILD",
    color: "#34D399",
    steps: ["Live brief", "Weekly mentor review", "Ship the deliverable"],
    offset: { x: 2.2, y: 2.65, z: 0.4 },
  },
  {
    title: "05 · DSN FIELD",
    color: "#FBBF24",
    steps: ["Listen to community", "Serve with a project", "Document the outcome"],
    offset: { x: 0, y: 2.8, z: 0.4 },
  },
  {
    title: "06 · CAPSTONE",
    color: "#8B5CF6",
    steps: ["Build the capstone", "Present at demo day", "Plan the next step"],
    offset: { x: 2.4, y: 2.4, z: 0.4 },
  },
  {
    title: "07 · ALUMNI",
    color: "#0EA5E9",
    steps: ["Portfolio and references", "Next-step support", "Alumni network"],
    offset: { x: 2.6, y: 2.5, z: 0.4 },
  },
];

type PersonParts = {
  group: THREE.Group;
  leftUpperArm: THREE.Group;
  leftLowerArm: THREE.Group;
  rightUpperArm: THREE.Group;
  rightLowerArm: THREE.Group;
  leftUpperLeg: THREE.Group;
  leftLowerLeg: THREE.Group;
  rightUpperLeg: THREE.Group;
  rightLowerLeg: THREE.Group;
  backpack: THREE.Group;
  clipboard: THREE.Mesh;
};

function material(
  color: number,
  options: Partial<THREE.MeshStandardMaterialParameters> = {},
) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.78,
    metalness: 0.05,
    ...options,
  });
}

function addBox(
  parent: THREE.Object3D,
  width: number,
  height: number,
  depth: number,
  color: number,
  x: number,
  y: number,
  z: number,
  options?: Partial<THREE.MeshStandardMaterialParameters>,
) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    material(color, options),
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addCylinder(
  parent: THREE.Object3D,
  radius: number,
  height: number,
  color: number,
  x: number,
  y: number,
  z: number,
) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, height, 12),
    material(color),
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addCone(
  parent: THREE.Object3D,
  radius: number,
  height: number,
  color: number,
  x: number,
  y: number,
  z: number,
) {
  const mesh = new THREE.Mesh(
    new THREE.ConeGeometry(radius, height, 10),
    material(color),
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addSphere(
  parent: THREE.Object3D,
  radius: number,
  color: number,
  x: number,
  y: number,
  z: number,
) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 14, 10),
    material(color),
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function createTextPlane(
  text: string,
  color: string,
  width = 2,
  height = 0.5,
) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext("2d");

  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = "700 56px ui-monospace, SFMono-Regular, Menlo, monospace";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = color;
    context.fillText(text, canvas.width / 2, canvas.height / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  return new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    }),
  );
}

function createCallout(index: number) {
  const stage = STATION_PROCESS[index];
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 320;
  const context = canvas.getContext("2d");

  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(8,15,28,0.98)";
    context.beginPath();
    context.roundRect(8, 8, 624, 304, 24);
    context.fill();
    context.strokeStyle = stage.color;
    context.globalAlpha = 0.65;
    context.lineWidth = 3;
    context.stroke();
    context.globalAlpha = 1;

    context.fillStyle = stage.color;
    context.beginPath();
    context.roundRect(28, 28, 6, 264, 3);
    context.fill();

    context.font = "700 34px ui-monospace, SFMono-Regular, Menlo, monospace";
    context.textBaseline = "middle";
    context.fillStyle = "#f7f9fc";
    context.fillText(stage.title, 56, 58);

    context.font = "500 17px ui-monospace, SFMono-Regular, Menlo, monospace";
    context.fillStyle = "#7889a0";
    context.fillText("PROCESS", 512, 58);

    stage.steps.forEach((step, stepIndex) => {
      const centerY = 116 + stepIndex * 58;
      context.fillStyle = stage.color;
      context.beginPath();
      context.arc(62, centerY, 14, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = "#07101d";
      context.font = "700 16px ui-monospace, SFMono-Regular, Menlo, monospace";
      context.textAlign = "center";
      context.fillText(String(stepIndex + 1), 62, centerY + 1);
      context.textAlign = "left";

      context.fillStyle = "#d8e2f0";
      context.font = "500 24px ui-sans-serif, system-ui, sans-serif";
      context.fillText(step, 92, centerY + 1);
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
    }),
  );
  sprite.scale.set(2.4, 1.2, 1);
  sprite.visible = false;
  sprite.renderOrder = 5;

  return sprite;
}

function addSign(
  parent: THREE.Object3D,
  text: string,
  width: number,
  height: number,
  x: number,
  y: number,
  z: number,
  color = "#f7f9fc",
) {
  addBox(parent, width + 0.16, height + 0.1, 0.06, 0x0f172a, x, y, z);
  const label = createTextPlane(text, color, width, height);
  label.position.set(x, y, z + 0.035);
  parent.add(label);
}

function createPerson(
  shirt: number,
  options: {
    skin?: number;
    pants?: number;
    hair?: number;
    seated?: boolean;
    shadow?: boolean;
  } = {},
): PersonParts {
  const skin = options.skin ?? 0xc98b5e;
  const pants = options.pants ?? 0x1e293b;
  const hair = options.hair ?? 0x141a24;

  const group = new THREE.Group();

  const hips = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.17, 0.18, 4, 8),
    material(pants),
  );
  hips.position.y = 0.88;
  group.add(hips);

  const torso = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.22, 0.42, 5, 12),
    material(shirt),
  );
  torso.position.y = 1.28;
  group.add(torso);

  addSphere(group, 0.1, shirt, -0.27, 1.49, 0);
  addSphere(group, 0.1, shirt, 0.27, 1.49, 0);

  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.085, 0.14, 10),
    material(skin),
  );
  neck.position.y = 1.69;
  group.add(neck);

  addBox(group, 0.3, 0.05, 0.2, 0x0f2a52, 0, 1.63, 0.01);

  const head = addSphere(group, 0.21, skin, 0, 1.86, 0);
  head.castShadow = Boolean(options.shadow);

  addSphere(group, 0.04, skin, -0.205, 1.85, 0);
  addSphere(group, 0.04, skin, 0.205, 1.85, 0);
  addSphere(group, 0.026, skin, 0, 1.83, 0.205);

  const hairMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.218, 16, 10, 0, Math.PI * 2, 0, Math.PI / 1.8),
    material(hair, { roughness: 0.95 }),
  );
  hairMesh.position.y = 1.88;
  group.add(hairMesh);

  addSphere(group, 0.026, 0x111827, -0.072, 1.88, 0.19);
  addSphere(group, 0.026, 0x111827, 0.072, 1.88, 0.19);
  const leftBrow = addBox(group, 0.07, 0.014, 0.012, hair, -0.07, 1.94, 0.196);
  const rightBrow = addBox(group, 0.07, 0.014, 0.012, hair, 0.07, 1.94, 0.196);
  leftBrow.rotation.z = -0.08;
  rightBrow.rotation.z = 0.08;

  const leftStrap = addBox(group, 0.016, 0.26, 0.012, 0x0b1a33, -0.07, 1.53, 0.185);
  const rightStrap = addBox(group, 0.016, 0.26, 0.012, 0x0b1a33, 0.07, 1.53, 0.185);
  leftStrap.rotation.z = 0.18;
  rightStrap.rotation.z = -0.18;
  addBox(group, 0.12, 0.16, 0.022, 0xf8fafc, 0, 1.31, 0.2);
  addBox(group, 0.08, 0.02, 0.024, 0x0e7490, 0, 1.36, 0.212);

  const buildArm = (side: -1 | 1) => {
    const upper = new THREE.Group();
    upper.position.set(side * 0.31, 1.49, 0);
    const upperMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.062, 0.24, 4, 8),
      material(shirt),
    );
    upperMesh.position.y = -0.15;
    upper.add(upperMesh);

    const lower = new THREE.Group();
    lower.position.y = -0.33;
    upper.add(lower);
    const lowerMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.055, 0.22, 4, 8),
      material(shirt),
    );
    lowerMesh.position.y = -0.13;
    lower.add(lowerMesh);
    addSphere(lower, 0.06, skin, 0, -0.29, 0.01);

    group.add(upper);
    return { upper, lower };
  };

  const leftArm = buildArm(-1);
  const rightArm = buildArm(1);

  const buildLeg = (side: -1 | 1) => {
    const upper = new THREE.Group();
    upper.position.set(side * 0.11, 0.88, 0);
    const upperMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.075, 0.24, 4, 8),
      material(pants),
    );
    upperMesh.position.y = -0.16;
    upper.add(upperMesh);

    const lower = new THREE.Group();
    lower.position.y = -0.34;
    upper.add(lower);
    const lowerMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.065, 0.22, 4, 8),
      material(pants),
    );
    lowerMesh.position.y = -0.15;
    lower.add(lowerMesh);
    addBox(lower, 0.16, 0.09, 0.26, 0x111827, 0, -0.32, 0.06);

    group.add(upper);
    return { upper, lower };
  };

  const leftLeg = buildLeg(-1);
  const rightLeg = buildLeg(1);

  const backpack = new THREE.Group();
  addBox(backpack, 0.34, 0.42, 0.16, 0x1e3a5f, 0, 1.24, -0.26);
  addBox(backpack, 0.2, 0.18, 0.04, 0x0f2a52, 0, 1.1, -0.35);
  backpack.visible = false;
  group.add(backpack);

  const clipboard = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.3, 0.02),
    material(0xd6a56a, { roughness: 0.9 }),
  );
  clipboard.position.set(0, -0.36, 0.06);
  clipboard.rotation.x = -0.35;
  clipboard.visible = false;
  leftArm.lower.add(clipboard);

  if (options.seated) {
    group.position.y = -0.16;
    leftLeg.upper.rotation.x = -1.2;
    rightLeg.upper.rotation.x = -1.2;
    leftLeg.lower.rotation.x = 1.3;
    rightLeg.lower.rotation.x = 1.3;
    leftArm.upper.rotation.x = -0.55;
    rightArm.upper.rotation.x = -0.55;
    leftArm.lower.rotation.x = -0.95;
    rightArm.lower.rotation.x = -0.95;
    leftArm.upper.rotation.z = 0.12;
    rightArm.upper.rotation.z = -0.12;
  }

  if (options.shadow) {
    group.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
  }

  return {
    group,
    leftUpperArm: leftArm.upper,
    leftLowerArm: leftArm.lower,
    rightUpperArm: rightArm.upper,
    rightLowerArm: rightArm.lower,
    leftUpperLeg: leftLeg.upper,
    leftLowerLeg: leftLeg.lower,
    rightUpperLeg: rightLeg.upper,
    rightLowerLeg: rightLeg.lower,
    backpack,
    clipboard,
  };
}

function pathX(progress: number) {
  for (let index = 1; index < PATH_KEYS.length; index += 1) {
    const previous = PATH_KEYS[index - 1];
    const next = PATH_KEYS[index];

    if (progress <= next.p) {
      const t = (progress - previous.p) / (next.p - previous.p);
      return THREE.MathUtils.lerp(previous.x, next.x, THREE.MathUtils.clamp(t, 0, 1));
    }
  }

  return PATH_KEYS[PATH_KEYS.length - 1].x;
}

function damp(current: number, target: number, lambda: number, delta: number) {
  const dt = Number.isFinite(delta)
    ? THREE.MathUtils.clamp(delta, 0, 1 / 15)
    : 0;
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));
}

function dampAngle(current: number, target: number, lambda: number, delta: number) {
  const difference = Math.atan2(
    Math.sin(target - current),
    Math.cos(target - current),
  );
  return current + difference * (1 - Math.exp(-lambda * delta));
}

function addStationMarkers(scene: THREE.Scene) {
  const pathGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-28, 0.02, 0),
    new THREE.Vector3(31, 0.02, 0),
  ]);
  scene.add(
    new THREE.Line(
      pathGeometry,
      new THREE.LineBasicMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.5,
      }),
    ),
  );

  for (const station of STATIONS) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.55, 0.62, 36),
      new THREE.MeshBasicMaterial({
        color: station.color,
        transparent: true,
        opacity: 0.62,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(station.x, 0.03, 0);
    scene.add(ring);
  }
}

function buildApplyStation() {
  const group = new THREE.Group();
  group.position.x = STATIONS[0].x;

  addBox(group, 0.22, 2.8, 0.22, 0x1e3a8a, -1.15, 1.4, 0);
  addBox(group, 0.22, 2.8, 0.22, 0x1e3a8a, 1.15, 1.4, 0);
  addBox(group, 2.52, 0.22, 0.28, 0x3b82f6, 0, 2.72, 0, {
    emissive: 0x1d4ed8,
    emissiveIntensity: 0.6,
  });
  addBox(group, 0.34, 0.7, 0.02, 0x68fcbf, -0.62, 2.1, 0.16, {
    emissive: 0x34d399,
    emissiveIntensity: 0.4,
  });
  addBox(group, 0.34, 0.7, 0.02, 0x91b4ff, 0, 2.1, 0.16, {
    emissive: 0x3b82f6,
    emissiveIntensity: 0.4,
  });
  addBox(group, 0.34, 0.7, 0.02, 0x8b5cf6, 0.62, 2.1, 0.16, {
    emissive: 0x8b5cf6,
    emissiveIntensity: 0.4,
  });

  addBox(group, 1.2, 0.8, 0.7, 0x16233a, 2.2, 0.4, -0.6);
  addBox(group, 1.3, 0.08, 0.8, 0x233047, 2.2, 0.84, -0.6);
  addBox(group, 0.42, 0.28, 0.04, 0x91b4ff, 2.2, 1.0, -0.32, {
    emissive: 0x3b82f6,
    emissiveIntensity: 0.35,
  });
  addBox(group, 0.34, 0.02, 0.46, 0xf8fafc, 1.85, 0.89, -0.48);
  addBox(group, 0.26, 0.015, 0.36, 0xe2e8f0, 1.86, 0.905, -0.46);

  addSign(group, "KAVI FELLOWSHIP", 2.3, 0.44, 0, 3.25, 0.02, "#c7d2e5");

  return group;
}

function buildInterviewStation() {
  const group = new THREE.Group();
  group.position.x = STATIONS[1].x;

  addBox(group, 3.2, 0.12, 1.2, 0x233047, 0, 0.92, -1.0);
  addBox(group, 0.12, 0.9, 0.9, 0x1a2638, -1.4, 0.46, -1.0);
  addBox(group, 0.12, 0.9, 0.9, 0x1a2638, 1.4, 0.46, -1.0);

  const first = createPerson(0x34d399, { seated: true });
  first.group.position.set(-0.8, -0.1, -1.9);
  group.add(first.group);

  const second = createPerson(0x8b5cf6, {
    seated: true,
    skin: 0xa86f4c,
    hair: 0x0f172a,
  });
  second.group.position.set(0.8, -0.1, -1.9);
  group.add(second.group);

  addBox(group, 0.5, 0.06, 0.34, 0x0f172a, -0.8, 1.05, -1.1);
  addBox(group, 0.5, 0.06, 0.34, 0x0f172a, 0.8, 1.05, -1.1);
  addBox(group, 0.44, 0.28, 0.03, 0x3b82f6, -0.8, 1.2, -1.1, {
    emissive: 0x1d4ed8,
    emissiveIntensity: 0.45,
  });
  addBox(group, 0.44, 0.28, 0.03, 0x06b6d4, 0.8, 1.2, -1.1, {
    emissive: 0x0891b2,
    emissiveIntensity: 0.45,
  });

  addBox(group, 0.55, 0.1, 0.55, 0x1a2638, -0.8, 0.35, -2.1);
  addBox(group, 0.55, 0.1, 0.55, 0x1a2638, 0.8, 0.35, -2.1);

  addBox(group, 0.4, 0.02, 0.5, 0xf8fafc, -0.15, 1.005, -0.92);
  addCylinder(group, 0.05, 0.1, 0xe2e8f0, 1.3, 1.04, -0.72);
  addCylinder(group, 0.05, 0.1, 0xe2e8f0, -1.25, 1.04, -0.72);

  return group;
}

function buildOfferStation() {
  const group = new THREE.Group();
  group.position.x = STATIONS[2].x;

  addBox(group, 2.4, 0.12, 1.0, 0x233047, 0, 0.92, -0.8);
  addBox(group, 0.12, 0.9, 0.8, 0x1a2638, -1.05, 0.46, -0.8);
  addBox(group, 0.12, 0.9, 0.8, 0x1a2638, 1.05, 0.46, -0.8);

  addBox(group, 0.58, 0.025, 0.4, 0xf8fafc, -0.15, 1.0, -0.78);
  addBox(group, 0.48, 0.02, 0.3, 0xe2e8f0, -0.12, 1.02, -0.76);
  addBox(group, 0.03, 0.03, 0.24, 0x0f172a, 0.38, 1.01, -0.7);

  const lead = createPerson(0x0ea5e9, {
    seated: true,
    skin: 0xa86f4c,
    hair: 0x1f2937,
  });
  lead.group.position.set(0, -0.1, -1.9);
  group.add(lead.group);

  addSign(group, "OFFER", 1.5, 0.36, 0, 2.4, -2.2, "#fde68a");

  return group;
}

function buildLearnStation() {
  const group = new THREE.Group();
  group.position.x = STATIONS[2].x;

  addBox(group, 3.6, 1.9, 0.12, 0x0c1b33, 0, 1.85, -2.5, {
    emissive: 0x0b2a4a,
    emissiveIntensity: 0.4,
  });
  addBox(group, 3.4, 0.04, 0.03, 0x91b4ff, 0, 2.55, -2.42, {
    emissive: 0x3b82f6,
    emissiveIntensity: 0.6,
  });

  const codeColors = [0x3b82f6, 0x34d399, 0x91b4ff, 0x8b5cf6, 0x06b6d4];
  for (let index = 0; index < 5; index += 1) {
    addBox(
      group,
      1.2 - index * 0.14,
      0.045,
      0.02,
      codeColors[index],
      -0.7 + index * 0.08,
      2.25 - index * 0.22,
      -2.41,
      { emissive: codeColors[index], emissiveIntensity: 0.35 },
    );
  }

  addBox(group, 0.2, 0.2, 0.02, 0xfbbf24, 1.15, 2.25, -2.39);
  addBox(group, 0.18, 0.18, 0.02, 0x34d399, 1.3, 2.05, -2.39);
  addBox(group, 0.16, 0.16, 0.02, 0xec4899, 1.05, 1.95, -2.39);

  addBox(group, 2.4, 0.1, 0.9, 0x233047, 0, 0.95, -0.85);
  addBox(group, 0.65, 0.06, 0.42, 0x0f172a, -0.55, 1.04, -0.9);
  addBox(group, 0.55, 0.3, 0.03, 0x06b6d4, -0.55, 1.2, -0.9, {
    emissive: 0x0891b2,
    emissiveIntensity: 0.5,
  });
  addBox(group, 0.5, 0.035, 0.16, 0x0f172a, -0.1, 1.02, -0.72);
  addCylinder(group, 0.05, 0.1, 0xe2e8f0, 0.55, 1.04, -0.75);

  addSign(group, "LIVE PROJECT", 1.7, 0.34, 0, 2.9, -2.4, "#c7d2e5");

  const mentor = createPerson(0x06b6d4, {
    skin: 0xa86f4c,
    hair: 0x1f2937,
  });
  mentor.group.position.set(1.55, 0, -0.55);
  mentor.group.rotation.y = 0.4;
  group.add(mentor.group);

  return group;
}

function buildFieldStation() {
  const group = new THREE.Group();
  group.position.x = STATIONS[3].x;

  for (const [x, z, height] of [
    [-1.8, -1.6, 2.1],
    [1.6, -1.9, 1.6],
    [2.5, 0.4, 1.2],
  ]) {
    addCylinder(group, 0.13, height * 0.45, 0x7c5a3a, x, height * 0.22, z);
    addCone(group, height * 0.5, height * 0.7, 0x1f6f4a, x, height * 0.65, z);
  }

  addBox(group, 1.9, 1.2, 1.4, 0xb98b5e, 3.1, 0.6, -1.9);
  addCone(group, 1.5, 0.9, 0x8a5a3a, 3.1, 1.55, -1.9);

  const first = createPerson(0xf59e0b, {
    skin: 0x8d5a3b,
    pants: 0x334155,
    hair: 0x0f172a,
  });
  first.group.position.set(-0.9, 0, 0.7);
  first.group.rotation.y = -0.5;
  group.add(first.group);

  const second = createPerson(0xec4899, {
    skin: 0xa86f4c,
    pants: 0x1f2937,
    hair: 0x111827,
  });
  second.group.position.set(0.95, 0, 0.95);
  second.group.rotation.y = 0.45;
  group.add(second.group);

  addBox(group, 0.7, 0.45, 0.5, 0x8a5a3a, 1.7, 0.22, -0.5);

  addCylinder(group, 0.055, 1.7, 0x7c5a3a, -2.3, 0.85, -0.45);
  addSign(group, "DSN FIELD", 1.35, 0.3, -2.3, 1.85, -0.45, "#c7d2e5");

  for (let index = 0; index < 6; index += 1) {
    addCone(
      group,
      0.18,
      0.42,
      index % 2 === 0 ? 0x2f855a : 0x3f9c6a,
      -1.8 + index * 0.5,
      0.21,
      -2.55,
    );
  }

  addCylinder(group, 0.16, 0.34, 0x475569, 1.9, 0.17, -0.2);

  return group;
}

function buildCapstoneStation() {
  const group = new THREE.Group();
  group.position.x = STATIONS[4].x;

  addBox(group, 3.2, 0.26, 2.0, 0x1a2638, 0, 0.13, 0);
  addBox(group, 3.25, 0.04, 2.05, 0x8b5cf6, 0, 0.27, 0, {
    emissive: 0x7c3aed,
    emissiveIntensity: 0.55,
  });

  addBox(group, 0.16, 2.3, 0.16, 0x1e3a8a, -1.5, 1.25, -1.6);
  addBox(group, 0.16, 2.3, 0.16, 0x1e3a8a, 1.5, 1.25, -1.6);
  const arch = new THREE.Mesh(
    new THREE.TorusGeometry(1.5, 0.08, 8, 40, Math.PI),
    new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.8,
    }),
  );
  arch.position.set(0, 2.4, -1.6);
  group.add(arch);

  addBox(group, 2.2, 1.1, 0.12, 0x101827, 0, 1.2, -1.7);
  addBox(group, 2.0, 0.04, 0.02, 0x68fcbf, 0, 1.6, -1.62, {
    emissive: 0x34d399,
    emissiveIntensity: 0.7,
  });

  const sign = createTextPlane("DEMO DAY", "#c7d2e5", 1.9, 0.45);
  sign.position.set(0, 1.25, -1.63);
  group.add(sign);
  const signSub = createTextPlane("KAVI FELLOWSHIP", "#91b4ff", 1.75, 0.3);
  signSub.position.set(0, 0.9, -1.63);
  group.add(signSub);

  for (const [x, z, shirt] of [
    [-3.6, -0.4, 0x334155],
    [3.6, -0.4, 0x1e293b],
    [-4.3, -1.6, 0x1f2937],
    [4.3, -1.6, 0x334155],
  ]) {
    const guest = createPerson(shirt, {
      skin: 0xa86f4c,
      pants: 0x0f172a,
    });
    guest.group.position.set(x, 0, z);
    guest.group.rotation.y = x < 0 ? -0.5 : 0.5;
    group.add(guest.group);
  }

  const orbColors = [0x3b82f6, 0x06b6d4, 0x34d399, 0x91b4ff, 0x8b5cf6, 0xfbbf24];
  orbColors.forEach((color, index) => {
    const angle = (index / orbColors.length) * Math.PI;
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 10, 10),
      new THREE.MeshBasicMaterial({ color }),
    );
    orb.position.set(
      Math.cos(angle) * 1.5,
      2.4 + Math.sin(angle) * 1.5,
      -1.55,
    );
    group.add(orb);
  });

  addBox(group, 0.55, 0.5, 0.45, 0x1a2638, -2.5, 0.25, -0.9);
  addCylinder(group, 0.16, 0.08, 0xfbbf24, -2.5, 0.54, -0.9);
  addCylinder(group, 0.045, 0.26, 0xd97706, -2.5, 0.7, -0.9);
  const trophyCup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.085, 0.2, 12),
    material(0xfbbf24, { metalness: 0.65, roughness: 0.25 }),
  );
  trophyCup.position.set(-2.5, 0.9, -0.9);
  trophyCup.castShadow = true;
  group.add(trophyCup);

  return group;
}

function buildAlumniStation() {
  const group = new THREE.Group();
  group.position.x = STATIONS[6].x;

  addBox(group, 2.6, 0.1, 0.8, 0x233047, 0, 0.92, -1.2);
  addBox(group, 0.12, 0.9, 0.65, 0x1a2638, -1.15, 0.46, -1.2);
  addBox(group, 0.12, 0.9, 0.65, 0x1a2638, 1.15, 0.46, -1.2);
  addBox(group, 0.5, 0.03, 0.3, 0x0f172a, -0.55, 1.0, -1.1);
  addBox(group, 0.5, 0.03, 0.3, 0x0f172a, 0.55, 1.0, -1.1);
  addCylinder(group, 0.05, 0.1, 0xe2e8f0, 0, 1.03, -1.0);

  const alumniShirts = [0x2563eb, 0x0ea5e9, 0x8b5cf6];
  for (const [index, shirt] of alumniShirts.entries()) {
    const person = createPerson(shirt, {
      skin: index === 1 ? 0xa86f4c : 0xc98b5e,
      pants: 0x1e293b,
      hair: index === 2 ? 0x111827 : 0x1f2937,
    });
    const x = index === 0 ? -2.2 : index === 1 ? 2.2 : 0;
    const z = index === 2 ? -2.1 : -0.4;
    person.group.position.set(x, 0, z);
    person.group.rotation.y = index === 0 ? 0.5 : index === 1 ? -0.5 : Math.PI;
    group.add(person.group);
  }

  addSign(group, "ALUMNI NETWORK", 2.4, 0.42, 0, 2.55, -2.4, "#bae6fd");

  return group;
}

export default function FellowshipStoryCanvas({
  progress,
  light = false,
  onReady,
  onUnavailable,
  className,
}: {
  progress: MotionValue<number>;
  light?: boolean;
  onReady?: () => void;
  onUnavailable?: () => void;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const probe = document.createElement("canvas");
    const probeContext = probe.getContext("webgl2") || probe.getContext("webgl");
    if (!probeContext) {
      onUnavailable?.();
      return;
    }
    probeContext.getExtension("WEBGL_lose_context")?.loseContext();

    let renderer: THREE.WebGLRenderer;
    const compact = window.matchMedia("(max-width: 767px)").matches;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !compact,
        powerPreference: "high-performance",
      });
    } catch {
      onUnavailable?.();
      return;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, compact ? 1.25 : 1.6),
    );
    renderer.shadowMap.enabled = !compact;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(light ? 0xf1f5f9 : PAGE_BG, 18, 34);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
    const cameraOffset = new THREE.Vector3(-3.6, 3.1, 7.4);
    camera.position.copy(cameraOffset);
    camera.lookAt(0, 1.1, 0.5);

    scene.add(new THREE.AmbientLight(0xa9b8d4, 2.5));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.1);
    keyLight.position.set(5, 9, 7);
    keyLight.castShadow = !compact;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -18;
    keyLight.shadow.camera.right = 18;
    keyLight.shadow.camera.top = 12;
    keyLight.shadow.camera.bottom = -12;
    keyLight.shadow.camera.far = 40;
    keyLight.shadow.bias = -0.0006;
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x3b82f6, 1.7);
    rimLight.position.set(-6, 4, -6);
    scene.add(rimLight);
    const fillLight = new THREE.DirectionalLight(0x68fcbf, 0.7);
    fillLight.position.set(2, 3, 5);
    scene.add(fillLight);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 14),
      material(light ? 0xe2e8f0 : 0x0a101b, { roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(4, 0, 0);
    ground.receiveShadow = true;
    scene.add(ground);
    addStationMarkers(scene);

    const stationGroups = [
      buildApplyStation(),
      buildInterviewStation(),
      buildOfferStation(),
      buildLearnStation(),
      buildFieldStation(),
      buildCapstoneStation(),
      buildAlumniStation(),
    ];
    stationGroups.forEach((group) => scene.add(group));

    for (const [x, radius, height, color] of [
      [-28, 5.5, 3.2, 0x1e4d3a],
      [-18, 4.2, 2.4, 0x235c45],
      [-8, 5.8, 3.4, 0x1d4d3c],
      [2, 4.6, 2.6, 0x245844],
      [12, 5.2, 3.0, 0x1f4f3e],
      [22, 4.8, 2.8, 0x1d4d3c],
      [32, 5.4, 3.1, 0x1f4f3e],
    ]) {
      addCone(scene, radius, height, color, x, height / 2 - 0.2, -10);
    }

    const callouts = STATION_PROCESS.map((stage, index) => {
      const sprite = createCallout(index);
      if (compact) sprite.scale.set(2.0, 1.0, 1);
      sprite.position.set(
        STATIONS[index].x + stage.offset.x,
        stage.offset.y,
        stage.offset.z,
      );
      scene.add(sprite);
      return sprite;
    });

    const hero = createPerson(0x175cd3, { pants: 0x111827, shadow: true });
    hero.group.rotation.y = Math.PI / 2;
    hero.group.position.set(PATH_KEYS[0].x, 0, 0);
    scene.add(hero.group);

    const particles = (() => {
      const count = 260;
      const positions = new Float32Array(count * 3);
      let seed = 90210;
      const random = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
      for (let index = 0; index < count; index += 1) {
        const stride = index * 3;
        positions[stride] = -18 + random() * 34;
        positions[stride + 1] = 1 + random() * 6;
        positions[stride + 2] = -5 + random() * 10;
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const points = new THREE.Points(
        geometry,
        new THREE.PointsMaterial({
          color: light ? 0x1d4ed8 : 0x91b4ff,
          size: 0.035,
          transparent: true,
          opacity: light ? 0.3 : 0.55,
          depthWrite: false,
          blending: light ? THREE.NormalBlending : THREE.AdditiveBlending,
        }),
      );
      scene.add(points);
      return points;
    })();

    let frame = 0;
    let inView = true;
    let contextLost = false;
    let firstFramePainted = false;
    const timer = new THREE.Timer();
    timer.connect(document);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let walkPhase = 0;
    let walkWeight = 0;
    let lookAhead = 1;
    let mobileView = false;
    const characterPosition = new THREE.Vector3(PATH_KEYS[0].x, 0, 0);

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      const aspect = width / height;

      renderer.setSize(width, height, false);
      camera.aspect = aspect;

      const narrow = aspect < 0.9;
      mobileView = narrow;
      lookAhead = narrow ? 0.15 : 1;
      cameraOffset.set(
        narrow ? -4.0 : -3.6,
        narrow ? 3.8 : 3.1,
        narrow ? 9.6 : 7.4,
      );
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? true;
      },
      { threshold: 0.02 },
    );
    intersectionObserver.observe(container);

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      onUnavailable?.();
    };
    renderer.domElement.addEventListener("webglcontextlost", handleContextLost);

    const animate = (timestamp: number) => {
      frame = window.requestAnimationFrame(animate);
      timer.update(timestamp);

      const delta = Math.min(timer.getDelta(), 1 / 30);
      const elapsed = timer.getElapsed();

      if (contextLost || !inView || document.hidden) return;

      const targetX = pathX(
        THREE.MathUtils.clamp(progress.get(), 0, 1),
      );
      const previousX = characterPosition.x;
      characterPosition.x = targetX;
      const moved = Math.abs(characterPosition.x - previousX);
      walkPhase += moved * 22;
      walkWeight = THREE.MathUtils.clamp(
        damp(walkWeight, Math.min(1, moved * 80), 9, delta),
        0,
        1,
      );

      let nearestIndex = -1;
      let nearestDistance = Infinity;
      STATIONS.forEach((station, index) => {
        const distance = Math.abs(characterPosition.x - station.x);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      const stationBlend =
        nearestDistance < 1.35 ? 1 - nearestDistance / 1.35 : 0;
      const walking = Math.min(1, walkWeight + (1 - stationBlend) * 0.3);

      let stationYaw = Math.PI / 2;
      if (stationBlend > 0 && nearestIndex >= 0) {
        stationYaw =
          nearestIndex >= 1 && nearestIndex <= 3 ? Math.PI : 0;
      }
      const targetYaw = THREE.MathUtils.lerp(Math.PI / 2, stationYaw, stationBlend);
      hero.group.rotation.y = dampAngle(
        hero.group.rotation.y,
        targetYaw,
        7,
        delta,
      );

      const targetY =
        nearestIndex === 5 && nearestDistance < 2.1 ? 0.26 : 0;
      const bob = reducedMotion
        ? 0
        : Math.abs(Math.sin(walkPhase)) * 0.035 * walking;
      characterPosition.y = targetY + bob;
      hero.group.position.copy(characterPosition);

      stationGroups.forEach((group, index) => {
        group.visible =
          Math.abs(characterPosition.x - STATIONS[index].x) < 6.2;
      });

      const blend = stationBlend;
      const walkFactor = walking * (1 - stationBlend);
      const swing = Math.sin(walkPhase) * 0.58;

      let leftUpperLegTarget = swing * walkFactor;
      let rightUpperLegTarget = -swing * walkFactor;
      let leftLowerLegTarget =
        Math.max(0, -swing) * 0.95 * walkFactor;
      let rightLowerLegTarget =
        Math.max(0, swing) * 0.95 * walkFactor;

      let leftUpperArmX = -swing * 0.52 * walkFactor;
      let rightUpperArmX = swing * 0.52 * walkFactor;
      let leftLowerArmX = -0.12 - Math.abs(swing) * 0.22 * walkFactor;
      let rightLowerArmX = -0.12 - Math.abs(swing) * 0.22 * walkFactor;
      const leftUpperArmZ = 0;
      let rightUpperArmZ = 0;
      const leftLowerArmZ = 0;
      let rightLowerArmZ = 0;

      if (blend > 0 && nearestIndex >= 0) {
        leftUpperLegTarget = THREE.MathUtils.lerp(leftUpperLegTarget, 0, blend);
        rightUpperLegTarget = THREE.MathUtils.lerp(rightUpperLegTarget, 0, blend);
        leftLowerLegTarget = THREE.MathUtils.lerp(leftLowerLegTarget, 0, blend);
        rightLowerLegTarget = THREE.MathUtils.lerp(rightLowerLegTarget, 0, blend);

        if (nearestIndex === 0) {
          rightUpperArmZ = THREE.MathUtils.lerp(
            rightUpperArmZ,
            2.0 + Math.sin(elapsed * 4) * 0.14,
            blend,
          );
          rightLowerArmZ = THREE.MathUtils.lerp(rightLowerArmZ, 0.25, blend);
          leftUpperArmX = THREE.MathUtils.lerp(leftUpperArmX, 0, blend);
          leftLowerArmX = THREE.MathUtils.lerp(leftLowerArmX, -0.1, blend);
        } else if (nearestIndex === 1) {
          rightUpperArmX = THREE.MathUtils.lerp(rightUpperArmX, -1.05, blend);
          rightLowerArmX = THREE.MathUtils.lerp(rightLowerArmX, -0.55, blend);
          leftUpperArmX = THREE.MathUtils.lerp(leftUpperArmX, -0.35, blend);
          leftLowerArmX = THREE.MathUtils.lerp(leftLowerArmX, -0.5, blend);
        } else if (nearestIndex === 2) {
          rightUpperArmX = THREE.MathUtils.lerp(rightUpperArmX, -0.95, blend);
          rightLowerArmX = THREE.MathUtils.lerp(rightLowerArmX, -0.55, blend);
          leftUpperArmX = THREE.MathUtils.lerp(leftUpperArmX, -0.1, blend);
          leftLowerArmX = THREE.MathUtils.lerp(leftLowerArmX, -0.2, blend);
        } else if (nearestIndex === 3) {
          leftUpperArmX = THREE.MathUtils.lerp(leftUpperArmX, -0.65, blend);
          rightUpperArmX = THREE.MathUtils.lerp(rightUpperArmX, -0.65, blend);
          leftLowerArmX = THREE.MathUtils.lerp(
            leftLowerArmX,
            -0.95 + Math.sin(elapsed * 7) * 0.06,
            blend,
          );
          rightLowerArmX = THREE.MathUtils.lerp(
            rightLowerArmX,
            -0.95 - Math.sin(elapsed * 7) * 0.06,
            blend,
          );
        } else if (nearestIndex === 4) {
          rightUpperArmZ = THREE.MathUtils.lerp(
            rightUpperArmZ,
            2.1 + Math.sin(elapsed * 5) * 0.12,
            blend,
          );
          rightLowerArmZ = THREE.MathUtils.lerp(rightLowerArmZ, 0.42, blend);
          leftUpperArmX = THREE.MathUtils.lerp(leftUpperArmX, -0.5, blend);
          leftLowerArmX = THREE.MathUtils.lerp(leftLowerArmX, -0.7, blend);
        } else if (nearestIndex === 5) {
          rightUpperArmZ = THREE.MathUtils.lerp(rightUpperArmZ, 2.2, blend);
          rightLowerArmZ = THREE.MathUtils.lerp(rightLowerArmZ, 0.25, blend);
          leftUpperArmX = THREE.MathUtils.lerp(leftUpperArmX, -0.3, blend);
          leftLowerArmX = THREE.MathUtils.lerp(leftLowerArmX, -0.2, blend);
        } else if (nearestIndex === 6) {
          rightUpperArmX = THREE.MathUtils.lerp(rightUpperArmX, -0.9, blend);
          rightLowerArmX = THREE.MathUtils.lerp(rightLowerArmX, -0.55, blend);
          leftUpperArmX = THREE.MathUtils.lerp(leftUpperArmX, -0.25, blend);
          leftLowerArmX = THREE.MathUtils.lerp(leftLowerArmX, -0.35, blend);
        }
      }

      hero.leftUpperLeg.rotation.x = damp(
        hero.leftUpperLeg.rotation.x,
        leftUpperLegTarget,
        12,
        delta,
      );
      hero.rightUpperLeg.rotation.x = damp(
        hero.rightUpperLeg.rotation.x,
        rightUpperLegTarget,
        12,
        delta,
      );
      hero.leftLowerLeg.rotation.x = damp(
        hero.leftLowerLeg.rotation.x,
        leftLowerLegTarget,
        12,
        delta,
      );
      hero.rightLowerLeg.rotation.x = damp(
        hero.rightLowerLeg.rotation.x,
        rightLowerLegTarget,
        12,
        delta,
      );
      hero.leftUpperArm.rotation.x = damp(
        hero.leftUpperArm.rotation.x,
        leftUpperArmX,
        10,
        delta,
      );
      hero.rightUpperArm.rotation.x = damp(
        hero.rightUpperArm.rotation.x,
        rightUpperArmX,
        10,
        delta,
      );
      hero.leftUpperArm.rotation.z = damp(
        hero.leftUpperArm.rotation.z,
        leftUpperArmZ,
        10,
        delta,
      );
      hero.rightUpperArm.rotation.z = damp(
        hero.rightUpperArm.rotation.z,
        rightUpperArmZ,
        10,
        delta,
      );
      hero.leftLowerArm.rotation.x = damp(
        hero.leftLowerArm.rotation.x,
        leftLowerArmX,
        10,
        delta,
      );
      hero.rightLowerArm.rotation.x = damp(
        hero.rightLowerArm.rotation.x,
        rightLowerArmX,
        10,
        delta,
      );
      hero.leftLowerArm.rotation.z = damp(
        hero.leftLowerArm.rotation.z,
        leftLowerArmZ,
        10,
        delta,
      );
      hero.rightLowerArm.rotation.z = damp(
        hero.rightLowerArm.rotation.z,
        rightLowerArmZ,
        10,
        delta,
      );

      hero.backpack.visible = nearestIndex === 0 && nearestDistance < 2.4;
      hero.clipboard.visible = nearestIndex === 4 && nearestDistance < 1.8;

      callouts.forEach((sprite, index) => {
        const isCurrent = index === nearestIndex && nearestDistance < 3.4;
        const targetOpacity = isCurrent ? 1 : 0;
        const spriteMaterial = sprite.material;
        spriteMaterial.opacity = THREE.MathUtils.clamp(
          damp(spriteMaterial.opacity, targetOpacity, 6, delta),
          0,
          1,
        );
        sprite.visible = isCurrent;
        if (!isCurrent) spriteMaterial.opacity = 0;
      });

      const baseShot = {
        x: cameraOffset.x,
        y: cameraOffset.y,
        z: cameraOffset.z,
        lookX: lookAhead,
        lookY: 1.15,
      };
      const stationShot =
        nearestIndex >= 0 ? CAMERA_SHOTS[nearestIndex] : baseShot;
      const mobileX = mobileView ? -0.2 : 0;
      const mobileY = mobileView ? 0.5 : 0;
      const mobileZ = mobileView ? 1.8 : 0;
      const cameraBlend = stationBlend;

      camera.position.set(
        characterPosition.x +
          THREE.MathUtils.lerp(
            baseShot.x,
            stationShot.x + mobileX,
            cameraBlend,
          ),
        THREE.MathUtils.lerp(
          baseShot.y,
          stationShot.y + mobileY,
          cameraBlend,
        ),
        THREE.MathUtils.lerp(
          baseShot.z,
          stationShot.z + mobileZ,
          cameraBlend,
        ),
      );
      camera.lookAt(
        characterPosition.x +
          THREE.MathUtils.lerp(
            baseShot.lookX,
            stationShot.lookX,
            cameraBlend,
          ),
        THREE.MathUtils.lerp(
          baseShot.lookY,
          stationShot.lookY,
          cameraBlend,
        ),
        0.4,
      );

      if (!reducedMotion) {
        particles.rotation.y = elapsed * 0.008;
      }

      renderer.render(scene, camera);

      if (!firstFramePainted) {
        firstFramePainted = true;
        container.dataset.storyReady = "true";
        onReady?.();
      }
    };

    frame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frame);
      timer.disconnect();
      timer.dispose();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);

      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh ||
          object instanceof THREE.Line ||
          object instanceof THREE.Points
        ) {
          object.geometry?.dispose();
          const objectMaterial = object.material;
          if (Array.isArray(objectMaterial)) {
            objectMaterial.forEach((entry) => {
              entry.map?.dispose();
              entry.dispose();
            });
          } else {
            objectMaterial?.map?.dispose();
            objectMaterial?.dispose();
          }
        }
        if (object instanceof THREE.Sprite) {
          object.material.map?.dispose();
          object.material.dispose();
        }
      });

      renderer.forceContextLoss();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [light, onReady, onUnavailable, progress]);

  return <div ref={containerRef} aria-hidden="true" className={className} />;
}
