import React, {
  forwardRef,
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import {
  Star,
  ChevronRight,
  Award,
  Heart,
  Shield,
  Users,
  Quote,
} from "lucide-react";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";
/* ======================================================================
   HELPERS
   ====================================================================== */

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const clamp01 = (v) => clamp(v, 0, 1);
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (v, a, b) => clamp01((v - a) / (b - a)); // 0..1 trong khoảng [a,b]
const smooth = (a, b, v) => {
  const t = seg(v, a, b);
  return t * t * (3 - 2 * t);
};
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

/* ======================================================================
   SCROLL STORE
   Một vòng requestAnimationFrame duy nhất đo scroll (đã làm mượt), tính
   tiến độ từng section + trọng số "chương" để cả 3D lẫn DOM cùng đọc.
   ====================================================================== */

const IDS = ["story", "team", "stats", "reviews", "cta"];
const N = IDS.length;

const S = {
  ys: 0, // scrollY đã làm mượt
  prev: 0,
  vel: 0, // vận tốc cuộn (px/frame, đã làm mượt)
  velN: 0, // vận tốc chuẩn hoá -3..3
  vh: 800,
  c: 0, // "chương" liên tục 0..4
  dark: 0,
  bg: "#f8fafc",
  w: [1, 0, 0, 0, 0], // trọng số hành vi 3D của từng section (tổng = 1)
  p: new Array(N).fill(0), // tiến độ trong lúc section được ghim (0..1)
  enter: new Array(N).fill(0), // tiến độ section trượt vào màn hình (0..1)
  tops: [],
  heights: [],
  mouse: { x: 0, y: 0, px: -9999, py: -9999 },
  sx: 0,
  sy: 0,
  ready: false,
};

const subs = new Set();
const PALETTE = ["#f8fafc", "#dbeafe", "#0f172a", "#fff7ed", "#1e3a8a"].map(
  (c) => new THREE.Color(c),
);
const DARK = [0, 0, 1, 0, 1];
const tmpColor = new THREE.Color();

function measure() {
  S.vh = window.innerHeight;
  IDS.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    const r = el.getBoundingClientRect();
    S.tops[i] = r.top + window.scrollY;
    S.heights[i] = r.height;
  });
  S.ready = S.tops.length === N && S.tops.every((v) => v !== undefined);
}

function step(dt) {
  if (!S.ready) return;
  S.ys += (window.scrollY - S.ys) * (1 - Math.exp(-dt * 9));
  const dy = (S.ys - S.prev) / Math.max(dt * 60, 0.2);
  S.prev = S.ys;
  S.vel += (dy - S.vel) * (1 - Math.exp(-dt * 10));
  S.velN = clamp(S.vel / 25, -3, 3);

  const mid = S.ys + S.vh / 2;
  let idx = 0;
  for (let i = 0; i < N; i++) {
    const top = S.tops[i];
    const h = S.heights[i];
    S.enter[i] = clamp01((S.ys + S.vh - top) / S.vh);
    S.p[i] = clamp01((S.ys - top) / Math.max(1, h - S.vh));
    if (mid >= top) idx = i;
  }
  const t = clamp01((mid - S.tops[idx]) / S.heights[idx]);
  S.c = clamp(idx + t - 0.5, 0, N - 1);

  let sum = 0;
  for (let i = 0; i < N; i++) {
    const raw = smooth(0.2, 0.8, clamp01(1 - Math.abs(S.c - i)));
    S.w[i] = raw;
    sum += raw;
  }
  for (let i = 0; i < N; i++) S.w[i] /= sum || 1;

  const a = Math.floor(S.c);
  const b = Math.min(a + 1, N - 1);
  const f = smooth(0.25, 0.75, S.c - a);
  tmpColor.copy(PALETTE[a]).lerp(PALETTE[b], f);
  S.bg = `#${tmpColor.getHexString()}`;
  S.dark = lerp(DARK[a], DARK[b], f);

  const mk = 1 - Math.exp(-dt * 5);
  S.sx += (S.mouse.x - S.sx) * mk;
  S.sy += (S.mouse.y - S.sy) * mk;
}

function startLoop() {
  measure();
  S.ys = S.prev = window.scrollY;
  let last = performance.now();
  let raf = requestAnimationFrame(function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    step(dt);
    subs.forEach((fn) => fn());
    raf = requestAnimationFrame(loop);
  });
  const onMove = (e) => {
    S.mouse.px = e.clientX;
    S.mouse.py = e.clientY;
    S.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    S.mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
  };
  const ro = new ResizeObserver(measure);
  ro.observe(document.body);
  window.addEventListener("resize", measure);
  window.addEventListener("mousemove", onMove);
  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    window.removeEventListener("resize", measure);
    window.removeEventListener("mousemove", onMove);
  };
}

function useTick(fn) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    const cb = () => ref.current();
    subs.add(cb);
    return () => subs.delete(cb);
  }, []);
}

/* ======================================================================
   3D — MÔ HÌNH PROCEDURAL
   ====================================================================== */

