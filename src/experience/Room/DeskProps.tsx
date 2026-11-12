import { useLayoutEffect, useMemo, useRef } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'
import { objectMeta } from '../../data/sections'
import { materials } from '../materials'
import { COMPUTER, DESK, MONITOR_SCREEN, NOTEBOOK, PHONE, CRED, TYPEWRITER } from '../layout'
import { LAMP_HEAD } from '../Lighting/Lights'
import { cassetteLabel, computerIdle, mugLabel, notebookPages, phoneDial, typedSheet } from '../textures/labels'
import { Interactive } from '../Interactions/Interactive'

const open = (id: Parameters<ReturnType<typeof useStore.getState>['openObject']>[0]) => () =>
  useStore.getState().openObject(id)

/** Disposes materials created inside a component when it unmounts. */
const useDisposable = <T extends Record<string, THREE.Material>>(factory: () => T): T => {
  const value = useMemo(factory, []) // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => () => Object.values(value).forEach((m) => m.dispose()), [value])
  return value
}

/** Beige desktop computer: horizontal case, CRT monitor, keyboard, mouse and two speakers. */
export const Computer = () => {
  const m = materials()
  const keys = useRef<THREE.InstancedMesh>(null)
  const own = useDisposable(() => ({
    screen: new THREE.MeshBasicMaterial({ map: computerIdle(), toneMapped: false }),
  }))
  const y = DESK.top

  const keyLayout = useMemo(() => {
    const list: [number, number, number][] = []
    const rows = [14, 14, 13, 12]
    rows.forEach((n, r) => {
      for (let i = 0; i < n; i++) list.push([(i - (n - 1) / 2) * 0.0265, 0, (r - 1.5) * 0.027])
    })
    return list
  }, [])

  useLayoutEffect(() => {
    const im = keys.current
    if (!im) return
    const dummy = new THREE.Object3D()
    keyLayout.forEach((p, i) => {
      dummy.position.set(...p)
      dummy.updateMatrix()
      im.setMatrixAt(i, dummy.matrix)
    })
    im.instanceMatrix.needsUpdate = true
  }, [keyLayout])

  return (
    <group>
      <Interactive
        id="computer"
        label={objectMeta('computer').tooltip}
        onActivate={open('computer')}
        position={[COMPUTER.x, y, COMPUTER.z]}
        hitbox={{ size: [0.46, 0.5, 0.44], center: [0, 0.25, 0] }}
        hint={[0, 0.56, 0.1]}
        lift={0.006}
      >
        {/* desktop case with two drive bays */}
        <RoundedBox args={[0.44, 0.115, 0.4]} radius={0.008} smoothness={2} position-y={0.0575} castShadow receiveShadow material={m.beige} />
        {[0.07, 0.17].map((x) => (
          <group key={x} position={[x, 0.07, 0.201]}>
            <mesh material={m.beigeDark}>
              <boxGeometry args={[0.085, 0.03, 0.004]} />
            </mesh>
            <mesh position-z={0.002} material={m.black}>
              <boxGeometry args={[0.07, 0.004, 0.003]} />
            </mesh>
          </group>
        ))}
        <mesh position={[-0.16, 0.04, 0.202]}>
          <circleGeometry args={[0.005, 10]} />
          <meshBasicMaterial color="#7dff8a" toneMapped={false} />
        </mesh>
        {/* monitor */}
        <mesh position={[0, 0.135, 0]} material={m.beigeDark}>
          <cylinderGeometry args={[0.09, 0.11, 0.04, 20]} />
        </mesh>
        <RoundedBox args={[0.37, 0.31, 0.36]} radius={0.02} smoothness={3} position={[0, 0.3, 0.01]} castShadow material={m.beige} />
        <RoundedBox args={[MONITOR_SCREEN.w + 0.04, MONITOR_SCREEN.h + 0.04, 0.02]} radius={0.012} smoothness={2} position={[0, 0.305, 0.186]} material={m.beigeDark} />
        <mesh position={[0, MONITOR_SCREEN.y - y, MONITOR_SCREEN.z - COMPUTER.z + 0.002]} material={own.screen}>
          <planeGeometry args={[MONITOR_SCREEN.w, MONITOR_SCREEN.h]} />
        </mesh>
      </Interactive>

      {/* keyboard */}
      <group position={[COMPUTER.x, y, COMPUTER.z + 0.4]}>
        <RoundedBox args={[0.42, 0.022, 0.15]} radius={0.006} smoothness={2} position-y={0.011} castShadow material={m.beige} />
        <instancedMesh ref={keys} args={[undefined, undefined, keyLayout.length]} position-y={0.026} material={m.keycap}>
          <boxGeometry args={[0.022, 0.01, 0.022]} />
        </instancedMesh>
      </group>
      {/* mouse */}
      <RoundedBox args={[0.055, 0.028, 0.09]} radius={0.012} smoothness={3} position={[COMPUTER.x + 0.34, y + 0.014, COMPUTER.z + 0.4]} castShadow material={m.beige} />

      {/* speakers */}
      {[-0.34, 0.34].map((dx) => (
        <group key={dx} position={[COMPUTER.x + dx, y, COMPUTER.z - 0.04]}>
          <mesh position-y={0.11} castShadow material={m.walnutPlain}>
            <boxGeometry args={[0.13, 0.22, 0.14]} />
          </mesh>
          <mesh position={[0, 0.11, 0.071]} material={m.grille}>
            <planeGeometry args={[0.11, 0.2]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Articulated tungsten desk lamp. The real light lives in Lighting/Lights. */
export const DeskLamp = () => {
  const m = materials()
  const base: [number, number, number] = [LAMP_HEAD[0] - 0.08, DESK.top, LAMP_HEAD[2] - 0.2]
  const elbow: [number, number, number] = [base[0] - 0.06, DESK.top + 0.34, base[2] - 0.02]
  const arm = (from: [number, number, number], to: [number, number, number], key: string) => {
    const a = new THREE.Vector3(...from)
    const b = new THREE.Vector3(...to)
    const mid = a.clone().lerp(b, 0.5)
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize())
    return (
      <mesh key={key} position={mid} quaternion={q} castShadow material={m.brass}>
        <cylinderGeometry args={[0.007, 0.007, a.distanceTo(b), 8]} />
      </mesh>
    )
  }
  return (
    <group>
      <mesh position={[base[0], base[1] + 0.012, base[2]]} castShadow material={m.olivePaint}>
        <cylinderGeometry args={[0.075, 0.085, 0.024, 24]} />
      </mesh>
      {arm([base[0], base[1] + 0.02, base[2]], elbow, 'lower')}
      {arm(elbow, [LAMP_HEAD[0], LAMP_HEAD[1] + 0.05, LAMP_HEAD[2]], 'upper')}
      <mesh position={elbow} material={m.brass}>
        <sphereGeometry args={[0.014, 10, 8]} />
      </mesh>
      {/* shade, open toward the desk */}
      <group position={[LAMP_HEAD[0], LAMP_HEAD[1] + 0.02, LAMP_HEAD[2]]} rotation={[0.35, 0, -0.1]}>
        <mesh castShadow material={m.olivePaint}>
          <cylinderGeometry args={[0.03, 0.095, 0.12, 24, 1, true]} />
        </mesh>
        <mesh position-y={0.06} material={m.olivePaint}>
          <cylinderGeometry args={[0.03, 0.03, 0.01, 16]} />
        </mesh>
        <mesh position-y={-0.02}>
          <sphereGeometry args={[0.028, 14, 10]} />
          <meshBasicMaterial color="#ffe2b0" toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}

/** Mechanical typewriter with a sheet of paper in the carriage. */
export const Typewriter = () => {
  const m = materials()
  const keys = useRef<THREE.InstancedMesh>(null)
  const own = useDisposable(() => ({
    sheet: new THREE.MeshStandardMaterial({ map: typedSheet(), roughness: 0.95, side: THREE.DoubleSide }),
  }))
  const layout = useMemo(() => {
    const list: [number, number, number][] = []
    for (let r = 0; r < 4; r++) for (let i = 0; i < 10; i++) list.push([(i - 4.5) * 0.027 + (r % 2) * 0.012, 0.062 - r * 0.012, 0.075 + r * 0.026])
    return list
  }, [])
  useLayoutEffect(() => {
    const im = keys.current
    if (!im) return
    const dummy = new THREE.Object3D()
    layout.forEach((p, i) => {
      dummy.position.set(...p)
      dummy.updateMatrix()
      im.setMatrixAt(i, dummy.matrix)
    })
    im.instanceMatrix.needsUpdate = true
  }, [layout])
  return (
    <group position={[TYPEWRITER.x, DESK.top, TYPEWRITER.z]} rotation-y={-0.12}>
      <RoundedBox args={[0.34, 0.07, 0.32]} radius={0.016} smoothness={3} position-y={0.035} castShadow material={m.rustPaint} />
      <RoundedBox args={[0.32, 0.07, 0.14]} radius={0.016} smoothness={3} position={[0, 0.095, -0.07]} castShadow material={m.rustPaint} />
      {/* platen and paper */}
      <mesh position={[0, 0.14, -0.09]} rotation-z={Math.PI / 2} castShadow material={m.black}>
        <cylinderGeometry args={[0.022, 0.022, 0.38, 14]} />
      </mesh>
      {[-0.2, 0.2].map((x) => (
        <mesh key={x} position={[x, 0.14, -0.09]} rotation-z={Math.PI / 2} material={m.steel}>
          <cylinderGeometry args={[0.027, 0.027, 0.014, 14]} />
        </mesh>
      ))}
      <mesh position={[0, 0.27, -0.105]} rotation-x={-0.12} castShadow material={own.sheet}>
        <planeGeometry args={[0.2, 0.26]} />
      </mesh>
      <instancedMesh ref={keys} args={[undefined, undefined, layout.length]} material={m.cream}>
        <cylinderGeometry args={[0.0095, 0.0095, 0.008, 10]} />
      </instancedMesh>
    </group>
  )
}

/** Open handwritten notebook with a pen. Opens the personal note. */
export const Notebook = () => {
  const m = materials()
  const own = useDisposable(() => ({
    pages: new THREE.MeshStandardMaterial({ map: notebookPages(), roughness: 0.95 }),
  }))
  return (
    <Interactive
      id="notebook"
      label={objectMeta('notebook').tooltip}
      onActivate={open('notebook')}
      position={[NOTEBOOK.x, DESK.top, NOTEBOOK.z]}
      rotation={[0, 0.16, 0]}
      hitbox={{ size: [0.34, 0.05, 0.25], center: [0, 0.025, 0] }}
      hint={[0, 0.12, 0]}
    >
      <mesh position-y={0.004} castShadow material={m.leather}>
        <boxGeometry args={[0.31, 0.008, 0.215]} />
      </mesh>
      <mesh position-y={0.0105} rotation-x={-Math.PI / 2} receiveShadow material={own.pages}>
        <planeGeometry args={[0.295, 0.2]} />
      </mesh>
      <mesh position={[0.1, 0.018, 0.02]} rotation={[0, 0.5, Math.PI / 2]} castShadow material={m.blackGloss}>
        <cylinderGeometry args={[0.005, 0.005, 0.14, 8]} />
      </mesh>
    </Interactive>
  )
}

/** Vintage rotary telephone. Opens the contact panel. */
export const Telephone = () => {
  const m = materials()
  const own = useDisposable(() => ({
    dial: new THREE.MeshStandardMaterial({ map: phoneDial(), roughness: 0.5 }),
  }))
  return (
    <Interactive
      id="telephone"
      label={objectMeta('telephone').tooltip}
      onActivate={open('telephone')}
      position={[PHONE.x, CRED.top, PHONE.z]}
      rotation={[0, 0.3, 0]}
      hitbox={{ size: [0.26, 0.16, 0.24], center: [0, 0.08, 0] }}
      hint={[0, 0.22, 0]}
    >
      {/* sloped body */}
      <RoundedBox args={[0.21, 0.05, 0.2]} radius={0.016} smoothness={3} position-y={0.025} castShadow material={m.olivePaint} />
      <RoundedBox args={[0.17, 0.05, 0.13]} radius={0.02} smoothness={3} position={[0, 0.065, -0.02]} castShadow material={m.olivePaint} />
      {/* dial */}
      <mesh position={[0, 0.075, 0.045]} rotation-x={-1.05} material={own.dial}>
        <circleGeometry args={[0.05, 28]} />
      </mesh>
      <mesh position={[0, 0.079, 0.047]} rotation-x={-1.05} material={m.chrome}>
        <torusGeometry args={[0.05, 0.004, 8, 28]} />
      </mesh>
      {/* cradle and handset */}
      {[-0.07, 0.07].map((x) => (
        <mesh key={x} position={[x, 0.1, -0.03]} material={m.olivePaint}>
          <boxGeometry args={[0.03, 0.03, 0.05]} />
        </mesh>
      ))}
      <group position={[0, 0.128, -0.03]}>
        <mesh rotation-z={Math.PI / 2} castShadow material={m.olivePaint}>
          <capsuleGeometry args={[0.016, 0.16, 6, 12]} />
        </mesh>
        {[-0.1, 0.1].map((x) => (
          <mesh key={x} position={[x, -0.012, 0]} castShadow material={m.olivePaint}>
            <cylinderGeometry args={[0.03, 0.026, 0.034, 16]} />
          </mesh>
        ))}
      </group>
    </Interactive>
  )
}

/** Mug with pencils, a stack of audio cassettes and a few floppy disks. */
export const DeskClutter = () => {
  const m = materials()
  const own = useDisposable(() => ({
    mug: new THREE.MeshStandardMaterial({ map: mugLabel(), roughness: 0.45 }),
    tapeA: new THREE.MeshStandardMaterial({ map: cassetteLabel('mix 1', '#b5532a'), roughness: 0.6 }),
    tapeB: new THREE.MeshStandardMaterial({ map: cassetteLabel('demo', '#5d6336'), roughness: 0.6 }),
    floppy: new THREE.MeshStandardMaterial({ color: '#2f3d55', roughness: 0.6 }),
  }))
  const y = DESK.top
  const left = DESK.x - DESK.w / 2
  return (
    <group>
      {/* pencil mug */}
      <group position={[left + 0.2, y, DESK.z - 0.22]}>
        <mesh position-y={0.05} castShadow material={own.mug}>
          <cylinderGeometry args={[0.04, 0.036, 0.1, 20]} />
        </mesh>
        {[
          [0.012, 0.3, '#e2b65a'],
          [-0.014, -0.25, '#a8461f'],
          [0.002, 0.08, '#5d6336'],
        ].map(([x, tilt, color]) => (
          <mesh key={String(color)} position={[Number(x), 0.12, 0]} rotation-z={Number(tilt)} castShadow>
            <cylinderGeometry args={[0.004, 0.004, 0.16, 6]} />
            <meshStandardMaterial color={String(color)} roughness={0.7} />
          </mesh>
        ))}
      </group>
      {/* coffee mug */}
      <group position={[left + 0.27, y, DESK.z + 0.2]}>
        <mesh position-y={0.045} castShadow material={m.cream}>
          <cylinderGeometry args={[0.04, 0.035, 0.09, 20]} />
        </mesh>
        <mesh position={[0.045, 0.045, 0]} rotation-y={Math.PI / 2} material={m.cream}>
          <torusGeometry args={[0.024, 0.007, 8, 16]} />
        </mesh>
      </group>
      {/* floppy disks, fanned */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[left + 0.24 + i * 0.012, y + 0.003 + i * 0.004, DESK.z - 0.02]} rotation-y={0.2 + i * 0.22} castShadow material={own.floppy}>
          <boxGeometry args={[0.09, 0.0035, 0.094]} />
        </mesh>
      ))}
      {/* audio cassettes */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[DESK.x + 0.03, y + 0.007 + i * 0.0145, DESK.z - 0.02]} rotation-y={-0.3 + i * 0.28} castShadow>
          <boxGeometry args={[0.102, 0.013, 0.064]} />
          <primitive object={m.charcoal} attach="material-0" />
          <primitive object={m.charcoal} attach="material-1" />
          <primitive object={i % 2 ? own.tapeB : own.tapeA} attach="material-2" />
          <primitive object={m.charcoal} attach="material-3" />
          <primitive object={m.charcoal} attach="material-4" />
          <primitive object={m.charcoal} attach="material-5" />
        </mesh>
      ))}
    </group>
  )
}
