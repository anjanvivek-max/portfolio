import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { CameraControls, CameraControlsImpl } from '@react-three/drei'
import type { PerspectiveCamera } from 'three'
import { useStore } from '../../store/useStore'
import { INTRO_START, resolveView } from '../Interactions/views'

const { ACTION } = CameraControlsImpl

const fovFor = (aspect: number): number => (aspect < 0.75 ? 74 : aspect < 1.15 ? 62 : 50)

/**
 * Camera behaviour: free look within safe limits while the room is idle, and smooth,
 * non-interruptible glides between named viewpoints whenever the state machine asks.
 */
export const CameraRig = () => {
  const controls = useRef<CameraControlsImpl>(null)
  const camera = useThree((s) => s.camera) as PerspectiveCamera
  const width = useThree((s) => s.size.width)
  const height = useThree((s) => s.size.height)

  const view = useStore((s) => s.view)
  const viewTick = useStore((s) => s.viewTick)
  const phase = useStore((s) => s.phase)
  const compact = useStore((s) => s.compact)
  const reducedMotion = useStore((s) => s.reducedMotion)
  const intro = phase === 'intro'
  const loading = phase === 'loading'
  const first = useRef(true)

  // Input mapping: rotate and zoom only. Panning would let visitors drift through walls.
  useEffect(() => {
    const c = controls.current
    if (!c) return
    c.mouseButtons.left = ACTION.ROTATE
    c.mouseButtons.right = ACTION.NONE
    c.mouseButtons.middle = ACTION.NONE
    c.mouseButtons.wheel = ACTION.DOLLY
    c.touches.one = ACTION.TOUCH_ROTATE
    c.touches.two = compact ? ACTION.NONE : ACTION.TOUCH_DOLLY
    c.touches.three = ACTION.NONE
    c.dollySpeed = 0.6
    c.azimuthRotateSpeed = 0.55
    c.polarRotateSpeed = 0.55
    c.draggingSmoothTime = 0.14
    c.restThreshold = 0.002
  }, [compact])

  useEffect(() => {
    const c = controls.current
    if (c) c.enabled = phase === 'room'
  }, [phase])

  useEffect(() => {
    const c = controls.current
    if (!c || width === 0 || height === 0) return
    const aspect = width / height
    const fovDeg = fovFor(aspect)
    if (camera.fov !== fovDeg) {
      camera.fov = fovDeg
      camera.updateProjectionMatrix()
    }

    const pose = resolveView(view, { aspect, fovDeg, compact })
    const [px, py, pz] = pose.position
    const [tx, ty, tz] = pose.target
    const dx = px - tx
    const dy = py - ty
    const dz = pz - tz
    const distance = Math.hypot(dx, dy, dz)
    const azimuth = Math.atan2(dx, dz)
    const polar = Math.acos(dy / distance)

    // Limits are centred on the destination pose, so the glide always ends inside them.
    c.minAzimuthAngle = azimuth - pose.azimuth
    c.maxAzimuthAngle = azimuth + pose.azimuth
    c.minPolarAngle = Math.max(0.2, polar - pose.polarUp)
    c.maxPolarAngle = Math.min(Math.PI - 0.2, polar + pose.polarDown)
    c.minDistance = distance * pose.zoomIn
    c.maxDistance = distance * pose.zoomOut

    // Side panels cover part of the screen: slide the subject into the free area.
    let offset = 0
    if (pose.panel && !compact) {
      const panelFraction = Math.min(480 / width, 0.48)
      offset = panelFraction * distance * Math.tan((fovDeg * Math.PI) / 360) * aspect
    }

    const instant = first.current || loading || reducedMotion
    first.current = false

    if (intro && !reducedMotion) {
      // Opening reveal: start close to the television, then pull back slowly.
      void c.setLookAt(...INTRO_START.position, ...INTRO_START.target, false)
      c.smoothTime = 1.15
    } else {
      c.smoothTime = view === 'tv' || view === 'computer' ? 0.42 : 0.5
    }
    void c.setFocalOffset(offset, 0, 0, !instant)
    void c.setLookAt(px, py, pz, tx, ty, tz, !instant)
  }, [view, viewTick, intro, loading, compact, reducedMotion, width, height, camera])

  return <CameraControls ref={controls} makeDefault />
}