const Bone = forwardRef((props, ref) => (
  <group ref={ref} {...props}>
    <mesh rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.25, 0.25, 1.8, 32]} />
      <meshStandardMaterial color="#f8f9fa" roughness={0.4} />
    </mesh>
    {[
      [-0.9, 0.25],
      [-0.9, -0.25],
      [0.9, 0.25],
      [0.9, -0.25],
    ].map(([x, y], i) => (
      <mesh key={i} position={[x, y, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#f8f9fa" roughness={0.4} />
      </mesh>
    ))}
  </group>
));

const YarnBall = forwardRef((props, ref) => (
  <group ref={ref} {...props}>
    <mesh>
      <sphereGeometry args={[0.8, 64, 64]} />
      <meshStandardMaterial color="#f97316" roughness={0.7} />
    </mesh>
    <mesh rotation={[Math.PI / 4, 0, 0]}>
      <torusGeometry args={[0.81, 0.04, 16, 64]} />
      <meshStandardMaterial color="#ea580c" roughness={0.6} />
    </mesh>
    <mesh rotation={[0, Math.PI / 3, Math.PI / 4]}>
      <torusGeometry args={[0.82, 0.04, 16, 64]} />
      <meshStandardMaterial color="#ea580c" roughness={0.6} />
    </mesh>
    <mesh rotation={[Math.PI / 2, Math.PI / 6, 0]}>
      <torusGeometry args={[0.815, 0.04, 16, 64]} />
      <meshStandardMaterial color="#ea580c" roughness={0.6} />
    </mesh>
  </group>
));

const PawPrint = forwardRef((props, ref) => (
  <group ref={ref} {...props}>
    <mesh position={[0, -0.2, 0]} scale={[1, 0.85, 0.4]}>
      <sphereGeometry args={[0.7, 32, 32]} />
      <meshStandardMaterial color="#3b82f6" roughness={0.3} />
    </mesh>
    {[
      [-0.7, 0.6, 0.25, 0.3, 0.3],
      [-0.25, 1.0, 0.28, 0.1, 0.3],
      [0.25, 1.0, 0.28, -0.1, 0.3],
      [0.7, 0.6, 0.25, -0.3, 0.3],
    ].map(([x, y, r, rz], i) => (
      <mesh
        key={i}
        position={[x, y, 0]}
        scale={[1, 1.2, 0.5]}
        rotation={[0, 0, rz]}
      >
        <sphereGeometry args={[r, 32, 32]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.3} />
      </mesh>
    ))}
  </group>
));

function makeStarGeometry() {
  const shape = new THREE.Shape();
  const spikes = 5;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? 1 : 0.45;
    const a = (i / (spikes * 2)) * TAU - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: 0.35,
    bevelEnabled: true,
    bevelSize: 0.08,
    bevelThickness: 0.08,
    bevelSegments: 2,
  });
  g.center();
  return g;
}

/* ======================================================================
   3D — BA "NGƯỜI BẠN" ĐỔI HÀNH VI THEO TỪNG SECTION
     0  Câu chuyện : quỹ đạo quanh bên phải, bán kính nở ra theo scroll
     1  Đội ngũ    : con lắc treo từ trên, đung đưa theo vận tốc cuộn
     2  Con số     : vòng quay bị "scrub" trực tiếp bởi scroll + nhịp tim
     3  Đánh giá   : trôi dọc hai mép, một bé chạy ngang đáy màn hình
     4  Đặt lịch   : hội tụ quanh nút CTA rồi nổ tung ở cuối
   ====================================================================== */

const BASE_SCALE = [0.8, 1.2, 1.2];

