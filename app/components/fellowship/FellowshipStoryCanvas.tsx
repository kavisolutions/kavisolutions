"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";

const PAGE_BG = 0x0b1220;

const STATIONS = [
  { x: -16, color: 0x3b82f6, label: "01 · APPLY" },
  { x: -8.5, color: 0x06b6d4, label: "02 · INTERVIEW" },
  { x: -1, color: 0x34d399, label: "03 · BUILD" },
  { x: 6.5, color: 0xfbbf24, label: "04 · FIELD" },
  { x: 14, color: 0x8b5cf6, label: "05 · CAPSTONE" },
];

const PATH_KEYS = [
  { p: 0, x: -18 },
  { p: 0.1, x: -16 },
  { p: 0.3, x: -8.5 },
  { p: 0.5, x: -1 },
  { p: 0.7, x: 6.5 },
  { p: 0.9, x: 14 },
  { p: 1, x: 16 },
];

type PersonParts = {
  group: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
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

function createPerson(
  shirt: number,
  options: {
    skin?: number;
    pants?: number;
    hair?: number;
    seated?: boolean;
  } = {},
): PersonParts {
  const skin = options.skin ?? 0xc98b5e;
  const pants = options.pants ?? 0x1e293b;
  const hair = options.hair ?? 0x141a24;

  const group = new THREE.Group();

  const torso = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.22, 0.52, 4, 10),
    material(shirt),
  );
  torso.position.y = 1.18;
  group.add(torso);

  const hips = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.16, 0.16, 4, 8),
    material(pants),
  );
  hips.position.y = 0.84;
  group.add(hips);

  const head = addSphere(group, 0.21, skin, 0, 1.73, 0);
  head.castShadow = false;

  const hairMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.218, 14, 8, 0, Math.PI * 2, 0, Math.PI / 1.75),
    material(hair, { roughness: 0.95 }),
  );
  hairMesh.position.y = 1.75;
  group.add(hairMesh);

  addSphere(group, 0.026, 0x111827, -0.07, 1.75, 0.19);
  addSphere(group, 0.026, 0x111827, 0.07, 1.75, 0.19);

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.11, 0.8, 0);
  const leftLegMesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.07, 0.52, 4, 8),
    material(pants),
  );
  leftLegMesh.position.y = -0.29;
  leftLeg.add(leftLegMesh);
  addBox(leftLeg, 0.16, 0.09, 0.26, 0x111827, 0, -0.6, 0.06);
  group.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.11, 0.8, 0);
  const rightLegMesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.07, 0.52, 4, 8),
    material(pants),
  );
  rightLegMesh.position.y = -0.29;
  rightLeg.add(rightLegMesh);
  addBox(rightLeg, 0.16, 0.09, 0.26, 0x111827, 0, -0.6, 0.06);
  group.add(rightLeg);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.29, 1.38, 0);
  const leftArmMesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.06, 0.46, 4, 8),
    material(shirt),
  );
  leftArmMesh.position.y = -0.24;
  leftArm.add(leftArmMesh);
  addSphere(leftArm, 0.065, skin, 0, -0.5, 0);
  group.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.29, 1.38, 0);
  const rightArmMesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.06, 0.46, 4, 8),
    material(shirt),
  );
  rightArmMesh.position.y = -0.24;
  rightArm.add(rightArmMesh);
  addSphere(rightArm, 0.065, skin, 0, -0.5, 0);
  group.add(rightArm);

  const certificate = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, 0.18, 0.012),
    material(0xf8fafc, { roughness: 0.4 }),
  );
  certificate.position.set(0, -0.62, 0.03);
  certificate.visible = false;
  rightArm.add(certificate);

  const clipboard = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.3, 0.02),
    material(0xd6a56a, { roughness: 0.9 }),
  );
  clipboard.position.set(0, -0.54, 0.07);
  clipboard.visible = false;
  leftArm.add(clipboard);

  if (options.seated) {
    group.position.y = -0.16;
    leftLeg.rotation.x = -1.2;
    rightLeg.rotation.x = -1.2;
    leftArm.rotation.x = -0.9;
    rightArm.rotation.x = -0.9;
    leftArm.rotation.z = 0.15;
    rightArm.rotation.z = -0.15;
  }

  return {
    group,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
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
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * delta));
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
    new THREE.Vector3(-19, 0.02, 0),
    new THREE.Vector3(17, 0.02, 0),
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

  addBox(group, 2.4, 0.1, 0.9, 0x233047, 0, 0.95, -0.85);
  addBox(group, 0.65, 0.06, 0.42, 0x0f172a, -0.55, 1.04, -0.9);
  addBox(group, 0.55, 0.3, 0.03, 0x06b6d4, -0.55, 1.2, -0.9, {
    emissive: 0x0891b2,
    emissiveIntensity: 0.5,
  });

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
    [-3.1, 0.6, 0x334155],
    [3.1, 0.6, 0x1e293b],
    [-2.7, 2.0, 0x1f2937],
    [2.7, 2.0, 0x334155],
  ]) {
    const guest = createPerson(shirt, {
      skin: 0xa86f4c,
      pants: 0x0f172a,
    });
    guest.group.position.set(x, 0, z);
    guest.group.rotation.y = x < 0 ? 0.5 : -0.5;
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
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0x3b82f6, 1.7);
    rimLight.position.set(-6, 4, -6);
    scene.add(rimLight);
    const fillLight = new THREE.DirectionalLight(0x68fcbf, 0.7);
    fillLight.position.set(2, 3, 5);
    scene.add(fillLight);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 14),
      material(light ? 0xe2e8f0 : 0x0a101b, { roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(-2, 0, 0);
    scene.add(ground);
    addStationMarkers(scene);

    scene.add(buildApplyStation());
    scene.add(buildInterviewStation());
    scene.add(buildLearnStation());
    scene.add(buildFieldStation());
    scene.add(buildCapstoneStation());

    const hero = createPerson(0x175cd3, { pants: 0x111827 });
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
    const characterPosition = new THREE.Vector3(PATH_KEYS[0].x, 0, 0);

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      const aspect = width / height;

      renderer.setSize(width, height, false);
      camera.aspect = aspect;

      const narrow = aspect < 0.9;
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
          nearestIndex === 1 || nearestIndex === 2 ? Math.PI : 0;
      }
      const targetYaw = THREE.MathUtils.lerp(Math.PI / 2, stationYaw, stationBlend);
      hero.group.rotation.y = dampAngle(
        hero.group.rotation.y,
        targetYaw,
        7,
        delta,
      );

      const targetY =
        nearestIndex === 4 && nearestDistance < 2.1 ? 0.26 : 0;
      const bob = reducedMotion
        ? 0
        : Math.abs(Math.sin(walkPhase)) * 0.035 * walking;
      characterPosition.y = targetY + bob;
      hero.group.position.copy(characterPosition);

      const swing = Math.sin(walkPhase) * 0.62;
      const poseLegs = 0;
      const leftLegTarget =
        swing * walking * (1 - stationBlend) + poseLegs * stationBlend;
      const rightLegTarget =
        -swing * walking * (1 - stationBlend) + poseLegs * stationBlend;

      let leftArmX = -swing * 0.55 * walking * (1 - stationBlend);
      let rightArmX = swing * 0.55 * walking * (1 - stationBlend);
      const leftArmZ = 0;
      let rightArmZ = 0;

      if (stationBlend > 0 && nearestIndex >= 0) {
        const blend = stationBlend;
        if (nearestIndex === 0) {
          rightArmZ = THREE.MathUtils.lerp(rightArmZ, 2.0 + Math.sin(elapsed * 4) * 0.16, blend);
          leftArmX = THREE.MathUtils.lerp(leftArmX, 0, blend);
        } else if (nearestIndex === 1) {
          rightArmX = THREE.MathUtils.lerp(rightArmX, -1.25, blend);
          leftArmX = THREE.MathUtils.lerp(leftArmX, -0.35, blend);
        } else if (nearestIndex === 2) {
          leftArmX = THREE.MathUtils.lerp(leftArmX, -1.05 + Math.sin(elapsed * 7) * 0.08, blend);
          rightArmX = THREE.MathUtils.lerp(rightArmX, -1.05 - Math.sin(elapsed * 7) * 0.08, blend);
        } else if (nearestIndex === 3) {
          rightArmZ = THREE.MathUtils.lerp(rightArmZ, 2.2 + Math.sin(elapsed * 5) * 0.12, blend);
          leftArmX = THREE.MathUtils.lerp(leftArmX, -0.65, blend);
        } else if (nearestIndex === 4) {
          rightArmZ = THREE.MathUtils.lerp(rightArmZ, 2.3, blend);
          leftArmX = THREE.MathUtils.lerp(leftArmX, -0.3, blend);
        }
      }

      hero.leftLeg.rotation.x = damp(hero.leftLeg.rotation.x, leftLegTarget, 12, delta);
      hero.rightLeg.rotation.x = damp(hero.rightLeg.rotation.x, rightLegTarget, 12, delta);
      hero.leftArm.rotation.x = damp(hero.leftArm.rotation.x, leftArmX, 10, delta);
      hero.rightArm.rotation.x = damp(hero.rightArm.rotation.x, rightArmX, 10, delta);
      hero.leftArm.rotation.z = damp(hero.leftArm.rotation.z, leftArmZ, 10, delta);
      hero.rightArm.rotation.z = damp(hero.rightArm.rotation.z, rightArmZ, 10, delta);

      camera.position.set(
        characterPosition.x + cameraOffset.x,
        cameraOffset.y,
        cameraOffset.z,
      );
      camera.lookAt(characterPosition.x + lookAhead, 1.15, 0.4);

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
