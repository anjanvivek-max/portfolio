import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { phaseProgress, useStore, type Phase } from '../../store/useStore'
import { materials } from '../materials'
import { TAPE, VCR, VCR_SLOT } from '../layout'
import { FONT } from '../textures/canvas'
import { Interactive } from '../Interactions/Interactive'

const displayText = (phase: Phase): string => {
  switch (phase) {
    case 'tapeSelected':
      return 'READY'
    case 'tapeInserting':
      return 'LOAD'
    case 'crtStarting':
    case 'sectionOpen':
      return 'PLAY ▶'
    case 'ejecting':
      return 'EJECT'
    default:
      return '--:--'
  }
}

/** The VCR: cassette slot with a moving flap, a small display and transport buttons. */
export const Vcr = () => {
  const m = materials()
  const flap = useRef<THREE.Group>(null)
  const led = useRef<THREE.MeshBasicMaterial>(null)
  const phase = useStore((s) => s.phase)

  const display = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 64
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    const material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false })
    return { canvas, texture, material }
  }, [])

  useLayoutEffect(
    () => () => {
      display.texture.dispose()
      display.material.dispose()
    },
    [display],
  )

  // Redraw the display only when the state changes.
  useEffect(() => {
    const ctx = display.canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#050807'
    ctx.fillRect(0, 0, 256, 64)
    ctx.fillStyle = '#6dffb0'
    ctx.shadowColor = '#6dffb0'
    ctx.shadowBlur = 8
    ctx.font = FONT.crt(54)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(displayText(phase), 128, 34)
    display.texture.needsUpdate = true
  }, [phase, display])

  useFrame(({ clock }) => {
    const s = useStore.getState()
    const p = phaseProgress()
    // The flap swings inward while a tape passes through the slot.
    let open = 0
    if (s.phase === 'tapeInserting') open = THREE.MathUtils.smoothstep(p, 0.55, 0.68) * (1 - THREE.MathUtils.smoothstep(p, 0.96, 1))
    else if (s.phase === 'ejecting') open = THREE.MathUtils.smoothstep(p, 0.18, 0.26) * (1 - THREE.MathUtils.smoothstep(p, 0.52, 0.62))
    if (flap.current) flap.current.rotation.x = -open * 1.25
    if (led.current) {
      const playing = s.phase === 'crtStarting' || s.phase === 'sectionOpen'
      const busy = s.phase === 'tapeInserting' || s.phase === 'ejecting'
      const blink = busy ? 0.5 + 0.5 * Math.sign(Math.sin(clock.elapsedTime * 14)) : 1
      led.current.color.set(playing ? '#57ff8c' : busy ? '#ffb84d' : '#5a1a12')
      led.current.opacity = playing || busy ? blink : 1
    }
  })

  const slotW = TAPE.w + 0.03
  const slotH = TAPE.d + 0.014
  const frontLocalZ = VCR.d / 2
  const slotLocalX = VCR_SLOT.x - VCR.x
  const slotLocalY = VCR_SLOT.y - VCR.y

  return (
    <Interactive
      id="vcr"
      label="VCR · Choose a tape to play"
      onActivate={() => useStore.getState().setView('media')}
      position={[VCR.x, VCR.y, VCR.z]}
      hitbox={{ size: [VCR.w, VCR.h, VCR.d], center: [0, VCR.h / 2, 0] }}
      lift={0}
    >
      {/* body */}
      <mesh position-y={VCR.h / 2} castShadow receiveShadow material={m.black}>
        <boxGeometry args={[VCR.w, VCR.h, VCR.d]} />
      </mesh>
      <mesh position={[0, VCR.h / 2, frontLocalZ + 0.002]} material={m.charcoal}>
        <boxGeometry args={[VCR.w - 0.012, VCR.h - 0.014, 0.004]} />
      </mesh>
      {/* feet */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (VCR.w / 2 - 0.05), 0.003, frontLocalZ - 0.04]} material={m.blackGloss}>
          <boxGeometry args={[0.05, 0.006, 0.04]} />
        </mesh>
      ))}

      {/* cassette slot: dark recess with a hinged flap */}
      <mesh position={[slotLocalX, slotLocalY, frontLocalZ + 0.0045]} material={m.blackGloss}>
        <boxGeometry args={[slotW + 0.014, slotH + 0.014, 0.003]} />
      </mesh>
      <mesh position={[slotLocalX, slotLocalY, frontLocalZ + 0.0052]}>
        <planeGeometry args={[slotW, slotH]} />
        <meshBasicMaterial color="#020202" />
      </mesh>
      <group ref={flap} position={[slotLocalX, slotLocalY + slotH / 2, frontLocalZ + 0.0066]}>
        <mesh position-y={-slotH / 2} material={m.black}>
          <boxGeometry args={[slotW, slotH, 0.0025]} />
        </mesh>
      </group>

      {/* display */}
      <mesh position={[VCR.w / 2 - 0.115, VCR.h / 2 + 0.012, frontLocalZ + 0.0052]} material={display.material}>
        <planeGeometry args={[0.13, 0.034]} />
      </mesh>
      {/* status light */}
      <mesh position={[VCR.w / 2 - 0.2, VCR.h / 2 + 0.012, frontLocalZ + 0.006]}>
        <circleGeometry args={[0.005, 12]} />
        <meshBasicMaterial ref={led} color="#5a1a12" transparent toneMapped={false} />
      </mesh>
      {/* transport buttons */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[VCR.w / 2 - 0.166 + i * 0.034, VCR.h / 2 - 0.026, frontLocalZ + 0.007]} material={m.steel}>
          <boxGeometry args={[0.026, 0.012, 0.006]} />
        </mesh>
      ))}
    </Interactive>
  )
}