function Companions() {
  const bone = useRef();
  const yarn = useRef();
  const paw = useRef();
  const objs = [bone, yarn, paw];
  const s0 = useRef();
  const s1 = useRef();
  const s2 = useRef();
  const strings = [s0, s1, s2];
  const phys = useRef([
    { th: 0, om: 0 },
    { th: 0, om: 0 },
    { th: 0, om: 0 },
  ]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const X = state.viewport.width;
    const Y = state.viewport.height;
    const narrow = X < 8;
    const k = narrow ? 0.7 : 1;
    const { w, p, velN } = S;

    for (let j = 0; j < 3; j++) {
      const g = objs[j].current;
      if (!g) continue;
      let x = 0;
      let y = 0;
      let z = 0;
      let sc = 0;

      // --- 0: quỹ đạo
      {
        const wk = w[0];
        const a = t * 0.5 + (j * TAU) / 3 + S.ys * 0.0015;
        const r = (1.5 + p[0] * 2.4) * k;
        const cx = narrow ? 0 : X * 0.24;
        const cy = narrow ? Y * 0.26 : 0;
        x += wk * (cx + Math.cos(a) * r * 1.25);
        y += wk * (cy + Math.sin(a) * r * 0.7);
        z += wk * Math.sin(a) * 1.5;
        sc += wk * (1 + p[0] * 0.25);
      }

      // --- 1: con lắc
      {
        const wk = w[1];
        const ph = phys.current[j];
        const target = Math.sin(t * 1.2 + j * 1.7) * 0.16;
        const push = velN * (j === 1 ? -1 : 1) * 2.4;
        ph.om += ((target - ph.th) * 18 - ph.om * 2.4 + push) * dt;
        ph.th = clamp(ph.th + ph.om * dt, -1, 1);
        const px = [-0.36, 0.36, 0][j] * X;
        const py = Y / 2 + 0.4;
        const L = 1.7 * k;
        const bx = px + Math.sin(ph.th) * L;
        const by = py - Math.cos(ph.th) * L;
        x += wk * bx;
        y += wk * by;
        z += wk * 0.2;
        sc += wk * 0.9;

        const s = strings[j].current;
        if (s) {
          const sw = wk * wk * wk;
          s.visible = sw > 0.01;
          s.position.set((px + bx) / 2, (py + by) / 2, 0.2);
          s.rotation.z = ph.th;
          s.scale.set(sw, L * sw, sw);
        }
      }

      // --- 2: vòng quay scrub theo scroll
      {
        const wk = w[2];
        const a = p[2] * TAU * 1.25 + (j * TAU) / 3 - 0.6;
        const beat = 1 + Math.pow(Math.abs(Math.sin(t * 3 + j)), 10) * 0.25;
        x += wk * Math.cos(a) * X * 0.38;
        y += wk * Math.sin(a) * Y * 0.33;
        z += wk * (Math.sin(a) * 1.2 - 0.5);
        sc += wk * beat;
      }

      // --- 3: trôi dọc mép / chạy ngang đáy
      {
        const wk = w[3];
        const q = p[3];
        let bx;
        let by;
        if (j === 0) {
          bx = -X * 0.42 + Math.sin(t * 0.8) * 0.25;
          by = lerp(Y * 0.3, -Y * 0.25, q);
        } else if (j === 1) {
          bx = X * 0.42 + Math.cos(t * 0.7) * 0.25;
          by = lerp(-Y * 0.25, Y * 0.3, q);
        } else {
          bx = lerp(-X * 0.42, X * 0.42, q);
          by = -Y * 0.4 + Math.sin(t * 2) * 0.15;
        }
        x += wk * bx;
        y += wk * by;
        z += wk * -0.5;
        sc += wk * 0.9;
      }

      // --- 4: hội tụ rồi nổ
      {
        const wk = w[4];
        const e = easeOut(seg(p[4], 0, 0.6));
        const burst = seg(p[4], 0.7, 1);
        const a = t * 0.9 + (j * TAU) / 3;
        const r = (lerp(X * 0.4, 2.3, e) + burst * 1.8) * (narrow ? 0.8 : 1);
        x += wk * Math.cos(a) * r * 1.5;
        y += wk * Math.sin(a) * r * 0.75;
        z += wk * (-1.5 + Math.sin(a));
        sc += wk * (1 + burst * 0.35);
      }

      y += Math.sin(t * 1.5 + j * 2) * 0.12;
      g.position.set(x, y, z);
      g.scale.setScalar(BASE_SCALE[j] * sc * k);

      const boost = 1 + Math.abs(velN) * 2;
      if (j === 0) {
        g.rotation.z += dt * 0.5 * boost;
        g.rotation.x += dt * 0.2 * boost;
      } else if (j === 1) {
        g.rotation.x -= dt * (1.2 + velN * 3);
        g.rotation.y += dt * 0.5 * boost;
      } else {
        g.rotation.z = Math.sin(t * 0.8) * 0.3 + velN * 0.15;
        g.rotation.y = Math.sin(t * 0.6) * 0.5;
        g.rotation.x = Math.cos(t * 0.5) * 0.2;
      }
    }
  });

  return (
    <>
      <Bone ref={bone} />
      <YarnBall ref={yarn} />
      <PawPrint ref={paw} />
      {strings.map((r, i) => (
        <mesh key={i} ref={r} visible={false}>
          <cylinderGeometry args={[0.014, 0.014, 1, 6]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>
      ))}
    </>
  );
}

/* ======================================================================
   3D — MƯA SAO (section 4) → bị hút vào tâm → pháo hoa (section 5)
   ====================================================================== */

const STAR_COUNT = 80;
const STAR_COLORS = ["#f97316", "#3b82f6", "#fbbf24", "#f472b6", "#38bdf8"];

