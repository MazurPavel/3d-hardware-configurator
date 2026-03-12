"use client";

import { Canvas } from "@react-three/fiber";
import {
  Center,
  ContactShadows,
  OrbitControls,
  useGLTF,
  Environment
} from "@react-three/drei";
import { Suspense, useEffect, useMemo, useState } from "react";

type Option = {
  id: number;
  name: string;
  priceDelta: number;
  perfScore: number;
};

type ComponentType = {
  id: number;
  name: string;
  key: string;
  description: string;
  options: Option[];
};

type Device = {
  id: number;
  name: string;
  slug: string;
  basePrice: number;
  bodyColor: string;
  components: ComponentType[];
};

type PartKey = "body";

function LaptopModel({
  onSelectPart,
}: {
  onSelectPart: (part: PartKey) => void;
}) {
  const { scene } = useGLTF("/models/laptop.glb");
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const [hovered, setHovered] = useState(false);

  return (
    <Center>
      <group
        scale={hovered ? 0.032 : 0.03}
        position={[0, -0.4, 0]}
        rotation={[0, -0.6, 0]}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
          setHovered(true);
        }}  
        onPointerOut={() => {
          document.body.style.cursor = "default";
          setHovered(false);
        }}  
  
      
      >
        <primitive object={clonedScene} />
      </group>
    </Center>
  );
}

useGLTF.preload("/models/laptop.glb");

