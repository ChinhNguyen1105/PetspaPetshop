import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, ContactShadows } from "@react-three/drei";

function Eye({ position }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.055, 16, 16]} />
      <meshStandardMaterial color="#241a17" roughness={0.3} />
    </mesh>
  );
}

function PetCharacter({
  type,
  position,
  bodyColor,
  accentColor,
  selected,
  onSelect,
}) {
  const root = useRef();
  const leftEar = useRef();
  const rightEar = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (!root.current) return;

    const pointer = state.pointer;
    const targetY = pointer.x * 0.18;
    const targetX = -pointer.y * 0.1;

    root.current.rotation.y +=
      (targetY - root.current.rotation.y) * Math.min(delta * 3, 1);

    root.current.rotation.x +=
      (targetX - root.current.rotation.x) * Math.min(delta * 3, 1);

    const targetScale = selected ? 1.13 : hovered ? 1.07 : 1;
    const scale = root.current.scale.x;
    const nextScale = scale + (targetScale - scale) * Math.min(delta * 7, 1);

    root.current.scale.setScalar(nextScale);

    if (type === "dog") {
      if (leftEar.current) {
        leftEar.current.rotation.z =
          Math.sin(state.clock.elapsedTime * 2.5) * 0.08;
      }

      if (rightEar.current) {
        rightEar.current.rotation.z =
          Math.sin(state.clock.elapsedTime * 2.5 + 1) * 0.08;
      }
    }
  });

  const isCat = type === "cat";

  return (
    <group
      ref={root}
      position={position}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(type);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      {/* Thân */}
      <mesh position={[0, 0.05, 0]} scale={[0.68, 0.48, 0.42]}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshStandardMaterial color={bodyColor} roughness={0.8} />
      </mesh>

      {/* Đầu */}
      <mesh position={[0, 0.72, 0.06]}>
        <sphereGeometry args={[0.46, 32, 32]} />
        <meshStandardMaterial color={bodyColor} roughness={0.78} />
      </mesh>

      {/* Tai mèo */}
      {isCat && (
        <>
          <group position={[-0.29, 1.07, 0.02]}>
            <mesh rotation={[0, 0, 0.12]}>
              <coneGeometry args={[0.17, 0.38, 4]} />
              <meshStandardMaterial color={bodyColor} />
            </mesh>
            <mesh position={[0, 0, 0.075]} scale={[0.5, 0.6, 0.3]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial color="#f3a1b5" />
            </mesh>
          </group>

          <group position={[0.29, 1.07, 0.02]}>
            <mesh rotation={[0, 0, -0.12]}>
              <coneGeometry args={[0.17, 0.38, 4]} />
              <meshStandardMaterial color={bodyColor} />
            </mesh>
            <mesh position={[0, 0, 0.075]} scale={[0.5, 0.6, 0.3]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial color="#f3a1b5" />
            </mesh>
          </group>
        </>
      )}

      {/* Tai chó */}
      {!isCat && (
        <>
          <group ref={leftEar} position={[-0.38, 0.72, 0]}>
            <mesh rotation={[0, 0, 0.25]} scale={[0.19, 0.34, 0.14]}>
              <sphereGeometry args={[1, 24, 24]} />
              <meshStandardMaterial color="#85512f" />
            </mesh>
          </group>

          <group ref={rightEar} position={[0.38, 0.72, 0]}>
            <mesh rotation={[0, 0, -0.25]} scale={[0.19, 0.34, 0.14]}>
              <sphereGeometry args={[1, 24, 24]} />
              <meshStandardMaterial color="#85512f" />
            </mesh>
          </group>
        </>
      )}

      {/* Mõm chó */}
      {!isCat && (
        <mesh position={[0, 0.55, 0.39]} scale={[0.25, 0.18, 0.15]}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshStandardMaterial color="#f5e5d2" />
        </mesh>
      )}

      {/* Mắt */}
      <Eye position={[-0.16, 0.76, 0.455]} />
      <Eye position={[0.16, 0.76, 0.455]} />

      {/* Mũi */}
      <mesh position={[0, isCat ? 0.62 : 0.64, 0.49]}>
        <sphereGeometry args={[isCat ? 0.045 : 0.065, 16, 16]} />
        <meshStandardMaterial color={isCat ? "#e98da7" : "#49302a"} />
      </mesh>

      {/* Bụng */}
      <mesh position={[0, -0.01, 0.34]} scale={[0.38, 0.28, 0.1]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial color="#fff5e8" />
      </mesh>

      {/* Bốn chân */}
      {[-0.38, 0.38].map((x) =>
        [-0.2, 0.2].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, -0.3, z]} scale={[1, 1.15, 1]}>
            <capsuleGeometry args={[0.095, 0.18, 4, 10]} />
            <meshStandardMaterial color={bodyColor} />
          </mesh>
        )),
      )}

      {/* Vòng cổ */}
      <mesh position={[0, 0.39, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.28, 0.04, 8, 32]} />
        <meshStandardMaterial
          color={accentColor}
          metalness={0.2}
          roughness={0.4}
        />
      </mesh>

      {/* Mặt dây chuyền */}
      <mesh position={[0, 0.32, 0.34]}>
        <sphereGeometry args={[0.065, 16, 16]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.4} />
      </mesh>

      {/* Đuôi */}
      <group position={[0.55, 0.2, -0.05]}>
        <mesh position={[0.13, 0.12, 0]} rotation={[0, 0, -0.75]}>
          <capsuleGeometry args={[0.065, 0.24, 4, 10]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
      </group>
    </group>
  );
}

export default function HeroPets3D() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="relative w-full h-full min-h-[340px]">
      <Canvas
        camera={{ position: [0, 1.5, 7], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        onPointerMissed={() => setSelected(null)}
      >
        <ambientLight intensity={1.7} />

        <directionalLight position={[4, 6, 5]} intensity={2.5} castShadow />

        <pointLight position={[-3, 2, 3]} intensity={18} color="#93c5fd" />

        <Float speed={1.4} rotationIntensity={0.08} floatIntensity={0.3}>
          <PetCharacter
            type="dog"
            position={[-1.05, -0.05, 0]}
            bodyColor="#c68a55"
            accentColor="#60a5fa"
            selected={selected === "dog"}
            onSelect={(type) =>
              setSelected((current) => (current === type ? null : type))
            }
          />
        </Float>

        <Float speed={1.7} rotationIntensity={0.08} floatIntensity={0.4}>
          <PetCharacter
            type="cat"
            position={[1.05, 0.05, 0]}
            bodyColor="#f1dfc4"
            accentColor="#fb923c"
            selected={selected === "cat"}
            onSelect={(type) =>
              setSelected((current) => (current === type ? null : type))
            }
          />
        </Float>

        <ContactShadows
          position={[0, -0.62, 0]}
          opacity={0.25}
          scale={5}
          blur={2.5}
          far={2}
        />
      </Canvas>

      <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
        <span className="rounded-full border border-white/20 bg-slate-900/40 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md">
          {selected === "dog"
            ? "🐶 Bạn đã chọn cún cưng!"
            : selected === "cat"
              ? "🐱 Bạn đã chọn mèo cưng!"
              : "Di chuột để khám phá · Click để tương tác"}
        </span>
      </div>
    </div>
  );
}