function Confetti() {
  const ref = useRef();
  const phase = useRef(0);
  const geo = useMemo(makeStarGeometry, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }, () => {
        const ang = Math.random() * TAU;
        return {
          x: Math.random(),
          z: Math.random(),
          o: Math.random(),
          sp: 0.6 + Math.random() * 0.9,
          size: (0.1 + Math.random() * 0.16) * 1.3,
          spin: 0.6 + Math.random() * 2,
          color: Math.floor(Math.random() * STAR_COLORS.length),
          dx: Math.cos(ang),
          dy: Math.sin(ang),
          dz: (Math.random() - 0.5) * 1.2,
          bs: 0.5 + Math.random() * 0.8,
        };
      }),
    [],
  );

  useLayoutEffect(() => {
    const c = new THREE.Color();
    seeds.forEach((s, i) => {
      c.set(STAR_COLORS[s.color]);
      ref.current.setColorAt(i, c);
    });
    ref.current.instanceColor.needsUpdate = true;
  }, [seeds]);

  useFrame((state, delta) => {
    const m = ref.current;
    if (!m) return;
    const vis = S.w[3] + S.w[4];
    m.visible = vis > 0.01;
    if (!m.visible) return;

    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const X = state.viewport.width;
    const Y = state.viewport.height;
    // cuộn xuống → mưa nhanh hơn, cuộn lên → mưa bay ngược lên
    phase.current += dt * (0.5 + S.velN * 0.9);
    const mix = S.w[4] / vis;
    const bp = seg(S.p[4], 0.35, 1);

    for (let i = 0; i < STAR_COUNT; i++) {
      const s = seeds[i];
      const f = (((s.o + phase.current * s.sp * 0.3) % 1) + 1) % 1;
      const rx = (s.x - 0.5) * X * 1.1 + Math.sin(t * 1.5 + s.o * 9) * 0.3;
      const ry = Y / 2 + 1 - f * (Y + 2);
      const rz = (s.z - 0.5) * 4 - 0.5;

      const R = 0.5 + bp * X * 0.55 * s.bs;
      const bx = s.dx * R;
      const by = s.dy * R * 0.75 - bp * bp * 1.5;
      const bz = s.dz * R * 0.3 - 1;

      dummy.position.set(
        lerp(rx, bx, mix),
        lerp(ry, by, mix),
        lerp(rz, bz, mix),
      );
      dummy.rotation.set(t * s.spin + s.o * 6, t * s.spin * 0.7, s.o * 3);
      dummy.scale.setScalar(
        s.size * clamp01(vis * 1.6) * (1 - bp * 0.35 * mix),
      );
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={ref}
      args={[geo, undefined, STAR_COUNT]}
      frustumCulled={false}
      visible={false}
    >
      <meshStandardMaterial color="#ffffff" roughness={0.35} metalness={0.1} />
    </instancedMesh>
  );
}

function Scene() {
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const cam = state.camera;
    cam.position.x = THREE.MathUtils.damp(cam.position.x, S.sx * 0.5, 3, dt);
    cam.position.y = THREE.MathUtils.damp(cam.position.y, S.sy * 0.3, 3, dt);
    cam.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[6, 8, 5]} intensity={1.6} />
      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>
      <Companions />
      <Confetti />
    </>
  );
}

/* ======================================================================
   DOM — TIỆN ÍCH CHUNG
   ====================================================================== */

const Reveal = ({ ready, delay = 0, className = "", children }) => (
  <span
    className={`block transition-all duration-700 ease-out ${
      ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
    } ${className}`}
    style={{ transitionDelay: `${delay}ms` }}
  >
    {children}
  </span>
);

const Pinned = ({ id, height, className = "", children }) => (
  <section id={id} style={{ height }} className="relative">
    <div className={`sticky top-0 h-screen overflow-hidden ${className}`}>
      {children}
    </div>
  </section>
);

/* ======================================================================
   SECTION 1 — CÂU CHUYỆN: hai dòng tiêu đề trượt ngược chiều, thẻ mờ dần
   ====================================================================== */

function Hero() {
  const card = useRef();
  const l1 = useRef();
  const l2 = useRef();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setReady(true), 150);
    return () => clearTimeout(id);
  }, []);

  useTick(() => {
    const p = S.p[0];
    if (card.current) {
      const o = 1 - seg(p, 0.5, 0.95);
      card.current.style.transform = `translate3d(0,${-p * 160}px,0) scale(${1 - p * 0.1})`;
      card.current.style.opacity = o;
      card.current.style.pointerEvents = o < 0.05 ? "none" : "auto";
    }
    if (l1.current)
      l1.current.style.transform = `translate3d(${-p * 220}px,0,0)`;
    if (l2.current)
      l2.current.style.transform = `translate3d(${p * 220}px,0,0)`;
  });

  return (
    <Pinned id="story" height="200vh" className="flex items-center">
      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div
          ref={card}
          className="will-change-transform text-left space-y-6 md:space-y-8 bg-white/60 backdrop-blur-2xl p-6 md:p-12 rounded-3xl shadow-2xl border border-white/50"
        >
          <Reveal ready={ready} delay={0}>
            <span className="bg-blue-100 text-blue-600 text-sm font-bold px-4 py-2 rounded-full uppercase tracking-widest inline-flex items-center gap-2 shadow-sm">
              Câu chuyện thương hiệu 🐾
            </span>
          </Reveal>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-800 tracking-tight uppercase leading-[1.1]">
            <span ref={l1} className="block will-change-transform">
              <Reveal ready={ready} delay={150}>
                Nơi Trao Gửi
              </Reveal>
            </span>
            <span ref={l2} className="block will-change-transform">
              <Reveal ready={ready} delay={300}>
                <span className="text-orange-500 drop-shadow-sm">
                  Trọn Vẹn Yêu Thương
                </span>
              </Reveal>
            </span>
          </h1>

          <Reveal ready={ready} delay={450}>
            <p className="text-slate-700 text-base md:text-lg font-medium leading-relaxed">
              Được thành lập từ niềm đam mê lớn lao với thế giới thú cưng, chúng
              tôi tự hào xây dựng một hệ sinh thái chăm sóc toàn diện chuẩn hóa
              cao từ dịch vụ Spa dưỡng sinh đến chuỗi cung ứng sản phẩm thiết
              yếu chính hãng.
            </p>
          </Reveal>

          <Reveal ready={ready} delay={600}>
            <p className="text-slate-500 leading-relaxed border-l-4 border-blue-400 pl-4 italic">
              "Tại đây, mỗi chú cún, chú mèo không đơn thuần là thú nuôi, các bé
              là những thành viên gia đình xứng đáng nhận được sự tôn trọng và
              những điều tuyệt vời nhất."
            </p>
          </Reveal>

          <Reveal ready={ready} delay={750}>
            <div className="pt-2 flex flex-wrap gap-4">
              <button className="group bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg hover:shadow-blue-500/30 flex items-center gap-2">
                Đặt Dịch Vụ Ngay
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-white border-2 border-slate-200 text-slate-700 hover:border-orange-500 hover:text-orange-500 font-bold px-8 py-4 rounded-2xl transition-all shadow-sm">
                Ghé Cửa Hàng
              </button>
            </div>
          </Reveal>
        </div>
        <div className="hidden lg:block" />
      </div>
    </Pinned>
  );
}

