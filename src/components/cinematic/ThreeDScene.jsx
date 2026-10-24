import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

/**
 * ThreeDScene — Cinematic 3D WebGL Scene
 * Replaces the reference video's sports car with an uploaded 3D Event Poster chassis.
 * Includes:
 * - Dynamic perspective camera with choreographed 3D trajectory
 * - Infinite perspective floor grid with specular reflections
 * - Dual volumetric laser headlights & floor light pools
 * - Beveled metallic gold poster chassis with custom texture
 * - 3D floating ember particles and hyper-speed light streaks
 * - Reactive lighting and interactive mouse parallax
 */
export default function ThreeDScene({
  posterTextureUrl,
  eventCoordinators = [],
  eventName = 'INNOVRUSH 2K26',
  phase = 'intro', // 'ignition' | 'orbit' | 'hero' | 'warp'
  progress = 0, // 0 to 1
  onCanvasReady,
  mousePos = { x: 0, y: 0 }
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const posterMeshRef = useRef(null);
  const frameMeshRef = useRef(null);
  const headlightsRef = useRef({ left: null, right: null, poolL: null, poolR: null });
  const particlesRef = useRef(null);
  const speedLinesRef = useRef(null);
  const gridRef = useRef(null);
  const animFrameId = useRef(null);

  // Dynamic Canvas Texture creation for crisp text & coordinators
  const createPosterCanvasTexture = (imageUrl) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1448; // Standard 1:1.414 poster ratio
    const ctx = canvas.getContext('2d');

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 1448);
    grad.addColorStop(0, '#0d1117');
    grad.addColorStop(0.5, '#050607');
    grad.addColorStop(1, '#020304');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1448);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Draw uploaded or default poster image preserving aspect ratio
      const imgAspect = img.width / img.height;
      const canvasAspect = 1024 / 1448;
      let drawW, drawH, drawX, drawY;

      if (imgAspect > canvasAspect) {
        drawH = 1448;
        drawW = 1448 * imgAspect;
        drawX = (1024 - drawW) / 2;
        drawY = 0;
      } else {
        drawW = 1024;
        drawH = 1024 / imgAspect;
        drawX = 0;
        drawY = (1448 - drawH) / 2;
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // Dark cinematic vignette overlay
      const radGrad = ctx.createRadialGradient(512, 724, 200, 512, 724, 850);
      radGrad.addColorStop(0, 'rgba(0,0,0,0)');
      radGrad.addColorStop(0.7, 'rgba(5,6,7,0.3)');
      radGrad.addColorStop(1, 'rgba(5,6,7,0.85)');
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, 1024, 1448);

      // Bottom Coordinators Banner if provided
      ctx.fillStyle = 'rgba(9, 12, 16, 0.92)';
      ctx.fillRect(40, 1260, 944, 148);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#D4A72C';
      ctx.strokeRect(40, 1260, 944, 148);

      // Coordinators Header
      ctx.font = 'bold 22px monospace';
      ctx.fillStyle = '#FFD84D';
      ctx.textAlign = 'center';
      ctx.fillText('OFFICIAL EVENT COORDINATORS & CONTACTS', 512, 1295);

      // Coordinators Contacts
      ctx.font = '20px monospace';
      ctx.fillText('P. Veera Narayana: 9848635931  |  N. Snehalatha: 7674010261', 512, 1332);
      ctx.fillText('M. Lekhasree: 9347178378  |  nexusverse@nbkrist.org', 512, 1365);
      ctx.fillText('N.B.K.R.I.S.T (Autonomous) · 29 OCT 2026 · 9:00 AM IST', 512, 1395);

      // Corner gold brackets
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#FFD84D';
      // TL
      ctx.beginPath();
      ctx.moveTo(30, 70); ctx.lineTo(30, 30); ctx.lineTo(70, 30);
      ctx.stroke();
      // TR
      ctx.beginPath();
      ctx.moveTo(954, 30); ctx.lineTo(994, 30); ctx.lineTo(994, 70);
      ctx.stroke();
      // BL
      ctx.beginPath();
      ctx.moveTo(30, 1378); ctx.lineTo(30, 1418); ctx.lineTo(70, 1418);
      ctx.stroke();
      // BR
      ctx.beginPath();
      ctx.moveTo(954, 1418); ctx.lineTo(994, 1418); ctx.lineTo(994, 1378);
      ctx.stroke();

      texture.needsUpdate = true;
    };

    img.onerror = () => {
      // Fallback procedural poster graphic
      ctx.font = 'bold 64px "Cinzel", serif';
      ctx.fillStyle = '#FFD84D';
      ctx.textAlign = 'center';
      ctx.fillText(eventName, 512, 600);
      ctx.font = 'bold 36px monospace';
      ctx.fillStyle = '#D4A72C';
      ctx.fillText('NEXUSVERSE 2K26', 512, 680);
      texture.needsUpdate = true;
    };

    img.src = imageUrl;
    return texture;
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050607, 0.04);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(-3.2, 0.8, 4.2); // Start at low-angle 3/4 sports-car perspective
    camera.lookAt(0, 0.2, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // 4. Infinite Perspective Grid Floor
    const gridHelper = new THREE.GridHelper(40, 60, 0xd4a72c, 0x1f242d);
    gridHelper.position.y = -1.4;
    gridHelper.material.opacity = 0.55;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
    gridRef.current = gridHelper;

    // Dark mirror floor plane under grid
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x050607,
      roughness: 0.18,
      metalness: 0.85
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -1.41;
    scene.add(floorMesh);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xfff5d0, 0.45);
    scene.add(ambientLight);

    const rimLight = new THREE.DirectionalLight(0xffd84d, 2.2);
    rimLight.position.set(5, 8, 4);
    scene.add(rimLight);

    const blueRimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    blueRimLight.position.set(-6, -2, -3);
    scene.add(blueRimLight);

    const heroSpot = new THREE.SpotLight(0xfffae6, 3.5, 20, Math.PI / 4, 0.35, 1);
    heroSpot.position.set(0, 4, 6);
    scene.add(heroSpot);

    // 6. 3D Poster Chassis (The Car Replacement)
    const posterWidth = 2.0;
    const posterHeight = 2.83;
    const posterThickness = 0.08;

    // Chassis Container
    const chassisGroup = new THREE.Group();
    chassisGroup.position.set(0, 0.1, 0);
    scene.add(chassisGroup);
    posterMeshRef.current = chassisGroup;

    // Front Face (Poster Texture)
    const posterTexture = createPosterCanvasTexture(posterTextureUrl || '/innovrush_poster_bg.jpg');
    const frontMat = new THREE.MeshStandardMaterial({
      map: posterTexture,
      roughness: 0.3,
      metalness: 0.2,
      emissive: 0x110e05,
      emissiveIntensity: 0.4
    });

    // Metallic Gold Chassis Frame
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xd4a72c,
      metalness: 0.95,
      roughness: 0.25,
      emissive: 0x4a3a0e,
      emissiveIntensity: 0.3
    });
    frameMeshRef.current = frameMat;

    // Back Carbon Fiber Plate
    const backMat = new THREE.MeshStandardMaterial({
      color: 0x090c10,
      metalness: 0.7,
      roughness: 0.4
    });

    const boxMaterials = [
      frameMat, // right
      frameMat, // left
      frameMat, // top
      frameMat, // bottom
      frontMat, // front
      backMat   // back
    ];

    const boxGeo = new THREE.BoxGeometry(posterWidth, posterHeight, posterThickness);
    const boxMesh = new THREE.Mesh(boxGeo, boxMaterials);
    chassisGroup.add(boxMesh);

    // Glowing Neon Border Edge Frame
    const edgeGeo = new THREE.EdgesGeometry(boxGeo);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0xffd84d, linewidth: 2 });
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    chassisGroup.add(edgeLines);

    // 7. Dual Volumetric Laser Headlights (Mounted on Chassis Bottom corners)
    const createHeadlight = (xOffset) => {
      const coneGeo = new THREE.ConeGeometry(0.75, 4.5, 32, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: 0xffd84d,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const coneMesh = new THREE.Mesh(coneGeo, coneMat);
      coneMesh.rotation.x = Math.PI / 2 + 0.12;
      coneMesh.position.set(xOffset, -posterHeight / 2 + 0.05, 2.25);

      // Light lens emitter bead
      const lensGeo = new THREE.SphereGeometry(0.06, 16, 16);
      const lensMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const lensMesh = new THREE.Mesh(lensGeo, lensMat);
      lensMesh.position.set(xOffset, -posterHeight / 2 + 0.05, posterThickness / 2 + 0.01);
      chassisGroup.add(lensMesh);

      // Projected floor light pool
      const poolGeo = new THREE.CircleGeometry(0.85, 32);
      const poolMat = new THREE.MeshBasicMaterial({
        color: 0xffd84d,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const poolMesh = new THREE.Mesh(poolGeo, poolMat);
      poolMesh.rotation.x = -Math.PI / 2;
      poolMesh.position.set(xOffset * 1.5, -1.39, 3.2);
      scene.add(poolMesh);

      chassisGroup.add(coneMesh);
      return { cone: coneMesh, pool: poolMesh, lens: lensMesh };
    };

    const lightL = createHeadlight(-posterWidth / 2 + 0.22);
    const lightR = createHeadlight(posterWidth / 2 - 0.22);
    headlightsRef.current = { lightL, lightR };

    // 8. 3D Floating Particle Embers
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 14;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 12;
      particleVelocities.push({
        vx: (Math.random() - 0.5) * 0.005,
        vy: Math.random() * 0.008 + 0.003,
        vz: (Math.random() - 0.5) * 0.005
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffd84d,
      size: 0.05,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = { points: particles, velocities: particleVelocities };

    // 9. Hyper-Speed Light Trails (Activated during acceleration)
    const lineCount = 60;
    const speedGeo = new THREE.BufferGeometry();
    const linePositions = new Float32Array(lineCount * 6);
    for (let i = 0; i < lineCount; i++) {
      const rx = (Math.random() - 0.5) * 10;
      const ry = (Math.random() - 0.5) * 4;
      const rz = Math.random() * -15;
      linePositions[i * 6] = rx;
      linePositions[i * 6 + 1] = ry;
      linePositions[i * 6 + 2] = rz;
      linePositions[i * 6 + 3] = rx;
      linePositions[i * 6 + 4] = ry;
      linePositions[i * 6 + 5] = rz - 2.5;
    }
    speedGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const speedMat = new THREE.LineBasicMaterial({
      color: 0xffd84d,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending
    });
    const speedLines = new THREE.LineSegments(speedGeo, speedMat);
    scene.add(speedLines);
    speedLinesRef.current = speedLines;

    // Handle Resize
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const newW = mountRef.current.clientWidth;
      const newH = mountRef.current.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    if (onCanvasReady) onCanvasReady();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      if (renderer && renderer.domElement && mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [posterTextureUrl]);

  // Master Render & Animation Choreography Loop
  useEffect(() => {
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const p = progress; // 0.0 to 1.0

      const camera = cameraRef.current;
      const chassis = posterMeshRef.current;
      const grid = gridRef.current;
      const particles = particlesRef.current;
      const speedLines = speedLinesRef.current;
      const renderer = rendererRef.current;
      const scene = sceneRef.current;

      if (!camera || !chassis || !renderer || !scene) return;

      // Move perspective floor grid along Z to simulate forward vehicular velocity
      if (grid) {
        const speed = p < 0.65 ? 0.04 * (1 + p * 3) : 0.015;
        grid.position.z = (grid.position.z + speed) % 1.0;
      }

      // Animate Particles
      if (particles) {
        const positions = particles.points.geometry.attributes.position.array;
        for (let i = 0; i < particles.velocities.length; i++) {
          positions[i * 3 + 1] += particles.velocities[i].vy;
          if (positions[i * 3 + 1] > 3) positions[i * 3 + 1] = -1.4;
        }
        particles.points.geometry.attributes.position.needsUpdate = true;
      }

      // Animate Speed Lines opacity during rapid acceleration phase
      if (speedLines) {
        if (p > 0.15 && p < 0.65) {
          speedLines.material.opacity = Math.min(0.65, (p - 0.15) * 2);
          const pos = speedLines.geometry.attributes.position.array;
          for (let i = 0; i < pos.length; i += 6) {
            pos[i + 2] += 0.45;
            pos[i + 5] += 0.45;
            if (pos[i + 2] > 6) {
              pos[i + 2] = -15;
              pos[i + 5] = -17.5;
            }
          }
          speedLines.geometry.attributes.position.needsUpdate = true;
        } else {
          speedLines.material.opacity = Math.max(0, speedLines.material.opacity - 0.04);
        }
      }

      // CHOREOGRAPHED 3D CAMERA & CHASSIS DYNAMICS (Matching reference sports-car sequence):
      // Stage 1 (0.0 to 0.28): Ignition & Low-Angle Arc
      if (p <= 0.28) {
        const t1 = p / 0.28;
        // Camera starts at low 3/4 sports-car angle and swoops along the side
        camera.position.x = THREE.MathUtils.lerp(-3.2, -1.8, t1) + mousePos.x * 0.15;
        camera.position.y = THREE.MathUtils.lerp(0.8, 0.4, t1) - mousePos.y * 0.1;
        camera.position.z = THREE.MathUtils.lerp(4.2, 3.4, t1);
        camera.lookAt(0, 0.1, 0);

        // Poster chassis angled like a sports car cornering
        chassis.rotation.y = THREE.MathUtils.lerp(-0.55, -0.32, t1);
        chassis.rotation.x = THREE.MathUtils.lerp(0.12, 0.06, t1);
        chassis.rotation.z = THREE.MathUtils.lerp(-0.06, -0.02, t1);
        chassis.position.y = THREE.MathUtils.lerp(-0.15, 0.08, t1);
      }
      // Stage 2 (0.28 to 0.68): Rapid Orbit, Speed Drift & Floor Flare
      else if (p <= 0.68) {
        const t2 = (p - 0.28) / 0.4;
        // Camera sweeps from flank to front with cinematic ease-out
        const ease = 1 - Math.pow(1 - t2, 3);
        camera.position.x = THREE.MathUtils.lerp(-1.8, 0, ease) + mousePos.x * 0.25;
        camera.position.y = THREE.MathUtils.lerp(0.4, 0.2, ease) - mousePos.y * 0.15;
        camera.position.z = THREE.MathUtils.lerp(3.4, 4.3, ease);
        camera.lookAt(0, 0.1, 0);

        // Chassis aligns smoothly to center
        chassis.rotation.y = THREE.MathUtils.lerp(-0.32, 0, ease);
        chassis.rotation.x = THREE.MathUtils.lerp(0.06, 0, ease);
        chassis.rotation.z = THREE.MathUtils.lerp(-0.02, 0, ease);
        chassis.position.y = 0.08 + Math.sin(elapsed * 2.5) * 0.04; // levitation hover
      }
      // Stage 3 (0.68 to 0.92): Hero Stance, Volumetric Bloom & Coordinator Telemetry
      else if (p <= 0.92) {
        // Centered majestic hero view with interactive hover
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, mousePos.x * 0.35, 0.08);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.15 - mousePos.y * 0.2, 0.08);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, 4.25, 0.08);
        camera.lookAt(0, 0.1, 0);

        chassis.rotation.y = mousePos.x * 0.12;
        chassis.rotation.x = -mousePos.y * 0.08;
        chassis.rotation.z = -mousePos.x * 0.04;
        chassis.position.y = 0.1 + Math.sin(elapsed * 2.2) * 0.06; // gentle levitation
      }
      // Stage 4 (0.92 to 1.0): Warp Zoom Reveal
      else {
        const t4 = (p - 0.92) / 0.08;
        // Dramatic camera dive into the poster for seamless transition
        camera.position.z = THREE.MathUtils.lerp(4.25, 1.2, t4 * t4);
        chassis.position.y = THREE.MathUtils.lerp(chassis.position.y, 0, 0.1);
      }

      // Headlights intensity modulation
      if (headlightsRef.current.lightL && headlightsRef.current.lightR) {
        const beamIntensity = p < 0.1 ? (p / 0.1) * 0.5 : 0.45 + Math.sin(elapsed * 4) * 0.05;
        headlightsRef.current.lightL.cone.material.opacity = beamIntensity;
        headlightsRef.current.lightR.cone.material.opacity = beamIntensity;
        headlightsRef.current.lightL.pool.material.opacity = beamIntensity * 1.2;
        headlightsRef.current.lightR.pool.material.opacity = beamIntensity * 1.2;
      }

      renderer.render(scene, camera);
    };

    animFrameId.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [progress, mousePos]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none"
    />
  );
}
