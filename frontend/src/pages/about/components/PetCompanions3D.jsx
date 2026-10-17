import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

const COLORS = {
  cream: "#f6e4c8",
  brown: "#a86f45",
  darkBrown: "#543626",
  pink: "#f59cab",
  white: "#fffaf2",
  blue: "#60a5fa",
  orange: "#fb923c",
  ground: "#f0f7ff",
};

function Eye({ position }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.055, 16, 16]} />
      <meshStandardMaterial color="#241b19" roughness={0.3} />
    </mesh>
  );
}

function Cat({ onSelect, selected, hovered, setHovered }) {
  const root = useRef();
  const tail = useRef();

  useFrame((state, delta) => {
    if (!root.current) return;

    root.current.position.y =
      -0.15 + Math.sin(state.clock.elapsedTime * 2.2) * 0.07;

    root.current.rotation.y +=
      ((hovered ? 0.18 : 0) - root.current.rotation.y) *
      Math.min(delta * 4, 1);

    if (tail.current) {
      tail.current.rotation.z =
        Math.sin(state.clock.elapsedTime * 2.5) * 0.18;
    }
  });

  return (
    <group
      ref={root}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
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
      scale={selected ? 1.12 : hovered ? 1.06 : 1}
    >
      {/* Thân mèo */}
      <mesh position={[0, 0.12, 0]} scale={[0.72, 0.48, 0.42]}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshStandardMaterial color={COLORS.cream} roughness={0.8} />
      </mesh>

      {/* Đầu */}
      <mesh position={[0, 0.78, 0.04]}>
        <sphereGeometry args={[0.48, 32, 32]} />
        <meshStandardMaterial color={COLORS.cream} roughness={0.75} />
      </mesh>

      {/* Tai trái và phải */}
      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[side * 0.3, 1.12, 0.03]}
          rotation={[0, 0, -side * 0.15]}
        >
          <mesh>
            <coneGeometry args={[0.19, 0.42, 4]} />
            <meshStandardMaterial color={COLORS.cream} />
          </mesh>
          <mesh position={[0, -0.015, 0.085]} scale={[0.55, 0.65, 0.35]}>
            <sphereGeometry args={[0.13, 16, 16]} />
            <meshStandardMaterial color={COLORS.pink} />
          </mesh>
        </group>
      ))}

      {/* Mắt */}
      <Eye position={[-0.17, 0.82, 0.445]} />
      <Eye position={[0.17, 0.82, 0.445]} />

      {/* Mũi */}
      <mesh position={[0, 0.68, 0.48]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color={COLORS.pink} />
      </mesh>

      {/* Mõm */}
      <mesh position={[0, 0.61, 0.45]} scale={[0.18, 0.1, 0.1]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={COLORS.white} />
      </mesh>

      {/* Râu mèo */}
      {[-1, 1].map((side) => (
        <group key={side}>
          {[-0.03, 0.025].map((offset) => (
            <mesh
              key={offset}
              position={[side * 0.29, 0.66 + offset, 0.43]}
              rotation={[0, 0, side * 0.12]}
              scale={[0.18, 0.008, 0.008]}
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#9a8069" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Chân */}
      {[-0.38, 0.38].map((x) =>
        [-0.22, 0.22].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, -0.25, z]}>
            <capsuleGeometry args={[0.095, 0.22, 4, 8]} />
            <meshStandardMaterial color={COLORS.cream} />
          </mesh>
        ))
      )}

      {/* Đuôi */}
      <group ref={tail} position={[0.58, 0.22, -0.08]}>
        <mesh
          position={[0.18, 0.13, 0]}
          rotation={[0, 0, -0.8]}
        >
          <capsuleGeometry args={[0.075, 0.35, 4, 10]} />
          <meshStandardMaterial color={COLORS.cream} />
        </mesh>
      </group>

      {/* Vòng cổ */}
      <mesh position={[0, 0.42, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.29, 0.045, 8, 32]} />
        <meshStandardMaterial color={COLORS.pink} />
      </mesh>
    </group>
  );
}

function Dog({ onSelect, selected, hovered, setHovered }) {
  const root = useRef();
  const ears = useRef();

  useFrame((state, delta) => {
    if (!root.current) return;

    root.current.position.y =
      -0.15 + Math.sin(state.clock.elapsedTime * 2.5 + 1) * 0.07;

    root.current.rotation.y +=
      ((hovered ? -0.18 : 0) - root.current.rotation.y) *
      Math.min(delta * 4, 1);

    if (ears.current) {
      ears.current.rotation.z =
        Math.sin(state.clock.elapsedTime * 3) * 0.08;
    }
  });

  return (
    <group
      ref={root}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
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
      scale={selected ? 1.12 : hovered ? 1.06 : 1}
    >
      {/* Thân chó */}
      <mesh position={[0, 0.12, 0]} scale={[0.75, 0.48, 0.43]}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshStandardMaterial color={COLORS.brown} roughness={0.85} />
      </mesh>

      {/* Bụng */}
      <mesh position={[0, 0.04, 0.32]} scale={[0.43, 0.3, 0.12]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial color={COLORS.cream} />
      </mesh>

      {/* Đầu */}
      <mesh position={[0, 0.78, 0.05]}>
        <sphereGeometry args={[0.49, 32, 32]} />
        <meshStandardMaterial color={COLORS.brown} roughness={0.8} />
      </mesh>

      {/* Tai mềm */}
      <group ref={ears}>
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * 0.42, 0.78, 0.02]}
            rotation={[0, 0, side * 0.35]}
            scale={[0.2, 0.34, 0.13]}
          >
            <sphereGeometry args={[1, 24, 24]} />
            <meshStandardMaterial color={COLORS.darkBrown} />
          </mesh>
        ))}
      </group>

      {/* Mõm */}
      <mesh position={[0, 0.61, 0.44]} scale={[0.27, 0.21, 0.18]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial color={COLORS.cream} />
      </mesh>

      {/* Mũi */}
      <mesh position={[0, 0.69, 0.6]}>
        <sphereGeometry args={[0.09, 20, 20]} />
        <meshStandardMaterial color={COLORS.darkBrown} />
      </mesh>

      {/* Mắt */}
      <Eye position={[-0.18, 0.84, 0.48]} />
      <Eye position={[0.18, 0.84, 0.48]} />

      {/* Chân */}
      {[-0.4, 0.4].map((x) =>
        [-0.22, 0.22].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, -0.25, z]}>
            <capsuleGeometry args={[0.11, 0.2, 4, 8]} />
            <meshStandardMaterial color={COLORS.brown} />
          </mesh>
        ))
      )}

      {/* Đuôi */}
      <mesh
        position={[0.7, 0.35, -0.08]}
        rotation={[0, 0, -0.8]}
      >
        <capsuleGeometry args={[0.075, 0.3, 4, 10]} />
        <meshStandardMaterial color={COLORS.brown} />
      </mesh>

      {/* Vòng cổ */}
      <mesh position={[0, 0.43, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.045, 8, 32]} />
        <meshStandardMaterial color={COLORS.blue} />
      </mesh>

      {/* Mặt dây chuyền */}
      <mesh position={[0, 0.37, 0.36]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial
          color={COLORS.orange}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}

