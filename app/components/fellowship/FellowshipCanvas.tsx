"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  FELLOWSHIP_MONTH_COUNT,
  phaseIndexForMonth,
} from "@/lib/fellowship-journey";

const PHASE_COLORS_DARK = [0x3b82f6, 0x06b6d4, 0x34d399, 0x91b4ff, 0x8b5cf6];
const PHASE_COLORS_LIGHT = [0x1d4ed8, 0x0e7490, 0x059669, 0x2563eb, 0x6d28d9];
const MONTH_COUNT = FELLOWSHIP_MONTH_COUNT;

type FellowshipCanvasProps = {
  activePhase: number | null;
  light?: boolean;
  onReady?: () => void;
  onUnavailable?: () => void;
  className?: string;
};

type OrbitRing = {
  mesh: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>;
  material: THREE.MeshBasicMaterial;
  baseOpacity: number;
};

function createGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0, "rgba(255,255,255,0.95)");
    gradient.addColorStop(0.35, "rgba(255,255,255,0.35)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createStarField(light: boolean) {
  const count = 420;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const palette = light
    ? [
        new THREE.Color(0x1d4ed8),
        new THREE.Color(0x0f766e),
        new THREE.Color(0x6d28d9),
      ]
    : [
        new THREE.Color(0x91b4ff),
        new THREE.Color(0x68fcbf),
        new THREE.Color(0x8b5cf6),
      ];

  // Deterministic layout so the sky is stable between visits.
  let seed = 62841;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let index = 0; index < count; index += 1) {
    const stride = index * 3;
    positions[stride] = (random() - 0.5) * 13;
    positions[stride + 1] = (random() - 0.5) * 8;
    positions[stride + 2] = (random() - 0.5) * 6 - 1.5;

    const color = palette[Math.floor(random() * palette.length)];
    colors[stride] = color.r;
    colors[stride + 1] = color.g;
    colors[stride + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: light ? 0.028 : 0.035,
    vertexColors: true,
    transparent: true,
    opacity: light ? 0.42 : 0.5,
    depthWrite: false,
    blending: light ? THREE.NormalBlending : THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  return new THREE.Points(geometry, material);
}

export default function FellowshipCanvas({
  activePhase,
  light = false,
  onReady,
  onUnavailable,
  className,
}: FellowshipCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activePhaseRef = useRef(activePhase);

  useEffect(() => {
    activePhaseRef.current = activePhase;
  }, [activePhase]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Probe first so a browser without WebGL never reaches Three's renderer,
    // which would log context errors before throwing.
    const probe = document.createElement("canvas");
    const probeContext =
      probe.getContext("webgl2") || probe.getContext("webgl");
    if (!probeContext) {
      onUnavailable?.();
      return;
    }
    probeContext.getExtension("WEBGL_lose_context")?.loseContext();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      // No WebGL (old browser, blocked GPU). The CSS orbit fallback stays.
      onUnavailable?.();
      return;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.cursor = "grab";
    renderer.domElement.style.touchAction = "pan-y";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    const phaseColors = light ? PHASE_COLORS_LIGHT : PHASE_COLORS_DARK;
    const blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
    const haloBaseScale = light ? 0.24 : 0.34;
    const haloBaseOpacity = light ? 0.2 : 0.5;

    const root = new THREE.Group();
    const tilt = new THREE.Group();
    root.add(tilt);
    scene.add(root);

    const glowTexture = createGlowTexture();

    const coreGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture,
        color: light ? 0x60a5fa : 0x1d4ed8,
        transparent: true,
        opacity: light ? 0.24 : 0.55,
        depthWrite: false,
        blending,
      }),
    );
    coreGlow.scale.setScalar(5.4);
    tilt.add(coreGlow);

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.18, 1),
      new THREE.MeshBasicMaterial({
        color: light ? 0x1d4ed8 : 0x3b82f6,
        wireframe: true,
        transparent: true,
        opacity: light ? 0.3 : 0.2,
        depthWrite: false,
        blending,
      }),
    );
    tilt.add(core);

    const innerCore = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.62, 2),
      new THREE.MeshBasicMaterial({
        color: light ? 0x0f766e : 0x68fcbf,
        wireframe: true,
        transparent: true,
        opacity: light ? 0.24 : 0.16,
        depthWrite: false,
        blending,
      }),
    );
    tilt.add(innerCore);

    const rings: OrbitRing[] = [1.55, 1.95, 2.35, 2.75, 3.12].map(
      (radius, index) => {
        const material = new THREE.MeshBasicMaterial({
          color: phaseColors[index],
          transparent: true,
          opacity: light ? 0.34 : 0.2,
          depthWrite: false,
          blending,
        });
        const mesh = new THREE.Mesh(
          new THREE.TorusGeometry(radius, 0.006, 8, 220),
          material,
        );
        mesh.rotation.x = Math.PI / 2 + (index - 2) * 0.16;
        mesh.rotation.y = (index - 2) * 0.24;
        mesh.rotation.z = index * 0.09;
        tilt.add(mesh);
        return { mesh, material, baseOpacity: light ? 0.34 : 0.2 };
      },
    );

    const nodeGroup = new THREE.Group();
    tilt.add(nodeGroup);

    const nodeMaterials: THREE.MeshBasicMaterial[] = [];
    const nodeHalos: THREE.Sprite[] = [];
    const nodePositions: THREE.Vector3[] = [];

    const startColor = new THREE.Color(light ? 0x1d4ed8 : 0x91b4ff);
    const endColor = new THREE.Color(light ? 0x047857 : 0x68fcbf);

    for (let index = 0; index < MONTH_COUNT; index += 1) {
      const t = index / (MONTH_COUNT - 1);
      const angle = t * Math.PI * 3.1 + 0.55;
      const radius = 1.58 + Math.sin(t * Math.PI * 2) * 0.34;
      const position = new THREE.Vector3(
        Math.cos(angle) * radius,
        (t - 0.5) * 2.95,
        Math.sin(angle) * radius,
      );
      nodePositions.push(position);

      const color = startColor.clone().lerp(endColor, t);
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 1,
        depthWrite: false,
        blending,
      });
      const size = 0.048 + (index % 3) * 0.006;
      const node = new THREE.Mesh(new THREE.SphereGeometry(size, 14, 14), material);
      node.position.copy(position);
      nodeGroup.add(node);
      nodeMaterials.push(material);

      const halo = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: glowTexture,
          color,
          transparent: true,
          opacity: haloBaseOpacity,
          depthWrite: false,
          blending,
        }),
      );
      halo.position.copy(position);
      halo.scale.setScalar(haloBaseScale);
      nodeGroup.add(halo);
      nodeHalos.push(halo);
    }

    const orbitCurve = new THREE.CatmullRomCurve3(nodePositions, false, "catmullrom", 0.35);
    const orbitLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(orbitCurve.getPoints(220)),
      new THREE.LineBasicMaterial({
        color: light ? 0x1d4ed8 : 0x3b82f6,
        transparent: true,
        opacity: light ? 0.45 : 0.3,
        depthWrite: false,
        blending,
      }),
    );
    tilt.add(orbitLine);

    const stars = createStarField(light);
    scene.add(stars);

    let inView = true;
    let contextLost = false;
    let frame = 0;
    let firstFramePainted = false;
    const timer = new THREE.Timer();
    timer.connect(document);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let spin = 0;
    let dragX = 0;
    let dragY = 0;
    let parallaxX = 0;
    let parallaxY = 0;
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let scrollSpin = 0;
    let scrollLift = 0;
    let scrollDepth = 0;
    let targetScrollSpin = 0;
    let targetScrollLift = 0;
    let targetScrollDepth = 0;
    let dragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;

    const ringOpacity = rings.map((ring) => ring.baseOpacity);
    const nodeOpacity = nodeMaterials.map((material) => material.opacity);

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      const aspect = width / height;

      renderer.setSize(width, height, false);
      camera.aspect = aspect;

      const halfFov = THREE.MathUtils.degToRad(camera.fov) / 2;
      const fitHeightDistance = 3.35 / Math.tan(halfFov);
      const fitWidthDistance = 3.35 / (Math.tan(halfFov) * aspect);
      camera.position.set(0, 0.12, Math.max(fitHeightDistance, fitWidthDistance) * 1.02);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    };

    const updateScroll = () => {
      const rect = container.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const progress = THREE.MathUtils.clamp(
        (viewport - rect.top) / (viewport + rect.height),
        0,
        1,
      );

      if (reducedMotion) {
        targetScrollSpin = 0;
        targetScrollLift = 0;
        targetScrollDepth = 0;
        return;
      }

      targetScrollSpin = (progress - 0.5) * 1.15;
      targetScrollLift = (progress - 0.5) * 0.34;
      targetScrollDepth = (progress - 0.5) * 0.5;
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();
    updateScroll();

    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? true;
      },
      { threshold: 0.05 },
    );
    intersectionObserver.observe(container);

    const handlePointerDown = (event: PointerEvent) => {
      dragging = true;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      renderer.domElement.style.cursor = "grabbing";
      renderer.domElement.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();

      if (dragging) {
        dragX += (event.clientX - lastPointerX) * 0.006;
        dragY = THREE.MathUtils.clamp(
          dragY + (event.clientY - lastPointerY) * 0.004,
          -0.65,
          0.65,
        );
        lastPointerX = event.clientX;
        lastPointerY = event.clientY;
        return;
      }

      targetParallaxX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.32;
      targetParallaxY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.2;
    };

    const handlePointerUp = (event: PointerEvent) => {
      dragging = false;
      renderer.domElement.style.cursor = "grab";
      if (renderer.domElement.hasPointerCapture(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId);
      }
    };

    const handlePointerLeave = () => {
      targetParallaxX = 0;
      targetParallaxY = 0;
    };

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      onUnavailable?.();
    };

    renderer.domElement.addEventListener("webglcontextlost", handleContextLost);
    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    renderer.domElement.addEventListener("pointermove", handlePointerMove);
    renderer.domElement.addEventListener("pointerup", handlePointerUp);
    renderer.domElement.addEventListener("pointercancel", handlePointerUp);
    renderer.domElement.addEventListener("pointerleave", handlePointerLeave);

    const animate = (timestamp: number) => {
      frame = window.requestAnimationFrame(animate);

      timer.update(timestamp);
      const delta = Math.min(timer.getDelta(), 1 / 30);
      const elapsed = timer.getElapsed();

      if (contextLost || !inView || document.hidden) return;

      const smoothing = 1 - Math.exp(-6 * delta);

      if (!reducedMotion && !dragging) {
        spin += delta * 0.075;
      }

      parallaxX += (targetParallaxX - parallaxX) * smoothing;
      parallaxY += (targetParallaxY - parallaxY) * smoothing;
      scrollSpin += (targetScrollSpin - scrollSpin) * smoothing;
      scrollLift += (targetScrollLift - scrollLift) * smoothing;
      scrollDepth += (targetScrollDepth - scrollDepth) * smoothing;

      root.rotation.y = spin + dragX + parallaxX + scrollSpin;
      root.rotation.x = -0.16 + dragY + parallaxY + scrollLift * 0.35;
      root.position.y = scrollLift;
      root.position.z = scrollDepth;

      if (!reducedMotion) {
        core.rotation.x = elapsed * 0.12;
        core.rotation.y = elapsed * 0.18;
        innerCore.rotation.x = -elapsed * 0.2;
        innerCore.rotation.y = -elapsed * 0.14;
        stars.rotation.y = elapsed * 0.006;
        nodeGroup.rotation.y = Math.sin(elapsed * 0.18) * 0.04;
      }

      const active = activePhaseRef.current;
      const pulse = reducedMotion ? 0 : Math.sin(elapsed * 1.6) * 0.12;

      rings.forEach((ring, index) => {
        const targetOpacity =
          active === null ? ring.baseOpacity : active === index ? 0.9 : 0.045;
        ringOpacity[index] += (targetOpacity - ringOpacity[index]) * smoothing;
        ring.material.opacity = ringOpacity[index];

        const targetScale = active === index ? 1.045 : 1;
        const nextScale =
          ring.mesh.scale.x + (targetScale - ring.mesh.scale.x) * smoothing;
        ring.mesh.scale.setScalar(nextScale);

        if (!reducedMotion) {
          ring.mesh.rotation.z += delta * (index % 2 === 0 ? 0.012 : -0.009);
        }
      });

      nodeMaterials.forEach((material, index) => {
        const isActive = active === null || phaseIndexForMonth(index + 1) === active;
        const targetOpacity = active === null ? 0.9 : isActive ? 1 : 0.22;
        nodeOpacity[index] += (targetOpacity - nodeOpacity[index]) * smoothing;
        material.opacity = nodeOpacity[index];

        const halo = nodeHalos[index];
        const haloOpacity =
          active === null
            ? haloBaseOpacity
            : isActive
              ? haloBaseOpacity * 1.6
              : haloBaseOpacity * 0.3;
        halo.material.opacity += (haloOpacity - halo.material.opacity) * smoothing;
        const scale = 1 + (isActive ? pulse : 0);
        halo.scale.setScalar(
          haloBaseScale * scale * (active === null ? 1 : isActive ? 1.35 : 0.9),
        );
      });

      renderer.render(scene, camera);

      if (!firstFramePainted) {
        firstFramePainted = true;
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
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
      renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      renderer.domElement.removeEventListener("pointermove", handlePointerMove);
      renderer.domElement.removeEventListener("pointerup", handlePointerUp);
      renderer.domElement.removeEventListener("pointercancel", handlePointerUp);
      renderer.domElement.removeEventListener("pointerleave", handlePointerLeave);

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) {
          object.geometry?.dispose();
          const material = object.material;
          if (Array.isArray(material)) {
            material.forEach((entry) => entry.dispose());
          } else {
            material?.dispose();
          }
        }
        if (object instanceof THREE.Sprite) {
          object.material.dispose();
        }
      });

      glowTexture.dispose();
      renderer.forceContextLoss();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [light, onReady, onUnavailable]);

  return <div ref={containerRef} aria-hidden="true" className={className} />;
}
