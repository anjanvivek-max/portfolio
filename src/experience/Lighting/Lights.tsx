import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'
import { DESK, TV_SCREEN } from '../layout'

/** Lamp head position, shared with the lamp model. */
export const LAMP_HEAD: [number, number, number] = [DESK.x + 0.3, DESK.top + 0.44, DESK.z - 0.04]
export const PENDANT: [number, number, number] = [0.55, 2.32, -0.45]

/**
 * A small, deliberate light rig: warm tungsten inside, cool city light from the window.
 * Only the desk lamp casts a shadow.
 */
export const Lights = () => {
  const compact = useStore((s) => s.compact)
  const crt = useRef<THREE.PointLight>(null)
  const spot = useRef<THREE.SpotLight>(null)
  const target = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    target.position.set(DESK.x + 0.24, DESK.top, DESK.z + 0.2)
    target.updateMatrixWorld()
    if (spot.current) spot.current.target = target
  }, [target])

  useFrame(({ clock }, delta) => {
    if (!crt.current) return
    const { phase, reducedMotion } = useStore.getState()
    const on = phase === 'crtStarting' || phase === 'sectionOpen'
    const flicker = reducedMotion ? 1 : 0.93 + 0.07 * Math.sin(clock.elapsedTime * 41) * Math.sin(clock.elapsedTime * 13.7)
    crt.current.intensity = THREE.MathUtils.damp(crt.current.intensity, on ? 1.5 * flicker : 0, 5, delta)
  })

  return (
    <>
      <hemisphereLight args={['#f2d7ae', '#3a2414', 0.5]} />
      {/* cool light spilling in from the city */}
      <directionalLight color="#6f8fd6" intensity={0.55} position={[0.5, 3.2, -6]} />

      {/* desk lamp */}
      <primitive object={target} />
      <spotLight
        ref={spot}
        color="#ffc98f"
        intensity={26}
        position={LAMP_HEAD}
        angle={0.95}
        penumbra={0.75}
        distance={6}
        decay={1.7}
        castShadow={!compact}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-radius={5}
      />
      {/* pendant: the room's warm fill */}
      <pointLight color="#ffbd7d" intensity={13} position={PENDANT} distance={9} decay={1.6} />
      {/* soft bounce near the media corner so the tapes read clearly */}
      <pointLight color="#ffd2a1" intensity={2.4} position={[2.2, 1.55, -1.2]} distance={3.2} decay={1.8} />
      {/* television glow, driven by the state machine */}
      <pointLight
        ref={crt}
        color="#9cc4ff"
        intensity={0}
        position={[TV_SCREEN.x, TV_SCREEN.y, TV_SCREEN.z + 0.35]}
        distance={3.4}
        decay={1.8}
      />
    </>
  )
}
