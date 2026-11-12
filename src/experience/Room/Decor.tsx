import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'
import { objectMeta } from '../../data/sections'
import { materials } from '../materials'
import { BACK_Z, BOOKSHELF, CRED, DESK, PHOTO_WALL, ROOM } from '../layout'
import { PENDANT } from '../Lighting/Lights'
import { clockFace } from '../textures/labels'
import { photo, posterCity, posterHello } from '../textures/art'
import { seeded } from '../textures/canvas'
import { Interactive } from '../Interactions/Interactive'

const noRaycast = () => null

/** Analog wall clock showing the visitor's real local time. */
export const WallClock = () => {
  const m = materials()
  const hour = useRef<THREE.Group>(null)
  const minute = useRef<THREE.Group>(null)
  const second = useRef<THREE.Group>(null)
  const face = useMemo(() => new THREE.MeshStandardMaterial({ map: clockFace(), roughness: 0.6 }), [])
  useLayoutEffect(() => () => face.dispose(), [face])

  useFrame(() => {
    const now = new Date()
    const s = now.getSeconds() + (useStore.getState().reducedMotion ? 0 : now.getMilliseconds() / 1000)
    const mi = now.getMinutes() + s / 60
    const h = (now.getHours() % 12) + mi / 60
    if (second.current) second.current.rotation.z = -(s / 60) * Math.PI * 2
    if (minute.current) minute.current.rotation.z = -(mi / 60) * Math.PI * 2
    if (hour.current) hour.current.rotation.z = -(h / 12) * Math.PI * 2
  })

  const hand = (length: number, width: number, material: THREE.Material) => (
    <mesh position-y={length / 2 - 0.012} material={material}>
      <boxGeometry args={[width, length, 0.003]} />
    </mesh>
  )

  return (
    <group position={[BOOKSHELF.x, 2.5, BACK_Z + 0.03]}>
      <mesh rotation-x={Math.PI / 2} castShadow material={m.darkWood}>
        <cylinderGeometry args={[0.2, 0.2, 0.04, 40]} />
      </mesh>
      <mesh position-z={0.021} material={face} raycast={noRaycast}>
        <circleGeometry args={[0.178, 40]} />
      </mesh>
      <group ref={hour} position-z={0.026}>
        {hand(0.1, 0.012, m.black)}
      </group>
      <group ref={minute} position-z={0.03}>
        {hand(0.15, 0.008, m.black)}
      </group>
      <group ref={second} position-z={0.034}>
        {hand(0.16, 0.003, m.rustPaint)}
      </group>
      <mesh position-z={0.037} rotation-x={Math.PI / 2} material={m.brass}>
        <cylinderGeometry args={[0.01, 0.01, 0.006, 12]} />
      </mesh>
    </group>
  )
}

const Frame = ({ w, h, material, frame }: { w: number; h: number; material: THREE.Material; frame: THREE.Material }) => (
  <group>
    <mesh castShadow material={frame}>
      <boxGeometry args={[w + 0.045, h + 0.045, 0.022]} />
    </mesh>
    <mesh position-z={0.0125} material={material}>
      <planeGeometry args={[w, h]} />
    </mesh>
  </group>
)

/** Posters and instant photographs on the right wall. The photographs open the About panel. */
export const WallArt = () => {
  const m = materials()
  const art = useMemo(
    () => ({
      hello: new THREE.MeshStandardMaterial({ map: posterHello(), roughness: 0.85 }),
      city: new THREE.MeshStandardMaterial({ map: posterCity(), roughness: 0.85 }),
      photos: (['skyline', 'tape', 'chip'] as const).map((k) => new THREE.MeshStandardMaterial({ map: photo(k), roughness: 0.7 })),
    }),
    [],
  )
  useLayoutEffect(
    () => () => {
      art.hello.dispose()
      art.city.dispose()
      art.photos.forEach((p) => p.dispose())
    },
    [art],
  )
  const photoSlots: [number, number, number][] = [
    [-0.26, 0.2, 0.06],
    [0.02, 0.26, -0.05],
    [0.29, 0.17, 0.04],
  ]

  return (
    <group>
      {/* right wall, facing into the room */}
      <group position={[PHOTO_WALL.x - 0.015, 0, 0]} rotation-y={-Math.PI / 2}>
        <group position={[PHOTO_WALL.z + 1.0, PHOTO_WALL.y + 0.25, 0]}>
          <Frame w={0.5} h={0.7} material={art.hello} frame={m.darkWood} />
        </group>
        <Interactive
          id="photos"
          label={objectMeta('photos').tooltip}
          onActivate={() => useStore.getState().openObject('photos')}
          position={[PHOTO_WALL.z, PHOTO_WALL.y, 0]}
          hitbox={{ size: [0.95, 0.75, 0.08], center: [0, 0.2, 0] }}
          hint={[0, 0.62, 0.05]}
          lift={0}
        >
          {/* cork board with pinned photographs */}
          <mesh position={[0, 0.2, 0.004]} material={m.lightWood} castShadow>
            <boxGeometry args={[0.9, 0.62, 0.018]} />
          </mesh>
          <mesh position={[0, 0.2, 0.0135]}>
            <planeGeometry args={[0.84, 0.56]} />
            <meshStandardMaterial color="#b98d5a" roughness={1} />
          </mesh>
          {photoSlots.map(([x, yy, tilt], i) => (
            <group key={i} position={[x, yy, 0.017 + i * 0.001]} rotation-z={tilt}>
              <mesh material={art.photos[i]} castShadow>
                <planeGeometry args={[0.21, 0.245]} />
              </mesh>
              <mesh position={[0, 0.105, 0.004]} material={i === 1 ? m.rustPaint : m.brass}>
                <sphereGeometry args={[0.008, 10, 8]} />
              </mesh>
            </group>
          ))}
        </Interactive>
      </group>
      {/* left wall poster */}
      <group position={[-ROOM.halfW + 0.015, 1.75, -1.55]} rotation-y={Math.PI / 2}>
        <Frame w={0.5} h={0.7} material={art.city} frame={m.darkWood} />
      </group>
    </group>
  )
}

