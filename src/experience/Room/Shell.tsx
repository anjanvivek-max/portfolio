import { useMemo } from 'react'
import * as THREE from 'three'
import { materials } from '../materials'
import { BACK_Z, ROOM, WIN } from '../layout'

const noRaycast = () => null

/** Flat wall piece whose UVs follow world position, so the wallpaper lines up across pieces. */
const wallPiece = (x0: number, x1: number, y0: number, y1: number, span: number): THREE.BufferGeometry => {
  const geometry = new THREE.PlaneGeometry(x1 - x0, y1 - y0)
  geometry.translate((x0 + x1) / 2, (y0 + y1) / 2, 0)
  const pos = geometry.attributes.position
  const uv = geometry.attributes.uv
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) + span / 2) / span, pos.getY(i) / ROOM.h)
  }
  return geometry
}

/** Pleated curtain panel. */
const curtainGeometry = (width: number, height: number): THREE.BufferGeometry => {
  const geometry = new THREE.PlaneGeometry(width, height, 40, 1)
  const pos = geometry.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    pos.setZ(i, Math.sin((x / width) * Math.PI * 9) * 0.035)
  }
  geometry.computeVertexNormals()
  return geometry
}

/** Floor, walls, ceiling, wainscot, window frame and curtains. */
export const Shell = () => {
  const m = materials()
  const W = ROOM.halfW * 2
  const D = ROOM.halfD * 2
  const wainscot = 0.86

  const geo = useMemo(() => {
    const back = [
      wallPiece(-ROOM.halfW, WIN.x0, 0, ROOM.h, W),
      wallPiece(WIN.x1, ROOM.halfW, 0, ROOM.h, W),
      wallPiece(WIN.x0, WIN.x1, 0, WIN.y0, W),
      wallPiece(WIN.x0, WIN.x1, WIN.y1, ROOM.h, W),
    ]
    return {
      back,
      side: wallPiece(-ROOM.halfD, ROOM.halfD, 0, ROOM.h, D),
      front: wallPiece(-ROOM.halfW, ROOM.halfW, 0, ROOM.h, W),
      curtain: curtainGeometry(0.62, WIN.y1 - 0.12),
    }
  }, [W, D])

  const winW = WIN.x1 - WIN.x0
  const winH = WIN.y1 - WIN.y0
  const winCx = (WIN.x0 + WIN.x1) / 2
  const winCy = (WIN.y0 + WIN.y1) / 2
  const mullions = [1, 2, 3].map((i) => WIN.x0 + (winW * i) / 4)

  return (
    <group>
      {/* floor and rug */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow material={m.floor} raycast={noRaycast}>
        <planeGeometry args={[W, D]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[-0.3, 0.006, -0.35]} receiveShadow material={m.rug} raycast={noRaycast}>
        <planeGeometry args={[3.9, 2.6]} />
      </mesh>

      {/* ceiling */}
      <mesh rotation-x={Math.PI / 2} position-y={ROOM.h} material={m.ceiling} raycast={noRaycast}>
        <planeGeometry args={[W, D]} />
      </mesh>

      {/* walls */}
      {geo.back.map((g, i) => (
        <mesh key={i} geometry={g} position-z={BACK_Z} material={m.wall} receiveShadow raycast={noRaycast} />
      ))}
      <mesh geometry={geo.side} rotation-y={Math.PI / 2} position-x={-ROOM.halfW} material={m.wall} receiveShadow raycast={noRaycast} />
      <mesh geometry={geo.side} rotation-y={-Math.PI / 2} position-x={ROOM.halfW} material={m.wall} receiveShadow raycast={noRaycast} />
      <mesh geometry={geo.front} rotation-y={Math.PI} position-z={ROOM.halfD} material={m.wall} raycast={noRaycast} />

      {/* wood wainscot with chair rail on the three visible walls */}
      <group>
        <mesh position={[0, wainscot / 2, BACK_Z + 0.012]} material={m.walnut} receiveShadow raycast={noRaycast}>
          <boxGeometry args={[W, wainscot, 0.024]} />
        </mesh>
        <mesh position={[0, wainscot + 0.02, BACK_Z + 0.03]} material={m.darkWood} raycast={noRaycast}>
          <boxGeometry args={[W, 0.045, 0.06]} />
        </mesh>
        {[-1, 1].map((side) => (
          <group key={side}>
            <mesh position={[side * (ROOM.halfW - 0.012), wainscot / 2, 0]} material={m.walnut} receiveShadow raycast={noRaycast}>
              <boxGeometry args={[0.024, wainscot, D]} />
            </mesh>
            <mesh position={[side * (ROOM.halfW - 0.03), wainscot + 0.02, 0]} material={m.darkWood} raycast={noRaycast}>
              <boxGeometry args={[0.06, 0.045, D]} />
            </mesh>
            <mesh position={[side * (ROOM.halfW - 0.02), 0.05, 0]} material={m.darkWood} raycast={noRaycast}>
              <boxGeometry args={[0.04, 0.1, D]} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 0.05, BACK_Z + 0.04]} material={m.darkWood} raycast={noRaycast}>
          <boxGeometry args={[W, 0.1, 0.04]} />
        </mesh>
        {/* cornice */}
        <mesh position={[0, ROOM.h - 0.04, BACK_Z + 0.04]} material={m.darkWood} raycast={noRaycast}>
          <boxGeometry args={[W, 0.08, 0.08]} />
        </mesh>
      </group>

      {/* window frame */}
      <group position-z={BACK_Z}>
        <mesh position={[winCx, WIN.y1 + 0.04, -0.03]} material={m.darkWood} castShadow raycast={noRaycast}>
          <boxGeometry args={[winW + 0.2, 0.09, 0.2]} />
        </mesh>
        <mesh position={[winCx, WIN.y0 - 0.025, 0.02]} material={m.darkWood} castShadow receiveShadow raycast={noRaycast}>
          <boxGeometry args={[winW + 0.26, 0.05, 0.32]} />
        </mesh>
        {[WIN.x0 - 0.04, WIN.x1 + 0.04].map((x) => (
          <mesh key={x} position={[x, winCy, -0.03]} material={m.darkWood} raycast={noRaycast}>
            <boxGeometry args={[0.09, winH + 0.08, 0.2]} />
          </mesh>
        ))}
        {mullions.map((x) => (
          <mesh key={x} position={[x, winCy, -0.05]} material={m.darkWood} raycast={noRaycast}>
            <boxGeometry args={[0.055, winH, 0.09]} />
          </mesh>
        ))}
        {/* rolled blind under the top rail */}
        <mesh position={[winCx, WIN.y1 - 0.05, -0.02]} rotation-z={Math.PI / 2} material={m.cream} raycast={noRaycast}>
          <cylinderGeometry args={[0.035, 0.035, winW - 0.04, 12]} />
        </mesh>
      </group>

      {/* curtain rod and curtains */}
      <mesh position={[winCx, WIN.y1 + 0.13, BACK_Z + 0.12]} rotation-z={Math.PI / 2} material={m.brass} raycast={noRaycast}>
        <cylinderGeometry args={[0.014, 0.014, winW + 0.5, 10]} />
      </mesh>
      {[WIN.x0 - 0.02, WIN.x1 - 0.12].map((x, i) => (
        <mesh
          key={x}
          geometry={geo.curtain}
          position={[x + (i === 0 ? 0.08 : 0), (WIN.y1 + 0.12) / 2 + 0.06, BACK_Z + 0.12]}
          material={m.fabricOlive}
          castShadow
          raycast={noRaycast}
        />
      ))}
    </group>
  )
}
