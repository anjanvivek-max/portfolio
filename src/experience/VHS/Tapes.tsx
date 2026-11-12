import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { tapes } from '../../data/sections'
import type { TapeDef } from '../../data/types'
import { phaseProgress, useStore } from '../../store/useStore'
import { materials } from '../materials'
import { CRED, RACK, TAPE, TAPE_LEAN, tapeRest, VCR_SLOT } from '../layout'
import { tapeFront, tapeSpine } from '../textures/labels'
import { Interactive } from '../Interactions/Interactive'

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const clamp01 = (t: number) => Math.min(1, Math.max(0, t))

/** Flat in front of the slot, label up, spine toward the viewer. */
const PRE_SLOT = new THREE.Vector3(VCR_SLOT.x, VCR_SLOT.y, VCR_SLOT.z + TAPE.h / 2 + 0.07)
/** Fully swallowed by the VCR. */
const IN_SLOT = new THREE.Vector3(VCR_SLOT.x, VCR_SLOT.y, VCR_SLOT.z - TAPE.h / 2 - 0.03)
const FLAT = -Math.PI / 2

const scratch = {
  a: new THREE.Vector3(),
  b: new THREE.Vector3(),
  c: new THREE.Vector3(),
}

/** Quadratic bezier between two points with a raised control point, for a carried arc. */
const arc = (out: THREE.Vector3, from: THREE.Vector3, to: THREE.Vector3, t: number, lift: number) => {
  scratch.c.copy(from).lerp(to, 0.5)
  scratch.c.y += lift
  scratch.c.z += lift * 0.9
  const u = 1 - t
  out.set(
    u * u * from.x + 2 * u * t * scratch.c.x + t * t * to.x,
    u * u * from.y + 2 * u * t * scratch.c.y + t * t * to.y,
    u * u * from.z + 2 * u * t * scratch.c.z + t * t * to.z,
  )
}

interface TapeProps {
  tape: TapeDef
  index: number
}

/**
 * One VHS cassette. Its pose is a pure function of the state machine's phase and progress,
 * so the animation can never drift out of step with what the application believes.
 */
const Tape = ({ tape, index }: TapeProps) => {
  const m = materials()
  const body = useRef<THREE.Group>(null)
  const rest = useMemo(() => new THREE.Vector3(...tapeRest(index)), [index])
  /** Held up toward the visitor after being picked. */
  const held = useMemo(() => new THREE.Vector3(rest.x - 0.06, rest.y + 0.2, rest.z + 0.3), [rest])

  const faces = useMemo(() => {
    const front = new THREE.MeshStandardMaterial({ map: tapeFront(tape, index), roughness: 0.55 })
    const spine = new THREE.MeshStandardMaterial({ map: tapeSpine(tape, index), roughness: 0.6 })
    return { front, spine }
  }, [tape, index])
  useLayoutEffect(
    () => () => {
      faces.front.dispose()
      faces.spine.dispose()
    },
    [faces],
  )

  useFrame(() => {
    const g = body.current
    if (!g) return
    const s = useStore.getState()
    const mine = s.activeSection === tape.section
    const p = phaseProgress()
    let rotX = TAPE_LEAN
    let rotZ = 0
    let visible = true
    const pos = scratch.a.copy(rest)

    if (mine) {
      switch (s.phase) {
        case 'tapeSelected': {
          const t = easeOut(p)
          pos.lerpVectors(rest, held, t)
          rotX = THREE.MathUtils.lerp(TAPE_LEAN, 0.12, t)
          rotZ = Math.sin(t * Math.PI) * 0.08
          break
        }
        case 'tapeInserting': {
          // 0..0.62 carry to the slot, 0.62..1 slide in.
          const carry = easeInOut(clamp01(p / 0.62))
          const slide = clamp01((p - 0.62) / 0.38)
          arc(pos, held, PRE_SLOT, carry, 0.1)
          rotX = THREE.MathUtils.lerp(0.12, FLAT, carry)
          if (slide > 0) pos.lerpVectors(PRE_SLOT, IN_SLOT, slide * slide)
          break
        }
        case 'crtStarting':
        case 'sectionOpen':
          pos.copy(IN_SLOT)
          rotX = FLAT
          visible = false
          break
        case 'ejecting': {
          // 0..0.2 the screen collapses, 0.2..0.5 the tape is pushed out, then it flies home.
          const push = easeOut(clamp01((p - 0.2) / 0.3))
          const fly = easeInOut(clamp01((p - 0.5) / 0.5))
          pos.lerpVectors(IN_SLOT, PRE_SLOT, push)
          rotX = FLAT
          visible = p > 0.2
          if (fly > 0) {
            arc(pos, PRE_SLOT, rest, fly, 0.16)
            rotX = THREE.MathUtils.lerp(FLAT, TAPE_LEAN, fly)
          }
          break
        }
        default:
          break
      }
    }
    g.position.copy(pos)
    g.rotation.set(rotX, 0, rotZ)
    g.visible = visible
  })

  const play = () => useStore.getState().playTape(tape.section)

  // Box faces: +x, -x, +y (flap edge), -y (spine label), +z (front label), -z (back).
  return (
    <group ref={body} position={rest} rotation-x={TAPE_LEAN}>
      <Interactive
        id={`tape-${tape.section}`}
        label={`Play tape: ${tape.label}`}
        onActivate={play}
        lift={0.03}
        hitbox={{ size: [TAPE.w + 0.016, TAPE.h + 0.02, TAPE.d + 0.05] }}
      >
        <mesh castShadow>
          <boxGeometry args={[TAPE.w, TAPE.h, TAPE.d]} />
          <primitive object={m.black} attach="material-0" />
          <primitive object={m.black} attach="material-1" />
          <primitive object={m.charcoal} attach="material-2" />
          <primitive object={faces.spine} attach="material-3" />
          <primitive object={faces.front} attach="material-4" />
          <primitive object={m.black} attach="material-5" />
        </mesh>
      </Interactive>
    </group>
  )
}

/** Two-tier wooden rack on the media cabinet holding the eight tapes. */
export const TapeRack = () => {
  const m = materials()
  const width = 4 * TAPE.w + 3 * 0.02 + 0.07
  return (
    <group>
      <group position={[RACK.x, CRED.top, RACK.z]}>
        {/* raised back step */}
        <mesh position={[0, 0.08, -0.1]} castShadow receiveShadow material={m.walnutPlain}>
          <boxGeometry args={[width, 0.16, 0.13]} />
        </mesh>
        {/* front lip and back board keep the tapes leaning neatly */}
        <mesh position={[0, 0.008, 0.115]} castShadow material={m.darkWood}>
          <boxGeometry args={[width, 0.016, 0.02]} />
        </mesh>
        <mesh position={[0, 0.17, -0.172]} castShadow receiveShadow material={m.darkWood}>
          <boxGeometry args={[width, 0.34, 0.014]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * (width / 2 + 0.007), 0.1, -0.03]} castShadow material={m.darkWood}>
            <boxGeometry args={[0.014, 0.2, 0.3]} />
          </mesh>
        ))}
      </group>
      {tapes.map((tape, i) => (
        <Tape key={tape.section} tape={tape} index={i} />
      ))}
    </group>
  )
}
