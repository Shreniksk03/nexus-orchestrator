"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function ParticleField({ mouse }: { mouse: { x: number; y: number } }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const count = 1800;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const color1 = new THREE.Color("#6366f1"); // Indigo
    const color2 = new THREE.Color("#06b6d4"); // Cyan
    const color3 = new THREE.Color("#a855f7"); // Purple

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Spread in a cylindrical disk / sphere
      const radius = 6 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.8;

      pos[i3] = radius * Math.cos(theta) * Math.cos(phi);
      pos[i3 + 1] = radius * Math.sin(phi) * 1.5;
      pos[i3 + 2] = radius * Math.sin(theta) * Math.cos(phi) - 5;

      const mixed = Math.random();
      const c = mixed < 0.4 ? color1 : mixed < 0.7 ? color2 : color3;
      col[i3] = c.r;
      col[i3 + 1] = c.g;
      col[i3 + 2] = c.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.04;
    pointsRef.current.rotation.x += delta * 0.015;

    // Subtle mouse parallax
    pointsRef.current.position.x = THREE.MathUtils.lerp(
      pointsRef.current.position.x,
      mouse.x * 1.5,
      0.05
    );
    pointsRef.current.position.y = THREE.MathUtils.lerp(
      pointsRef.current.position.y,
      mouse.y * 1.2,
      0.05
    );
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.075}
        vertexColors
        transparent
        opacity={0.75}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function FloatingCyberCore({ mouse }: { mouse: { x: number; y: number } }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (!meshRef.current || !innerRef.current) return;
    meshRef.current.rotation.x += delta * 0.2;
    meshRef.current.rotation.y += delta * 0.25;

    innerRef.current.rotation.x -= delta * 0.3;
    innerRef.current.rotation.z += delta * 0.15;

    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      mouse.x * 0.8,
      0.05
    );
    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y,
      mouse.y * 0.6 + Math.sin(state.clock.elapsedTime) * 0.2,
      0.05
    );
  });

  return (
    <group position={[0, 0, -2]}>
      {/* Outer Wireframe Icosahedron */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2.4, 2]} />
        <meshBasicMaterial
          color="#6366f1"
          wireframe
          transparent
          opacity={0.25}
        />
      </mesh>

      {/* Inner Octahedron Core */}
      <mesh ref={innerRef}>
        <octahedronGeometry args={[1.3, 0]} />
        <meshBasicMaterial
          color="#06b6d4"
          wireframe
          transparent
          opacity={0.45}
        />
      </mesh>
    </group>
  );
}

function GridFloor() {
  const gridRef = useRef<THREE.GridHelper>(null!);

  useFrame((state, delta) => {
    if (!gridRef.current) return;
    gridRef.current.position.z = (state.clock.elapsedTime * 0.8) % 2;
  });

  return (
    <gridHelper
      ref={gridRef}
      args={[60, 40, "#4338ca", "#1e1b4b"]}
      position={[0, -4, 0]}
    />
  );
}

export function InteractiveScene3D() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates from -1 to 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMouse({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (!mounted) {
    return <div className="absolute inset-0 bg-[#090d16]" />;
  }

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Cyber gradient vignettes */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#090d16]/70 via-transparent to-[#090d16] z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#090d16]/90 via-transparent to-[#090d16]/90 z-10" />

      <Canvas
        camera={{ position: [0, 0, 7], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        className="h-full w-full"
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#6366f1" />
        <pointLight position={[-10, -10, -5]} intensity={0.8} color="#06b6d4" />
        <FloatingCyberCore mouse={mouse} />
        <ParticleField mouse={mouse} />
        <GridFloor />
      </Canvas>
    </div>
  );
}
