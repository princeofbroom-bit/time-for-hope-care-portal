"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, GradientTexture } from '@react-three/drei';
import * as THREE from 'three';

function Blob() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
        }
    });

    return (
        <Float speed={4} rotationIntensity={1} floatIntensity={2}>
            <Sphere ref={meshRef} args={[1, 100, 100]} scale={2}>
                <MeshDistortMaterial
                    color="#f8fafc"
                    speed={3}
                    distort={0.4}
                    radius={1}
                >
                    <GradientTexture
                        stops={[0, 0.5, 1]}
                        colors={['#0f172a', '#334155', '#1e293b']} // Deep navy gradients
                        innerCircleRadius={0.2}
                        outerCircleRadius={1}
                    />
                </MeshDistortMaterial>
            </Sphere>
        </Float>
    );
}

function Particles({ count = 100 }) {
    const points = useMemo(() => {
        const p = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            p[i * 3] = (Math.random() - 0.5) * 10;
            p[i * 3 + 1] = (Math.random() - 0.5) * 10;
            p[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
        return p;
    }, [count]);

    const ref = useRef<THREE.Points>(null);
    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = state.clock.getElapsedTime() * 0.05;
        }
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[points, 3]}
                />
            </bufferGeometry>
            <pointsMaterial size={0.02} color="#94a3b8" transparent opacity={0.6} sizeAttenuation />
        </points>
    );
}

export default function HeroScene() {
    return (
        <div className="hero-3d-container">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                <Blob />
                <Particles count={200} />
            </Canvas>
            <style jsx>{`
        .hero-3d-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
          opacity: 0.6;
        }
      `}</style>
        </div>
    );
}