export default function Home() {
  const [device, setDevice] = useState<Device | null>(null);
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [totalPerf, setTotalPerf] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [selectedPart, setSelectedPart] = useState<PartKey | null>(null);

  useEffect(() => {
    async function loadDevice() {
      try {
        const res = await fetch("/api/device");
        const data = await res.json();
        setDevice(data);

        if (data?.components) {
          const initialSelections: Record<string, number> = {};
          for (const component of data.components) {
            if (component.options?.length > 0) {
              initialSelections[component.key] = component.options[0].id;
            }
          }
          setSelections(initialSelections);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadDevice();
  }, []);

  useEffect(() => {
    async function calculate() {
      if (!device || Object.keys(selections).length === 0) return;

      try {
        const res = await fetch("/api/calculate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            deviceId: device.id,
            selections,
          }),
        });

        const data = await res.json();
        setTotalPrice(data.totalPrice ?? 0);
        setTotalPerf(data.totalPerf ?? 0);
      } catch (error) {
        console.error(error);
      }
    }

    calculate();
  }, [device, selections]);

  const cpu = useMemo(
    () => device?.components.find((c) => c.key === "cpu"),
    [device]
  );

  const ram = useMemo(
    () => device?.components.find((c) => c.key === "ram"),
    [device]
  );

  const storage = useMemo(
    () => device?.components.find((c) => c.key === "storage"),
    [device]
  );

  const selectedPartInfo = useMemo(() => {
    if (selectedPart === "body") {
      return {
        name: "Laptop Chassis",
        description:
          "Main external laptop model loaded from a GLB asset and used as the primary 3D product representation.",
      };
    }
    return null;
  }, [selectedPart]);

  async function saveConfiguration() {
  if (!device) return;

  try {
    setSaving(true);

    const res = await fetch("/api/save-config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId: "guest-session",
        deviceId: device.id,
        selections,
        totalPrice,
        totalPerf,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to save configuration: ${res.status}`);
    }

    alert("Configuration saved");
  } catch (error) {
    console.error(error);
    alert("Failed to save configuration");
  } finally {
    setSaving(false);
  }
}

  function applyPreset(preset: "basic" | "balanced" | "pro") {
    if (!device) return;

    const cpuOptions =
      device.components.find((c) => c.key === "cpu")?.options || [];
    const ramOptions =
      device.components.find((c) => c.key === "ram")?.options || [];
    const storageOptions =
      device.components.find((c) => c.key === "storage")?.options || [];

    if (preset === "basic") {
      setSelections((prev) => ({
        ...prev,
        cpu: cpuOptions[0]?.id ?? prev.cpu,
        ram: ramOptions[0]?.id ?? prev.ram,
        storage: storageOptions[0]?.id ?? prev.storage,
      }));
    }

    if (preset === "balanced") {
      setSelections((prev) => ({
        ...prev,
        cpu: cpuOptions[1]?.id ?? cpuOptions[0]?.id ?? prev.cpu,
        ram: ramOptions[1]?.id ?? ramOptions[0]?.id ?? prev.ram,
        storage: storageOptions[1]?.id ?? storageOptions[0]?.id ?? prev.storage,
      }));
    }

    if (preset === "pro") {
      setSelections((prev) => ({
        ...prev,
        cpu: cpuOptions[cpuOptions.length - 1]?.id ?? prev.cpu,
        ram: ramOptions[ramOptions.length - 1]?.id ?? prev.ram,
        storage: storageOptions[storageOptions.length - 1]?.id ?? prev.storage,
      }));
    }
  }

  const selectClassName =
    "mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm shadow-sm outline-none transition focus:border-slate-500";

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          3D Modular Hardware Configurator
        </h1>

        <p className="mt-2 text-slate-600">
          MVP: 3D visualization + live configuration + backend calculation.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="relative h-[660px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="absolute left-4 top-4 z-10 rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm shadow">
  <div className="font-semibold text-slate-700">Current Build</div>

  <div className="mt-1 text-slate-600">
    CPU: {cpu?.options.find((o) => o.id === selections.cpu)?.name ?? "-"}
  </div>

  <div className="text-slate-600">
    RAM: {ram?.options.find((o) => o.id === selections.ram)?.name ?? "-"}
  </div>

  <div className="text-slate-600">
    Storage: {storage?.options.find((o) => o.id === selections.storage)?.name ?? "-"}
  </div>
</div>
            <Canvas camera={{ position: [0, 1.5, 6], fov: 45 }}>
              <color attach="background" args={["#f8fafc"]} />

              <ambientLight intensity={1.6} />

              <directionalLight position={[5, 8, 5]} intensity={2} />

              <directionalLight position={[-4, 4, -3]} intensity={1} />

              

              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -1, 0]}
                receiveShadow
              >
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial color="#e5e7eb" />
              </mesh>

              <Suspense fallback={null}>
                <LaptopModel onSelectPart={setSelectedPart} />

                <ContactShadows
                  position={[0, -0.95, 0]}
                  opacity={0.35}
                  scale={10}
                  blur={2.5}
                  far={5}
                />
              </Suspense>

              <OrbitControls
                enablePan={false}
                target={[0, 0, 0]}
                minDistance={3}
                maxDistance={10}
                autoRotate
                autoRotateSpeed={1.2}
              />
            </Canvas>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">
              Configurator Panel
            </h2>

            <div className="mt-4">
              <div className="text-sm font-medium text-slate-700">
                Quick Presets
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <button
                  onClick={() => applyPreset("basic")}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-500 hover:bg-slate-50"
                >
                  Basic
                </button>
                <button
                  onClick={() => applyPreset("balanced")}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-500 hover:bg-slate-50"
                >
                  Balanced
                </button>
                <button
                  onClick={() => applyPreset("pro")}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-500 hover:bg-slate-50"
                >
                  Pro
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <div className="text-sm font-medium text-slate-700">CPU</div>

                <select
                  className={selectClassName}
                  value={selections.cpu ?? ""}
                  onChange={(e) =>
                    setSelections((prev) => ({
                      ...prev,
                      cpu: Number(e.target.value),
                    }))
                  }
                >
                  {cpu?.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-700">RAM</div>

                <select
                  className={selectClassName}
                  value={selections.ram ?? ""}
                  onChange={(e) =>
                    setSelections((prev) => ({
                      ...prev,
                      ram: Number(e.target.value),
                    }))
                  }
                >
                  {ram?.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-700">
                  Storage
                </div>

                <select
                  className={selectClassName}
                  value={selections.storage ?? ""}
                  onChange={(e) =>
                    setSelections((prev) => ({
                      ...prev,
                      storage: Number(e.target.value),
                    }))
                  }
                >
                  {storage?.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-medium text-slate-700">
                  Selected Component
                </div>

                {selectedPartInfo ? (
                  <div className="mt-2">
                    <div className="font-semibold text-slate-900">
                      {selectedPartInfo.name}
                    </div>

                    <div className="mt-1 text-sm leading-6 text-slate-600">
                      {selectedPartInfo.description}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-slate-500">
                    Click the laptop model to inspect it.
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Estimated Price</div>

                <div className="mt-1 text-3xl font-bold text-slate-900">
                  ${totalPrice.toFixed(0)}
                </div>

                <div className="mt-4 text-sm text-slate-500">
                  Performance Score
                </div>

                <div className="mt-1 text-3xl font-bold text-slate-900">
                  {totalPerf}
                </div>
              </div>

              <button
                onClick={saveConfiguration}
                disabled={saving}
                className="mt-2 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}