/** Hanging pendant lamp: the visible source of the room's warm fill light. */
export const PendantLamp = () => {
  const m = materials()
  return (
    <group position={[PENDANT[0], 0, PENDANT[2]]}>
      <mesh position-y={(ROOM.h + PENDANT[1] + 0.2) / 2} material={m.black} raycast={noRaycast}>
        <cylinderGeometry args={[0.004, 0.004, ROOM.h - PENDANT[1] - 0.2, 6]} />
      </mesh>
      <mesh position-y={PENDANT[1] + 0.12} material={m.rustPaint} raycast={noRaycast}>
        <cylinderGeometry args={[0.05, 0.24, 0.2, 28, 1, true]} />
      </mesh>
      <mesh position-y={PENDANT[1] + 0.06} raycast={noRaycast}>
        <sphereGeometry args={[0.06, 16, 12]} />
        <meshBasicMaterial color="#ffe0ad" toneMapped={false} />
      </mesh>
    </group>
  )
}

interface PlantProps {
  position: [number, number, number]
  /** Overall size multiplier. */
  scale?: number
  leaves?: number
  seed?: number
  /** Long strap leaves (floor plant) or small round ones. */
  tall?: boolean
}

/** Simple potted plant built from curved leaf blades. */
export const Plant = ({ position, scale = 1, leaves = 12, seed = 1, tall = true }: PlantProps) => {
  const m = materials()
  const leafGeometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.11, 0.62, 1, 8)
    g.translate(0, 0.31, 0)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const t = pos.getY(i) / 0.62
      pos.setX(i, pos.getX(i) * (1 - t * t) * (0.5 + Math.sin(t * Math.PI) * 0.9))
      pos.setZ(i, t * t * 0.3)
    }
    g.computeVertexNormals()
    return g
  }, [])
  useLayoutEffect(() => () => leafGeometry.dispose(), [leafGeometry])

  const blades = useMemo(() => {
    const rand = seeded(seed * 97)
    return Array.from({ length: leaves }).map((_, i) => ({
      yaw: (i / leaves) * Math.PI * 2 + rand() * 0.5,
      lean: 0.12 + rand() * 0.55,
      size: 0.7 + rand() * 0.5,
      dark: rand() > 0.5,
    }))
  }, [leaves, seed])

  const potH = tall ? 0.3 : 0.11
  const potR = tall ? 0.17 : 0.07
  return (
    <group position={position} scale={scale}>
      <mesh position-y={potH / 2} castShadow material={m.terracotta}>
        <cylinderGeometry args={[potR, potR * 0.78, potH, 20]} />
      </mesh>
      <mesh position-y={potH - 0.01} material={m.soil}>
        <cylinderGeometry args={[potR * 0.93, potR * 0.93, 0.02, 20]} />
      </mesh>
      {blades.map((b, i) => (
        <mesh
          key={i}
          geometry={leafGeometry}
          position-y={potH}
          rotation={[b.lean, b.yaw, 0, 'YXZ']}
          scale={(tall ? 1.5 : 0.42) * b.size}
          castShadow
          material={b.dark ? m.leafDark : m.leaf}
          raycast={noRaycast}
        />
      ))}
    </group>
  )
}

/** All greenery in the room. */
export const Plants = () => (
  <group>
    <Plant position={[CRED.x + CRED.w / 2 + 0.24, 0, CRED.z + 0.02]} leaves={14} seed={3} />
    <Plant position={[DESK.x + DESK.w / 2 - 0.09, DESK.top, DESK.z - 0.28]} leaves={9} seed={5} tall={false} />
    <Plant position={[BOOKSHELF.x + 0.22, BOOKSHELF.h, BOOKSHELF.z + 0.02]} leaves={11} seed={8} tall={false} scale={1.5} />
  </group>
)
