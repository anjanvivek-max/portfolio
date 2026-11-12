import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { PerformanceMonitor } from '@react-three/drei'
import { useStore } from '../store/useStore'
import { CameraRig } from './Camera/CameraRig'
import { Lights } from './Lighting/Lights'
import { Shell } from './Room/Shell'
import { BookshelfUnit, Chair, Credenza, Desk } from './Room/Furniture'
import { Computer, DeskClutter, DeskLamp, Notebook, Telephone, Typewriter } from './Room/DeskProps'
import { PendantLamp, Plants, WallArt, WallClock } from './Room/Decor'
import { Interactive } from './Interactions/Interactive'
import { objectMeta } from '../data/sections'
import { TapeRack } from './VHS/Tapes'
import { Vcr } from './VHS/Vcr'
import { Television } from './CRT/Television'
import { FOG_COLOR, FOG_DENSITY, Skyline } from './City/Skyline'
import { Metro } from './Metro/Metro'
import { Sky, Streets, Traffic } from './City/Atmosphere'
import { WindowGlass } from './Window/Glass'
import { BOOKSHELF, GROUND_Y } from './layout'

/** Reports real loading milestones: the scene is mounted, then the first frames are drawn. */
const LoadProbe = () => {
  const frames = useRef(0)
  useEffect(() => {
    useStore.getState().markLoaded('scene')
  }, [])
  useFrame(() => {
    if (frames.current > 3) return
    frames.current += 1
    if (frames.current === 3) useStore.getState().markLoaded('frame')
  })
  return null
}

/** Falls back to the standard page if the browser drops the WebGL context. */
const ContextGuard = () => {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    const canvas = gl.domElement
    const onLost = (event: Event) => {
      event.preventDefault()
      useStore
        .getState()
        .setMode('standard', 'The 3D view stopped responding on this device, so the standard version is shown instead.')
    }
    canvas.addEventListener('webglcontextlost', onLost)
    return () => canvas.removeEventListener('webglcontextlost', onLost)
  }, [gl])
  return null
}

const noRaycast = () => null

/** Street level and night sky behind the towers. */
const Backdrop = () => (
  <group>
    <mesh rotation-x={-Math.PI / 2} position-y={GROUND_Y} raycast={noRaycast}>
      <planeGeometry args={[4000, 4000]} />
      <meshBasicMaterial color="#0a0e19" />
    </mesh>
  </group>
)

const Scene = () => (
  <>
    <color attach="background" args={['#0b1430']} />
    <fogExp2 attach="fog" args={[FOG_COLOR, FOG_DENSITY]} />
    <Lights />
    <Shell />
    <Desk />
    <Chair />
    <Credenza />
    <Interactive
      id="bookshelf"
      label={objectMeta('bookshelf').tooltip}
      onActivate={() => useStore.getState().openObject('bookshelf')}
      hitbox={{ size: [BOOKSHELF.w, BOOKSHELF.h, BOOKSHELF.d], center: [BOOKSHELF.x, BOOKSHELF.h / 2, BOOKSHELF.z] }}
      hint={[BOOKSHELF.x, 1.5, BOOKSHELF.z + 0.24]}
      lift={0}
    >
      <BookshelfUnit />
    </Interactive>
    <Computer />
    <DeskLamp />
    <Typewriter />
    <Notebook />
    <DeskClutter />
    <Telephone />
    <WallClock />
    <WallArt />
    <PendantLamp />
    <Plants />
    <Vcr />
    <Television />
    <TapeRack />
    <group name="city">
      <Sky />
      <Backdrop />
      <Streets />
      <Skyline />
      <Metro />
      <Traffic />
    </group>
    <WindowGlass />
    <CameraRig />
    <LoadProbe />
    <ContextGuard />
  </>
)

/** The immersive room. Loaded lazily so the standard page never pays for three.js. */
const Experience = () => {
  const mode = useStore((s) => s.mode)
  const compact = useStore((s) => s.compact)
  // If the frame rate keeps dropping, render at a lower pixel density instead of stuttering.
  const [lowPower, setLowPower] = useState(false)
  return (
    <Canvas
      shadows={compact ? false : 'percentage'}
      dpr={lowPower ? 1 : compact ? [1, 1.5] : [1, 1.75]}
      frameloop={mode === 'immersive' ? 'always' : 'never'}
      camera={{ fov: 50, near: 0.05, far: 2600, position: [0.15, 1.62, 2.28] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl, camera, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
        // Development-only handle used for automated interaction checks.
        if (import.meta.env.DEV) Object.assign(window, { __room: { camera, scene, THREE, store: useStore } })
      }}
    >
      <PerformanceMonitor onDecline={() => setLowPower(true)} />
      <Scene />
    </Canvas>
  )
}

export default Experience