/* ======================================================================
   SECTION 2 — ĐỘI NGŨ: bộ bài xếp chồng xoè ra thành hàng, vòng viền xoay
   ====================================================================== */

const STAFF = [
  {
    name: "Minh Anh",
    role: "Master Groomer",
    exp: "5 năm kinh nghiệm",
    img: "https://i.pravatar.cc/150?img=47",
  },
  {
    name: "Bs. Tuấn Tú",
    role: "Trưởng Khoa Thú Y",
    exp: "8 năm kinh nghiệm",
    img: "https://i.pravatar.cc/150?img=11",
  },
  {
    name: "Lan Hương",
    role: "Chuyên Gia Dinh Dưỡng",
    exp: "4 năm kinh nghiệm",
    img: "https://i.pravatar.cc/150?img=44",
  },
];

function Team() {
  const head = useRef();
  const cards = useRef([]);
  const rings = useRef([]);
  const details = useRef([]);

  useTick(() => {
    const p = S.p[1];
    const en = S.enter[1];
    const narrow = window.innerWidth < 768;

    if (head.current) {
      const e = easeOut(seg(en, 0.35, 1));
      head.current.style.opacity = e;
      head.current.style.transform = `translate3d(0,${(1 - e) * 60}px,0)`;
    }

    STAFF.forEach((_, i) => {
      const el = cards.current[i];
      if (!el) return;
      const f = easeOut(seg(p, i * 0.07, 0.45 + i * 0.07));
      const off = (i - 1) * (1 - f); // 0 khi đã xoè hết
      const wave = Math.sin(S.ys * 0.004 + i * 1.3) * 8 * f; // nhún theo scroll
      const gap = narrow ? 16 : 32;
      const tx = narrow ? "0px" : `calc(${-off * 100}% + ${-off * gap}px)`;
      const ty = narrow
        ? `calc(${-off * 100}% + ${-off * gap + wave}px)`
        : `${wave}px`;
      el.style.transform = `translate3d(${tx}, ${ty}, 0) rotate(${off * 9}deg) scale(${0.9 + 0.1 * f})`;
      el.style.opacity = clamp01(seg(en, 0.45, 0.9));

      const ring = rings.current[i];
      if (ring) ring.style.transform = `rotate(${p * 720 + i * 90}deg)`;

      const d = details.current[i];
      if (d) {
        const q = seg(p, 0.3 + i * 0.07, 0.55 + i * 0.07);
        d.style.opacity = q;
        d.style.transform = `translate3d(0,${(1 - q) * 16}px,0)`;
      }
    });
  });

  return (
    <Pinned
      id="team"
      height="300vh"
      className="flex flex-col justify-center pt-20 md:pt-24"
    >
      <div className="max-w-7xl mx-auto px-6 w-full">
        <div
          ref={head}
          className="text-center mb-8 md:mb-14 space-y-3 will-change-transform"
        >
          <h2 className="text-3xl md:text-4xl font-black uppercase text-slate-800">
            Đội Ngũ <span className="text-blue-600">Chuyên Gia</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-base md:text-lg">
            Những trái tim yêu thương thú cưng cùng đôi bàn tay điêu luyện, mang
            lại trải nghiệm tuyệt vời nhất cho các bé.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {STAFF.map((s, i) => (
            <div
              key={i}
              ref={(el) => (cards.current[i] = el)}
              style={{ zIndex: i === 1 ? 3 : 2 }}
              className="will-change-transform bg-white/85 backdrop-blur-lg rounded-3xl p-4 md:p-8 shadow-xl border border-white/50 flex md:flex-col items-center gap-4 text-left md:text-center"
            >
              <div className="relative w-16 h-16 md:w-32 md:h-32 shrink-0 md:mb-2">
                <div
                  ref={(el) => (rings.current[i] = el)}
                  className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 via-sky-300 to-orange-500 shadow-inner"
                />
                <img
                  src={s.img}
                  alt={s.name}
                  className="absolute inset-1.5 md:inset-2 w-[calc(100%-0.75rem)] md:w-[calc(100%-1rem)] h-[calc(100%-0.75rem)] md:h-[calc(100%-1rem)] object-cover rounded-full border-4 border-white"
                />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-800 md:mb-2">
                  {s.name}
                </h3>
                <div
                  ref={(el) => (details.current[i] = el)}
                  className="space-y-2"
                >
                  <p className="text-blue-600 font-semibold">{s.role}</p>
                  <div className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 text-sm px-3 py-1 rounded-full">
                    <Award className="w-4 h-4 text-orange-500" />
                    {s.exp}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Pinned>
  );
}

/* ======================================================================
   SECTION 3 — CON SỐ: panel kính nở ra, bộ đếm chạy, chữ khổng lồ chạy ngang
   ====================================================================== */

const STATS = [
  {
    icon: Heart,
    color: "text-orange-400",
    value: 5000,
    suffix: "+",
    label: "Thú Cưng Được Chăm Sóc",
  },
  {
    icon: Shield,
    color: "text-blue-400",
    value: 10,
    suffix: "+",
    label: "Năm Kinh Nghiệm",
  },
  {
    icon: Users,
    color: "text-orange-400",
    value: 99,
    suffix: "%",
    label: "Khách Hàng Hài Lòng",
  },
];

function Stats() {
  const panel = useRef();
  const big = useRef();
  const nums = useRef([]);
  const bars = useRef([]);
  const icons = useRef([]);
  const cols = useRef([]);

  useTick(() => {
    const p = S.p[2];
    const en = S.enter[2];
    const t = performance.now() / 1000;

    if (panel.current) {
      const e = easeOut(seg(en, 0.25, 1));
      panel.current.style.transform = `scale(${lerp(0.75, 1, e)})`;
      panel.current.style.borderRadius = `${lerp(160, 48, e)}px`;
      panel.current.style.opacity = e;
    }
    if (big.current)
      big.current.style.transform = `translate3d(${lerp(5, -60, p)}vw,0,0)`;

    STATS.forEach((s, i) => {
      const q = easeOut(seg(p, 0.05 + i * 0.14, 0.5 + i * 0.14));
      const n = nums.current[i];
      if (n) {
        const txt = `${Math.round(s.value * q)}${s.suffix}`;
        if (n.textContent !== txt) n.textContent = txt;
      }
      const b = bars.current[i];
      if (b) b.style.width = `${q * 100}%`;
      const ic = icons.current[i];
      if (ic)
        ic.style.transform = `rotate(${p * 360 * (i % 2 ? -1 : 1)}deg) scale(${1 + Math.sin(t * 3 + i) * 0.08})`;
      const c = cols.current[i];
      if (c) {
        const r = seg(p, i * 0.1, 0.3 + i * 0.1);
        c.style.opacity = 0.2 + 0.8 * r;
        c.style.transform = `translate3d(0,${(1 - r) * 40}px,0)`;
      }
    });
  });

  return (
    <Pinned id="stats" height="300vh" className="flex items-center">
      <div
        ref={big}
        className="absolute left-0 top-[8%] whitespace-nowrap font-black uppercase leading-none select-none pointer-events-none text-[16vw]"
        style={{
          WebkitTextStroke: "2px rgba(255,255,255,0.09)",
          color: "transparent",
        }}
      >
        Pet Love • Pet Love • Pet Love • Pet Love
      </div>

      <div className="max-w-6xl mx-auto px-6 w-full relative">
        <p className="text-center text-blue-200/70 uppercase tracking-[0.3em] text-xs md:text-sm font-bold mb-6">
          Những con số biết nói
        </p>
        <div
          ref={panel}
          className="relative will-change-transform bg-white/[0.06] backdrop-blur-xl border border-white/15 p-6 md:p-16 shadow-2xl overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />

          <div className="relative z-10 grid grid-cols-3 gap-2 md:gap-12 divide-x divide-white/10">
            {STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={i}
                  ref={(el) => (cols.current[i] = el)}
                  className="text-center px-1 md:px-6"
                >
                  <div
                    ref={(el) => (icons.current[i] = el)}
                    className="inline-block mb-3 md:mb-6"
                  >
                    <Icon className={`w-8 h-8 md:w-12 md:h-12 ${s.color}`} />
                  </div>
                  <div
                    ref={(el) => (nums.current[i] = el)}
                    className="text-3xl sm:text-4xl md:text-6xl font-black text-white mb-2 tabular-nums"
                  >
                    0{s.suffix}
                  </div>
                  <div className="text-blue-200 text-xs md:text-lg font-medium leading-snug">
                    {s.label}
                  </div>
                  <div className="mt-3 md:mt-4 h-1 w-full max-w-[8rem] mx-auto bg-white/10 rounded-full overflow-hidden">
                    <div
                      ref={(el) => (bars.current[i] = el)}
                      className="h-full bg-gradient-to-r from-blue-400 to-orange-400 rounded-full"
                      style={{ width: 0 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Pinned>
  );
}

/* ======================================================================
   SECTION 4 — ĐÁNH GIÁ: thẻ bay vào từ hai phía, chữ hiện từng từ,
   sao sáng lần lượt, thẻ lắc theo vận tốc cuộn
   ====================================================================== */

const REVIEWS = [
  {
    name: "Nguyễn Hà",
    pet: "Mẹ bé Corgi Bông",
    text: "Dịch vụ spa ở đây thực sự tuyệt vời! Bé Bông nhà mình bình thường rất nhát nước nhưng các bạn nhân viên tắm cực kỳ khéo léo. Bé về nhà thơm tho rạng rỡ hẳn.",
  },
  {
    name: "Trần Quang",
    pet: "Ba bé Mèo Tom",
    text: "Mình rất an tâm khi gửi gắm Tom ở đây. Cửa hàng bán đầy đủ phụ kiện chính hãng, bác sĩ tư vấn dinh dưỡng rất tận tình. Chắc chắn sẽ ủng hộ lâu dài!",
  },
];

function ReviewCard({ review, i, a, b }) {
  const card = useRef();
  const quote = useRef();
  const words = useRef([]);
  const stars = useRef([]);
  const dir = i === 0 ? -1 : 1;

  useEffect(() => {
    words.current = Array.from(card.current.querySelectorAll("[data-w]"));
  }, []);

  useTick(() => {
    const p = S.p[3];
    const e = easeOut(seg(p, a, a + 0.28));
    const wob = S.velN * dir * 1.6;
    if (card.current) {
      card.current.style.transform = `translate3d(${dir * (1 - e) * 55}vw,${(1 - e) * 40}px,0) rotate(${dir * (1 - e) * 10 + wob}deg)`;
      card.current.style.opacity = e;
    }
    if (quote.current)
      quote.current.style.transform = `rotate(${p * 90 * dir}deg)`;

    const r = seg(p, a + 0.1, b);
    const len = words.current.length;
    words.current.forEach((w, k) => {
      w.style.opacity = 0.12 + 0.88 * clamp01(r * (len + 2) - k);
    });
    stars.current.forEach((sp, k) => {
      if (!sp) return;
      const on = r * 5 > k + 0.2;
      const svg = sp.firstChild;
      if (svg) {
        svg.style.fill = on ? "#fb923c" : "transparent";
        svg.style.color = on ? "#fb923c" : "#cbd5e1";
      }
      sp.style.transform = `scale(${on ? 1 : 0.8})`;
    });
  });

  return (
    <div
      ref={card}
      className="will-change-transform bg-white/90 backdrop-blur-xl p-6 md:p-10 rounded-3xl shadow-xl border-t-4 border-blue-500 relative"
    >
      <div ref={quote} className="absolute top-4 right-6 md:top-6 md:right-8">
        <Quote className="w-10 h-10 md:w-12 md:h-12 text-blue-100" />
      </div>
      <div className="flex gap-1 mb-4 md:mb-6">
        {[0, 1, 2, 3, 4].map((k) => (
          <span
            key={k}
            ref={(el) => (stars.current[k] = el)}
            className="inline-block transition-transform duration-300"
          >
            <Star className="w-6 h-6" />
          </span>
        ))}
      </div>
      <p className="text-slate-600 text-base md:text-lg italic mb-6 md:mb-8 relative z-10 leading-relaxed">
        "
        {review.text.split(" ").map((w, k) => (
          <span
            key={k}
            data-w
            className="inline-block mr-[0.25em]"
            style={{ opacity: 0.12 }}
          >
            {w}
          </span>
        ))}
        "
      </p>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold text-xl">
          {review.name.charAt(0)}
        </div>
        <div>
          <h4 className="font-bold text-slate-800">{review.name}</h4>
          <p className="text-sm text-slate-500">{review.pet}</p>
        </div>
      </div>
    </div>
  );
}

function Reviews() {
  const head = useRef();
  useTick(() => {
    if (!head.current) return;
    const e = easeOut(seg(S.enter[3], 0.35, 1));
    head.current.style.opacity = e;
    head.current.style.transform = `translate3d(0,${(1 - e) * 50}px,0)`;
  });

  return (
    <Pinned
      id="reviews"
      height="300vh"
      className="flex flex-col justify-center"
    >
      <div className="max-w-7xl mx-auto px-6 w-full">
        <div ref={head} className="text-center mb-8 md:mb-14">
          <h2 className="text-3xl md:text-4xl font-black uppercase text-slate-800">
            Lời Thì Thầm <span className="text-orange-500">Từ Sen</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 max-w-5xl mx-auto">
          <ReviewCard review={REVIEWS[0]} i={0} a={0.0} b={0.55} />
          <ReviewCard review={REVIEWS[1]} i={1} a={0.25} b={0.9} />
        </div>
      </div>
    </Pinned>
  );
}

/* ======================================================================
   SECTION 5 — CTA: vòng tròn "iris" mở rộng, từng chữ rơi vào,
   nút CTA có từ tính theo con trỏ, 3D hội tụ rồi nổ
   ====================================================================== */

const CTA_WORDS = ["Sẵn", "Sàng", "Để", "Trải", "Nghiệm?"];

function CTA() {
  const navigate = useNavigate();
  const iris = useRef();
  const words = useRef([]);
  const sub = useRef();
  const btnWrap = useRef();
  const btn = useRef();
  const mag = useRef({ x: 0, y: 0 });

  useTick(() => {
    const en = S.enter[4];
    const p = S.p[4];
    const u = clamp01(en * 0.55 + p * 0.9);

    if (iris.current) {
      iris.current.style.clipPath = `circle(${lerp(0, 150, easeOut(seg(en, 0.15, 1)))}% at 50% 55%)`;
    }
    CTA_WORDS.forEach((_, i) => {
      const el = words.current[i];
      if (!el) return;
      const e = easeOut(seg(u, 0.2 + i * 0.08, 0.5 + i * 0.08));
      el.style.opacity = e;
      el.style.transform = `translate3d(0,${(1 - e) * 80}px,0) rotate(${(1 - e) * (i % 2 ? 6 : -6)}deg) scale(${1 + (1 - e) * 0.5})`;
    });
    if (sub.current) {
      const q = seg(u, 0.55, 0.8);
      sub.current.style.opacity = q;
      sub.current.style.transform = `translate3d(0,${(1 - q) * 20}px,0)`;
    }
    if (btnWrap.current && btn.current) {
      const r = btnWrap.current.getBoundingClientRect();
      const dx = S.mouse.px - (r.left + r.width / 2);
      const dy = S.mouse.py - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy);
      const pull = dist < 220 ? 1 - dist / 220 : 0;
      mag.current.x += (dx * pull * 0.35 - mag.current.x) * 0.15;
      mag.current.y += (dy * pull * 0.35 - mag.current.y) * 0.15;
      const sc = (0.8 + 0.2 * seg(u, 0.7, 0.95)) * (1 + 0.08 * seg(p, 0.5, 1));
      btn.current.style.transform = `translate3d(${mag.current.x}px,${mag.current.y}px,0) scale(${sc})`;
      btn.current.style.opacity = seg(u, 0.65, 0.85);
    }
  });

  return (
    <Pinned
      id="cta"
      height="200vh"
      className="flex items-center justify-center"
    >
      <div
        ref={iris}
        className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900"
        style={{ clipPath: "circle(0% at 50% 55%)" }}
      />
      <div className="relative z-10 max-w-4xl mx-auto px-6 w-full text-center">
        <h2 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase text-white mb-6 leading-tight">
          {CTA_WORDS.map((w, i) => (
            <span
              key={i}
              ref={(el) => (words.current[i] = el)}
              className="inline-block mx-[0.15em] will-change-transform"
            >
              {w}
            </span>
          ))}
        </h2>
        <p
          ref={sub}
          className="text-blue-100 mb-10 max-w-2xl mx-auto text-base md:text-lg"
        >
          Hãy để chúng tôi chăm sóc những người bạn nhỏ của bạn một cách tốt
          nhất. Đặt lịch ngay hôm nay để nhận ưu đãi đặc biệt!
        </p>
        <div ref={btnWrap} className="inline-block relative">
          <span className="absolute inset-0 rounded-full bg-orange-400/60 animate-ping" />
          <button
            ref={btn}
            onClick={() => navigate("/spa/booking/create")}
            className="relative bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-10 py-5 rounded-full shadow-lg hover:shadow-orange-500/30 will-change-transform"
          >
            Đặt Lịch Ngay Hôm Nay
          </button>
        </div>
      </div>
      <p className="absolute bottom-6 inset-x-0 text-center text-blue-200/70 text-sm">
        © 2026 Pet Spa & Shop. All rights reserved.
      </p>
    </Pinned>
  );
}

/* ======================================================================
   ĐIỀU HƯỚNG + GỢI Ý CUỘN + NỀN
   ====================================================================== */

const NAV_LABELS = ["Câu chuyện", "Đội ngũ", "Con số", "Đánh giá", "Đặt lịch"];

function Nav() {
  const dots = useRef([]);
  const hint = useRef();

  useTick(() => {
    const active = Math.round(S.c);
    dots.current.forEach((d, i) => {
      if (!d) return;
      const on = i === active;
      d.style.height = on ? "28px" : "8px";
      d.style.background =
        S.dark > 0.5
          ? on
            ? "#fb923c"
            : "rgba(255,255,255,.35)"
          : on
            ? "#f97316"
            : "rgba(15,23,42,.25)";
    });
    if (hint.current) hint.current.style.opacity = 1 - seg(S.ys, 20, 160);
  });

  return (
    <>
      <nav className="fixed right-3 md:right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3">
        {NAV_LABELS.map((label, i) => (
          <button
            key={i}
            ref={(el) => (dots.current[i] = el)}
            aria-label={label}
            title={label}
            onClick={() =>
              window.scrollTo({ top: S.tops[i] ?? 0, behavior: "smooth" })
            }
            className="w-2 rounded-full transition-all duration-300"
            style={{ height: 8 }}
          />
        ))}
      </nav>

      <div
        ref={hint}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center animate-bounce"
      >
        <span className="text-slate-400 text-sm font-medium mb-2 tracking-widest uppercase">
          Cuộn xuống
        </span>
        <div className="w-6 h-10 border-2 border-slate-300 rounded-full flex justify-center p-1 shadow-sm bg-white/50 backdrop-blur-sm">
          <div className="w-1.5 h-3 bg-blue-500 rounded-full" />
        </div>
      </div>
    </>
  );
}

function Backdrop({ children }) {
  const ref = useRef();
  useTick(() => {
    if (ref.current) ref.current.style.backgroundColor = S.bg;
  });
  return (
    <div
      ref={ref}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ backgroundColor: "#f8fafc" }}
    >
      {children}
    </div>
  );
}

/* ======================================================================
   APP
   ====================================================================== */

export default function App() {
  useEffect(() => startLoop(), []);

  return (
    <>
      <Backdrop>
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 1.75]}>
          <Scene />
        </Canvas>
      </Backdrop>

      <main className="relative z-10 font-sans text-slate-800">
        <Hero />
        <Team />
        <Stats />
        <Reviews />
        <CTA />
      </main>

      <Nav />
    </>
  );
}
