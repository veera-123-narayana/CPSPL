import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

/**
 * FloorGrid3D — Infinite Golden Perspective Grid & Volumetric Lighting
 * Matches the golden floor lines of the official INNOVRUSH 2K26 poster,
 * extending it into full 3D space with floating embers and dual laser beams.
 */
export default function FloorGrid3D({ progress = 1, mousePos = { x: 0, y: 0 } }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050607, 0.045);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Floor Grid (Infinite gold grid perspective)
    const grid = new THREE.GridHelper(50, 70, 0xffd84d, 0x3d3012);
    grid.position.y = -2.2;
    grid.material.opacity = 0.65;
    grid.material.transparent = true;
    scene.add(grid);

    // Dark mirror plane under grid
    const floorGeo = new THREE.PlaneGeometry(80, 80);
    const floorMat = new THREE.MeshBasicMaterial({
      color: 0x050607,
      transparent: true,
      opacity: 0.95
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.21;
    scene.add(floor);

    // Dual laser beams projecting from bottom corners of scene
    const createBeam = (x) => {
      const geo = new THREE.CylinderGeometry(0.04, 0.5, 12, 16);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffd84d,
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending
      });
      const beam = new THREE.Mesh(geo, mat);
      beam.position.set(x, 2, -1);
      beam.rotation.z = x > 0 ? 0.25 : -0.25;
      beam.rotation.x = -0.3;
      scene.add(beam);
      return beam;
    };
    const beamL = createBeam(-3.5);
    const beamR = createBeam(3.5);

    // Floating Gold Embers
    const pCount = 200;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pVels = [];
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 16;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 8 - 1;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 12;
      pVels.push({
        vx: (Math.random() - 0.5) * 0.003,
        vy: Math.random() * 0.008 + 0.004,
        vz: (Math.random() - 0.5) * 0.003
      });
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xffd84d,
      size: 0.04,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    let frameId;
    let clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Slowly translate floor grid towards viewer for continuous depth movement
      grid.position.z = (grid.position.z + 0.02) % 0.71;

      // Animate floating particles
      const pos = particles.geometry.attributes.position.array;
      for (let i = 0; i < pCount; i++) {
        pos[i * 3 + 1] += pVels[i].vy;
        if (pos[i * 3 + 1] > 4) pos[i * 3 + 1] = -2.2;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Subtle beam pulse
      beamL.material.opacity = 0.22 + Math.sin(elapsed * 3) * 0.08;
      beamR.material.opacity = 0.22 + Math.cos(elapsed * 3) * 0.08;

      // Camera parallax tilt
      camera.position.x = mousePos.x * 0.35;
      camera.position.y = 1.2 - mousePos.y * 0.2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      if (renderer.domElement && mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-none -z-10" />;
}