function PetStage({ selectedPet, setSelectedPet }) {
  const [hoveredPet, setHoveredPet] = useState(null);

  return (
    <>
      <color attach="background" args={["#f3f8ff"]} />

      <ambientLight intensity={1.8} />

      <directionalLight
        position={[4, 6, 5]}
        intensity={2.5}
        castShadow
      />

      <pointLight
        position={[-3, 3, 2]}
        intensity={12}
        color="#bfdbfe"
      />

      {/* Sàn */}
      <mesh
        position={[0, -0.58, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[3.5, 64]} />
        <meshStandardMaterial color={COLORS.ground} roughness={1} />
      </mesh>

      {/* Chó bên trái */}
      <group position={[-1.15, 0, 0]}>
        <Dog
          selected={selectedPet === "dog"}
          hovered={hoveredPet === "dog"}
          setHovered={(value) =>
            setHoveredPet(value ? "dog" : null)
          }
          onSelect={() =>
            setSelectedPet((current) =>
              current === "dog" ? null : "dog"
            )
          }
        />
      </group>

      {/* Mèo bên phải */}
      <group position={[1.15, 0, 0]}>
        <Cat
          selected={selectedPet === "cat"}
          hovered={hoveredPet === "cat"}
          setHovered={(value) =>
            setHoveredPet(value ? "cat" : null)
          }
          onSelect={() =>
            setSelectedPet((current) =>
              current === "cat" ? null : "cat"
            )
          }
        />
      </group>

      <OrbitControls
        target={[0, 0.15, 0]}
        enablePan={false}
        minDistance={4}
        maxDistance={9}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
}

export default function PetCompanions3D({
  height = 440,
  className = "",
}) {
  const [selectedPet, setSelectedPet] = useState(null);

  const petName =
    selectedPet === "dog"
      ? "Cún cưng"
      : selectedPet === "cat"
        ? "Mèo cưng"
        : null;

  return (
    <div className={`relative w-full overflow-hidden rounded-3xl ${className}`}>
      <div style={{ width: "100%", height }}>
        <Canvas
          camera={{ position: [0, 2.3, 7], fov: 42 }}
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: false }}
        >
          <PetStage
            selectedPet={selectedPet}
            setSelectedPet={setSelectedPet}
          />
        </Canvas>
      </div>

      {/* Chú thích và trạng thái tương tác */}
      <div className="absolute top-4 left-0 right-0 flex justify-center gap-3 pointer-events-none">
        <span className="rounded-full bg-white/90 backdrop-blur px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">
          🐶 Cún cưng
        </span>
        <span className="rounded-full bg-white/90 backdrop-blur px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">
          🐱 Mèo cưng
        </span>
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
        <span className="rounded-full bg-white/90 backdrop-blur px-4 py-2 text-xs font-medium text-slate-600 shadow-sm">
          {petName
            ? `Bạn đã chọn ${petName} ♥`
            : "Di chuột hoặc click vào các bé để tương tác"}
        </span>
      </div>
    </div>
  );
}
