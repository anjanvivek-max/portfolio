import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'
import { hintSprite } from '../textures/surfaces'

interface Props {
  id: string
  /** Short tooltip text. */
  label: string
  onActivate: () => void
  children: ReactNode
  /** Local position of the pulsing hint marker. Omit for no marker. */
  hint?: [number, number, number]
  /** Invisible box that defines the clickable area: [width, height, depth] and its centre. */
  hitbox?: { size: [number, number, number]; center?: [number, number, number] }
  /** How far the object rises when hovered. */
  lift?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
}

let hintTexture: THREE.Texture | null = null

/**
 * Wraps a room object and makes it genuinely interactive: hover lift, pointer cursor,
 * tooltip, click action and an optional pulsing hint so it can be discovered.
 * Input is only accepted while the room is idle, which keeps transitions uninterruptible.
 */
export const Interactive = ({ id, label, onActivate, children, hint, hitbox, lift = 0.012, position, rotation }: Props) => {
  const inner = useRef<THREE.Group>(null)
  const marker = useRef<THREE.Sprite>(null)
  const state = useRef({ hover: 0, shown: 0 })

  const markerMaterial = useMemo(() => {
    if (!hint) return null
    hintTexture ??= hintSprite()
    return new THREE.SpriteMaterial({
      map: hintTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
      toneMapped: false,
    })
  }, [hint])

  useEffect(() => () => markerMaterial?.dispose(), [markerMaterial])

  useFrame(({ clock }, delta) => {
    const s = useStore.getState()
    const hovered = s.hovered?.id === id
    const st = state.current
    st.hover = THREE.MathUtils.damp(st.hover, hovered ? 1 : 0, 10, delta)
    if (inner.current) {
      inner.current.position.y = st.hover * lift
      const k = 1 + st.hover * (lift > 0 ? 0.025 : 0)
      inner.current.scale.setScalar(k)
    }
    if (marker.current && markerMaterial) {
      const visible = s.phase === 'room' && !s.reducedMotion ? 1 : s.phase === 'room' ? 0.75 : 0
      st.shown = THREE.MathUtils.damp(st.shown, visible, 4, delta)
      const pulse = s.reducedMotion ? 0.5 : 0.5 + 0.5 * Math.sin(clock.elapsedTime * 2.2 + id.length)
      markerMaterial.opacity = st.shown * (0.35 + 0.4 * pulse + st.hover * 0.3)
      const size = 0.05 + 0.012 * pulse + st.hover * 0.02
      marker.current.scale.set(size, size, 1)
      marker.current.visible = markerMaterial.opacity > 0.01
    }
  })

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const s = useStore.getState()
    if (s.phase !== 'room') return
    s.setHovered({ id, label })
    document.body.style.cursor = 'pointer'
  }
  const out = () => {
    const s = useStore.getState()
    if (s.hovered?.id === id) s.setHovered(null)
    document.body.style.cursor = ''
  }
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    // A drag that ends over the object is a camera move, not a click.
    if (e.delta > 6) return
    if (useStore.getState().phase !== 'room') return
    document.body.style.cursor = ''
    onActivate()
  }

  useEffect(
    () => () => {
      const s = useStore.getState()
      if (s.hovered?.id === id) s.setHovered(null)
    },
    [id],
  )

  return (
    <group position={position} rotation={rotation} onPointerOver={over} onPointerOut={out} onClick={click}>
      <group ref={inner}>{children}</group>
      {hitbox && (
        <mesh position={hitbox.center} visible={false}>
          <boxGeometry args={hitbox.size} />
          <meshBasicMaterial />
        </mesh>
      )}
      {hint && markerMaterial && (
        <sprite ref={marker} position={hint} material={markerMaterial} renderOrder={20} raycast={() => null} />
      )}
    </group>
  )
}
