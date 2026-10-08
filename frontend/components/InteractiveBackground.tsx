"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface NodeNetworkProps {
  mouse: { x: number; y: number };
}

function AgentNodeNetwork({ mouse }: NodeNetworkProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const lineMeshRef = useRef<THREE.LineSegments>(null!);
  const pointsRef = useRef<THREE.Points>(null!);

  // Particle count
  const nodeCount = 180;
  const maxDistance = 3.2;

  // Initialize node positions and velocities
  const [nodes, originalPositions] = useMemo(() => {
    const list: {
      pos: THREE.Vector3;
      vel: THREE.Vector3;
      baseColor: THREE.Color;
    }[] = [];

    const colorCyan = new THREE.Color("#06b6d4");
    const colorPurple = new THREE.Color("#a855f7");
    const colorIndigo = new THREE.Color("#6366f1");

    const posArray = new Float32Array(nodeCount * 3);

    for (let i = 0; i < nodeCount; i++) {
      const radius = 3 + Math.random() * 9;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.9;

      const x = radius * Math.cos(theta) * Math.cos(phi);
      const y = radius * Math.sin(phi) * 0.9;
      const z = radius * Math.sin(theta) * Math.cos(phi) - 2;

      const mixed = Math.random();
      const col = mixed < 0.35 ? colorCyan : mixed < 0.7 ? colorPurple : colorIndigo;

      list.push({
        pos: new THREE.Vector3(x, y, z),
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 0.008,
          (Math.random() - 0.5) * 0.008,
          (Math.random() - 0.5) * 0.008
        ),
        baseColor: col,
      });

      posArray[i * 3] = x;
      posArray[i * 3 + 1] = y;
      posArray[i * 3 + 2] = z;
    }

    return [list, posArray];
  }, [nodeCount]);

  // Max lines calculation
  const maxLines = (nodeCount * (nodeCount - 1)) / 2;
  const linePositions = useMemo(() => new Float32Array(maxLines * 6), [maxLines]);
  const lineColors = useMemo(() => new Float32Array(maxLines * 6), [maxLines]);
  const pointPositions = useMemo(() => new Float32Array(nodeCount * 3), [nodeCount]);
  const pointColors = useMemo(() => {
    const arr = new Float32Array(nodeCount * 3);
    for (let i = 0; i < nodeCount; i++) {
      const c = nodes[i].baseColor;
      arr[i * 3] = c.r;
      arr[i * 3 + 1] = c.g;
      arr[i * 3 + 2] = c.b;
    }
    return arr;
  }, [nodeCount, nodes]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Smooth subtle parallax rotation
    const targetRotX = mouse.y * 0.35 + Math.sin(state.clock.elapsedTime * 0.2) * 0.08;
    const targetRotY = mouse.x * 0.45 + state.clock.elapsedTime * 0.04;

    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotX,
      0.05
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotY,
      0.05
    );

    // Update individual agent nodes positions
    for (let i = 0; i < nodeCount; i++) {
      const node = nodes[i];
      node.pos.add(node.vel);

      // Bounce within bounding boundary
      if (Math.abs(node.pos.x) > 10) node.vel.x *= -1;
      if (Math.abs(node.pos.y) > 6) node.vel.y *= -1;
      if (Math.abs(node.pos.z) > 8) node.vel.z *= -1;

      pointPositions[i * 3] = node.pos.x;
      pointPositions[i * 3 + 1] = node.pos.y;
      pointPositions[i * 3 + 2] = node.pos.z;
    }

    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Connect close nodes with glowing lines
    let lineIndex = 0;
    let colorIndex = 0;

    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dist = nodes[i].pos.distanceTo(nodes[j].pos);

        if (dist < maxDistance) {
          const alpha = 1.0 - dist / maxDistance;

          linePositions[lineIndex++] = nodes[i].pos.x;
          linePositions[lineIndex++] = nodes[i].pos.y;
          linePositions[lineIndex++] = nodes[i].pos.z;

          linePositions[lineIndex++] = nodes[j].pos.x;
          linePositions[lineIndex++] = nodes[j].pos.y;
          linePositions[lineIndex++] = nodes[j].pos.z;

          const c1 = nodes[i].baseColor;
          const c2 = nodes[j].baseColor;

          lineColors[colorIndex++] = c1.r * alpha;
          lineColors[colorIndex++] = c1.g * alpha;
          lineColors[colorIndex++] = c1.b * alpha;

          lineColors[colorIndex++] = c2.r * alpha;
          lineColors[colorIndex++] = c2.g * alpha;
          lineColors[colorIndex++] = c2.b * alpha;
        }
      }
    }

    if (lineMeshRef.current) {
      lineMeshRef.current.geometry.attributes.position.needsUpdate = true;
      lineMeshRef.current.geometry.attributes.color.needsUpdate = true;
      lineMeshRef.current.geometry.setDrawRange(0, lineIndex / 3);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Network Connection Lines */}
      <lineSegments ref={lineMeshRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[lineColors, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Glowing Agent Nodes */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[pointPositions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[pointColors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          vertexColors
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

function Starfield() {
  const count = 600;
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const c1 = new THREE.Color("#3730a3");
    const c2 = new THREE.Color("#0e7490");

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5;

      const c = Math.random() > 0.5 ? c1 : c2;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, [count]);

  const starRef = useRef<THREE.Points>(null!);
  useFrame((state, delta) => {
    if (!starRef.current) return;
    starRef.current.rotation.y -= delta * 0.01;
  });

  return (
    <points ref={starRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export function InteractiveBackground() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMouse({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (!mounted) {
    return <div className="absolute inset-0 -z-10 bg-black" />;
  }

  return (
    <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden pointer-events-none">
      {/* Cyber gradient vignettes for seamless dark-mode contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)] z-10" />

      <Canvas
        camera={{ position: [0, 0, 7.5], fov: 55 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        className="h-full w-full"
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#06b6d4" />
        <pointLight position={[-10, -10, -5]} intensity={1.5} color="#a855f7" />
        <Starfield />
        <AgentNodeNetwork mouse={mouse} />
      </Canvas>
    </div>
  );
}
