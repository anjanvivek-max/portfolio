import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'
import { materials } from '../materials'
import { TV, TV_SCREEN } from '../layout'
import { Interactive } from '../Interactions/Interactive'
import { CrtContent } from '../../components/Crt/CrtContent'

/** DOM size of the television picture. 800 x 600 px maps onto the 4:3 glass. */
export const CRT_PIXELS = { w: 800, h: 600 }
/** drei's Html maps 400 px to `distanceFactor` world units. */
const DISTANCE_FACTOR = (TV_SCREEN.w * 400) / CRT_PIXELS.w

/** Slightly convex picture tube. */
const tubeGeometry = (w: number, h: number): THREE.BufferGeometry => {
  const geometry = new THREE.PlaneGeometry(w, h, 24, 18)
  const pos = geometry.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) / (w / 2)
    const y = pos.getY(i) / (h / 2)
    pos.setZ(i, 0.012 * (1 - x * x) * (1 - y * y))
  }
  geometry.computeVertexNormals()
  return geometry
}

/**
 * The CRT television. Its picture is real HTML placed on the glass, so portfolio text stays
 * sharp, selectable and clickable. On compact screens the same content opens full screen
 * instead (see components/Crt/CrtOverlay).
 */
export const Television = () => {
  const m = materials()
  const compact = useStore((s) => s.compact)
  const phase = useStore((s) => s.phase)
  const glass = useRef<THREE.MeshStandardMaterial>(null)
  const tube = useMemo(() => tubeGeometry(TV_SCREEN.w, TV_SCREEN.h), [])

  const on = phase === 'crtStarting' || phase === 'sectionOpen' || phase === 'ejecting'

  useFrame((_, delta) => {
    if (!glass.current) return
    const p = useStore.getState().phase
    const lit = p === 'crtStarting' || p === 'sectionOpen' ? 1 : 0
    glass.current.emissiveIntensity = THREE.MathUtils.damp(glass.current.emissiveIntensity, lit * 0.5, 6, delta)
  })

  const screenLocal: [number, number, number] = [TV_SCREEN.x - TV.x, TV_SCREEN.y - TV.y, TV.d / 2]
  const panelX = TV.w / 2 - 0.075

  return (
    <group position={[TV.x, TV.y, TV.z]}>
      <Interactive
        id="tv"
        label="Television · Pick a tape to play"
        onActivate={() => useStore.getState().setView('media')}
        hitbox={{ size: [TV.w, TV.h, TV.d], center: [0, TV.h / 2, 0] }}
        hint={[screenLocal[0], TV.h + 0.09, TV.d / 2]}
        lift={0}
      >
        {/* wood cabinet */}
        <RoundedBox args={[TV.w, TV.h, TV.d]} radius={0.028} smoothness={4} position-y={TV.h / 2} castShadow receiveShadow material={m.tvWood} />
        {/* dark front fascia */}
        <mesh position={[0, TV.h / 2, TV.d / 2 - 0.004]} material={m.charcoal}>
          <boxGeometry args={[TV.w - 0.05, TV.h - 0.05, 0.012]} />
        </mesh>
        {/* bezel around the tube */}
        <RoundedBox
          args={[TV_SCREEN.w + 0.07, TV_SCREEN.h + 0.07, 0.03]}
          radius={0.014}
          smoothness={3}
          position={[screenLocal[0], screenLocal[1], TV.d / 2 - 0.008]}
          material={m.black}
        />
        {/* picture tube */}
        <mesh geometry={tube} position={[screenLocal[0], screenLocal[1], TV.d / 2 + 0.0075]}>
          <meshStandardMaterial ref={glass} color="#0a0f12" roughness={0.16} metalness={0.3} emissive="#7fa8d8" emissiveIntensity={0} />
        </mesh>

        {/* control panel: speaker slots, two knobs, power light */}
        {Array.from({ length: 9 }).map((_, i) => (
          <mesh key={i} position={[panelX, TV.h - 0.1 - i * 0.017, TV.d / 2 + 0.003]} material={m.black}>
            <boxGeometry args={[0.085, 0.006, 0.004]} />
          </mesh>
        ))}
        {[0.24, 0.15].map((y) => (
          <group key={y} position={[panelX, y, TV.d / 2 + 0.004]} rotation-x={Math.PI / 2}>
            <mesh material={m.steel} castShadow>
              <cylinderGeometry args={[0.027, 0.03, 0.022, 20]} />
            </mesh>
            <mesh position={[0, 0.012, -0.012]} material={m.black}>
              <boxGeometry args={[0.005, 0.004, 0.024]} />
            </mesh>
          </group>
        ))}
        <mesh position={[panelX, 0.075, TV.d / 2 + 0.004]}>
          <circleGeometry args={[0.006, 12]} />
          <meshBasicMaterial color={on ? '#ff5a3c' : '#3a120c'} toneMapped={false} />
        </mesh>
        {/* antenna */}
        <mesh position={[0.02, TV.h + 0.006, -0.08]} material={m.black}>
          <cylinderGeometry args={[0.04, 0.05, 0.012, 16]} />
        </mesh>
        {[-0.5, 0.45].map((tilt) => (
          <mesh key={tilt} position={[0.02 + tilt * 0.26, TV.h + 0.24, -0.08]} rotation-z={-tilt} material={m.chrome}>
            <cylinderGeometry args={[0.003, 0.004, 0.54, 6]} />
          </mesh>
        ))}
      </Interactive>

      {/* live picture: only mounted while the set is on */}
      {on && !compact && (
        <Html
          transform
          position={[screenLocal[0], screenLocal[1], TV.d / 2 + 0.021]}
          distanceFactor={DISTANCE_FACTOR}
          zIndexRange={[40, 30]}
          wrapperClass="crt-html"
        >
          <div style={{ width: CRT_PIXELS.w, height: CRT_PIXELS.h }}>
            <CrtContent />
          </div>
        </Html>
      )}
    </group>
  )
}
