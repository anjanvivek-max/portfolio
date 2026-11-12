import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'
import { GROUND_Y, VIADUCT } from '../layout'
import { metroFront, metroSide } from '../textures/art'

const noRaycast = () => null

const CAR = { length: 21, width: 2.9, height: 3.6, gap: 0.7 }
const CARS = 3
const TRAIN_LENGTH = CARS * CAR.length + (CARS - 1) * CAR.gap
/** Each train runs the full visible stretch and loops well outside the view. */
const RUN = VIADUCT.halfLength + TRAIN_LENGTH
const SPEED = 17

/** Elevated metro viaduct: deck, parapets, piers and overhead-line masts. */
export const Viaduct = () => {
  const piers = useRef<THREE.InstancedMesh>(null)
  const caps = useRef<THREE.InstancedMesh>(null)
  const masts = useRef<THREE.InstancedMesh>(null)
  const length = VIADUCT.halfLength * 2
  const deckThickness = 0.9
  const deckBottom = VIADUCT.deckTop - deckThickness
  const pierHeight = deckBottom - 1.1 - GROUND_Y
  const spacing = 28
  const count = Math.floor(length / spacing) + 1

  const mats = useMemo(
    () => ({
      deck: new THREE.MeshBasicMaterial({ color: '#33384a' }),
      side: new THREE.MeshBasicMaterial({ color: '#4c5266' }),
      pier: new THREE.MeshBasicMaterial({ color: '#2c3142' }),
      mast: new THREE.MeshBasicMaterial({ color: '#161a26' }),
    }),
    [],
  )
  useLayoutEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats])

  useLayoutEffect(() => {
    const dummy = new THREE.Object3D()
    for (let i = 0; i < count; i++) {
      const x = -VIADUCT.halfLength + i * spacing
      dummy.rotation.set(0, 0, 0)
      dummy.position.set(x, GROUND_Y + pierHeight / 2, VIADUCT.z)
      dummy.scale.set(2.2, pierHeight, 2.4)
      dummy.updateMatrix()
      piers.current?.setMatrixAt(i, dummy.matrix)
      dummy.position.set(x, deckBottom - 0.55, VIADUCT.z)
      dummy.scale.set(3.4, 1.1, 8.4)
      dummy.updateMatrix()
      caps.current?.setMatrixAt(i, dummy.matrix)
      dummy.position.set(x + spacing / 2, VIADUCT.deckTop + 3.1, VIADUCT.z)
      dummy.scale.set(0.22, 6.2, 0.22)
      dummy.updateMatrix()
      masts.current?.setMatrixAt(i, dummy.matrix)
    }
    ;[piers, caps, masts].forEach((ref) => {
      if (ref.current) ref.current.instanceMatrix.needsUpdate = true
    })
  }, [count, pierHeight, deckBottom])

  return (
    <group>
      <mesh position={[0, VIADUCT.deckTop - deckThickness / 2, VIADUCT.z]} material={mats.deck} raycast={noRaycast}>
        <boxGeometry args={[length, deckThickness, 9.6]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, VIADUCT.deckTop + 0.5, VIADUCT.z + s * 4.65]} material={mats.side} raycast={noRaycast}>
          <boxGeometry args={[length, 1.05, 0.3]} />
        </mesh>
      ))}
      {/* overhead contact wires */}
      {[-2, 2].map((z) => (
        <mesh key={z} position={[0, VIADUCT.deckTop + 5.6, VIADUCT.z + z]} material={mats.mast} raycast={noRaycast}>
          <boxGeometry args={[length, 0.05, 0.05]} />
        </mesh>
      ))}
      <instancedMesh ref={piers} args={[undefined, mats.pier, count]} frustumCulled={false} raycast={noRaycast}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
      <instancedMesh ref={caps} args={[undefined, mats.side, count]} frustumCulled={false} raycast={noRaycast}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
      <instancedMesh ref={masts} args={[undefined, mats.mast, count]} frustumCulled={false} raycast={noRaycast}>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
    </group>
  )
}

interface TrainProps {
  /** +1 runs left to right on the near track, -1 right to left on the far track. */
  direction: 1 | -1
  /** Start offset along the loop, 0..1. */
  offset: number
}

/** Three-car metro train with lit windows that loops along the viaduct. */
export const MetroTrain = ({ direction, offset }: TrainProps) => {
  const group = useRef<THREE.Group>(null)
  const mats = useMemo(() => {
    const side = new THREE.MeshBasicMaterial({ map: metroSide() })
    const front = new THREE.MeshBasicMaterial({ map: metroFront() })
    const roof = new THREE.MeshBasicMaterial({ color: '#8f97a0' })
    const under = new THREE.MeshBasicMaterial({ color: '#23262c' })
    const lamp = new THREE.MeshBasicMaterial({ color: '#fff6d8', fog: false })
    return { side, front, roof, under, lamp }
  }, [])
  useLayoutEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats])

  const trackZ = VIADUCT.z + (direction === 1 ? 2.1 : -2.1)
  const loop = RUN * 2

  useFrame(({ clock }) => {
    if (!group.current) return
    const still = useStore.getState().reducedMotion
    const t = still ? 0.42 : (clock.elapsedTime * SPEED) / loop + offset
    const u = t - Math.floor(t)
    group.current.position.x = direction * (-RUN + u * loop)
  })

  // BoxGeometry material order: +x, -x, +y, -y, +z, -z. The train's length runs along x.
  const carMaterials = [mats.front, mats.front, mats.roof, mats.under, mats.side, mats.side]

  return (
    <group ref={group} position={[0, VIADUCT.deckTop + 0.55, trackZ]}>
      {Array.from({ length: CARS }).map((_, i) => {
        const x = (i - (CARS - 1) / 2) * (CAR.length + CAR.gap)
        return (
          <group key={i} position-x={x}>
            <mesh position-y={CAR.height / 2 + 0.35} material={carMaterials} raycast={noRaycast}>
              <boxGeometry args={[CAR.length, CAR.height, CAR.width]} />
            </mesh>
            {/* bogies */}
            {[-6.5, 6.5].map((bx) => (
              <mesh key={bx} position={[bx, 0.15, 0]} material={mats.under} raycast={noRaycast}>
                <boxGeometry args={[3.4, 0.5, 2.3]} />
              </mesh>
            ))}
            {/* roof equipment */}
            <mesh position={[0, CAR.height + 0.5, 0]} material={mats.roof} raycast={noRaycast}>
              <boxGeometry args={[7, 0.3, 1.8]} />
            </mesh>
          </group>
        )
      })}
      {/* headlights on the leading end */}
      {[-0.9, 0.9].map((z) => (
        <mesh key={z} position={[direction * (TRAIN_LENGTH / 2 + 0.05), 1.35, z]} material={mats.lamp} raycast={noRaycast}>
          <sphereGeometry args={[0.28, 10, 8]} />
        </mesh>
      ))}
    </group>
  )
}

export const Metro = () => (
  <group>
    <Viaduct />
    <MetroTrain direction={1} offset={0.12} />
    <MetroTrain direction={-1} offset={0.6} />
  </group>
)
