import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import { materials } from '../materials'
import { BOOKSHELF, CRED, DESK } from '../layout'
import { seeded } from '../textures/canvas'
import { bookSpine, magazine } from '../textures/art'

const Handle = ({ position }: { position: [number, number, number] }) => {
  const m = materials()
  return (
    <mesh position={position} rotation-z={Math.PI / 2} material={m.brass}>
      <cylinderGeometry args={[0.009, 0.009, 0.11, 8]} />
    </mesh>
  )
}

/** Vintage wooden desk with two drawer pedestals. */
export const Desk = () => {
  const m = materials()
  const pedestalW = 0.5
  const pedestalH = DESK.top - 0.045
  const drawers = [0.56, 0.36, 0.14]
  return (
    <group position={[DESK.x, 0, DESK.z]}>
      {/* top with a slightly darker edge band */}
      <mesh position-y={DESK.top - 0.0225} castShadow receiveShadow material={m.walnut}>
        <boxGeometry args={[DESK.w, 0.045, DESK.d]} />
      </mesh>
      <mesh position-y={DESK.top - 0.06} material={m.darkWood}>
        <boxGeometry args={[DESK.w - 0.06, 0.03, DESK.d - 0.06]} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} position-x={side * (DESK.w / 2 - pedestalW / 2 - 0.03)}>
          <mesh position-y={pedestalH / 2} castShadow receiveShadow material={m.walnutPlain}>
            <boxGeometry args={[pedestalW, pedestalH, DESK.d - 0.08]} />
          </mesh>
          {drawers.map((y) => (
            <group key={y} position={[0, y, DESK.d / 2 - 0.035]}>
              <mesh material={m.walnut} castShadow>
                <boxGeometry args={[pedestalW - 0.05, 0.17, 0.02]} />
              </mesh>
              <Handle position={[0, 0, 0.022]} />
            </group>
          ))}
          <mesh position-y={0.025} material={m.darkWood}>
            <boxGeometry args={[pedestalW + 0.01, 0.05, DESK.d - 0.07]} />
          </mesh>
        </group>
      ))}
      {/* modesty panel */}
      <mesh position={[0, 0.42, -DESK.d / 2 + 0.06]} material={m.walnutPlain} receiveShadow>
        <boxGeometry args={[DESK.w - pedestalW * 2 - 0.06, 0.5, 0.02]} />
      </mesh>
    </group>
  )
}

/** Wooden chair with upholstered seat and back. */
export const Chair = () => {
  const m = materials()
  const legs: [number, number][] = [
    [-0.2, -0.19],
    [0.2, -0.19],
    [-0.21, 0.2],
    [0.21, 0.2],
  ]
  return (
    <group position={[DESK.x - 0.12, 0, DESK.z + 0.98]} rotation-y={Math.PI + 0.38}>
      {legs.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.225, z]} castShadow material={m.darkWood}>
          <cylinderGeometry args={[0.022, 0.016, 0.45, 8]} />
        </mesh>
      ))}
      <mesh position-y={0.44} castShadow material={m.darkWood}>
        <boxGeometry args={[0.47, 0.035, 0.45]} />
      </mesh>
      <RoundedBox args={[0.45, 0.07, 0.43]} radius={0.03} smoothness={3} position-y={0.49} castShadow material={m.fabricOlive} />
      {/* back posts lean slightly */}
      {[-0.2, 0.2].map((x) => (
        <mesh key={x} position={[x, 0.72, -0.215]} rotation-x={-0.1} castShadow material={m.darkWood}>
          <cylinderGeometry args={[0.018, 0.02, 0.56, 8]} />
        </mesh>
      ))}
      <RoundedBox args={[0.44, 0.3, 0.05]} radius={0.022} smoothness={3} position={[0, 0.82, -0.235]} rotation-x={-0.1} castShadow material={m.fabricOlive} />
      <mesh position={[0, 0.995, -0.25]} rotation-z={Math.PI / 2} castShadow material={m.darkWood}>
        <cylinderGeometry args={[0.02, 0.02, 0.46, 8]} />
      </mesh>
    </group>
  )
}

/** Low media cabinet that carries the VCR, television, telephone and tape rack. */
export const Credenza = () => {
  const m = materials()
  const bodyH = CRED.top - 0.14
  const doors = [-0.975, -0.325, 0.325, 0.975]
  return (
    <group position={[CRED.x, 0, CRED.z]}>
      <mesh position-y={CRED.top - 0.02} castShadow receiveShadow material={m.walnut}>
        <boxGeometry args={[CRED.w, 0.04, CRED.d]} />
      </mesh>
      <mesh position-y={0.14 + bodyH / 2 - 0.02} castShadow receiveShadow material={m.walnutPlain}>
        <boxGeometry args={[CRED.w - 0.04, bodyH - 0.04, CRED.d - 0.04]} />
      </mesh>
      {doors.map((x, i) => (
        <group key={x} position={[x, 0.14 + bodyH / 2 - 0.02, CRED.d / 2 - 0.012]}>
          <mesh material={i % 2 === 0 ? m.walnut : m.tvWood} castShadow>
            <boxGeometry args={[0.62, bodyH - 0.09, 0.018]} />
          </mesh>
          <mesh position={[i % 2 === 0 ? 0.25 : -0.25, 0, 0.016]} material={m.brass}>
            <cylinderGeometry args={[0.009, 0.009, 0.1, 8]} />
          </mesh>
        </group>
      ))}
      {/* tapered legs */}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh
            key={`${sx}${sz}`}
            position={[sx * (CRED.w / 2 - 0.12), 0.07, sz * (CRED.d / 2 - 0.08)]}
            castShadow
            material={m.darkWood}
          >
            <cylinderGeometry args={[0.024, 0.014, 0.14, 8]} />
          </mesh>
        )),
      )}
    </group>
  )
}

const BOOK_COLORS = ['#7d3a20', '#5d6336', '#2f5d62', '#b08d4a', '#3f3a5a', '#8a5a2b', '#a8461f', '#d9c7a3', '#4a2f1c', '#6b7a3a', '#7d3b4a', '#c9b48a']

interface BookInstance {
  position: [number, number, number]
  scale: [number, number, number]
  tilt: number
  color: string
}

/** Tall bookshelf with books, magazines and a few keepsakes. Books are one instanced mesh. */
export const BookshelfUnit = () => {
  const m = materials()
  const mesh = useRef<THREE.InstancedMesh>(null)
  const { w, d, h } = BOOKSHELF
  const shelfYs = useMemo(() => [0.08, 0.5, 0.9, 1.3, 1.68], [])
  const inner = w - 0.07

  const books = useMemo<BookInstance[]>(() => {
    const rand = seeded(404)
    const list: BookInstance[] = []
    shelfYs.forEach((shelfY, row) => {
      // Leave room on some shelves for magazines and objects.
      const start = -inner / 2 + 0.015
      const end = row === 1 ? inner / 2 - 0.36 : row === 3 ? inner / 2 - 0.3 : inner / 2 - 0.02
      let x = start
      while (x < end - 0.03) {
        const thickness = 0.022 + rand() * 0.034
        const height = 0.2 + rand() * 0.12
        const depth = 0.15 + rand() * 0.06
        if (x + thickness > end) break
        const leaning = rand() > 0.9
        list.push({
          position: [x + thickness / 2, shelfY + 0.012 + height / 2, d / 2 - 0.03 - depth / 2],
          scale: [thickness, height, depth],
          tilt: leaning ? 0.12 : 0,
          color: BOOK_COLORS[Math.floor(rand() * BOOK_COLORS.length)],
        })
        x += thickness + (leaning ? 0.03 : 0.002)
        if (rand() > 0.93) x += 0.04
      }
    })
    return list
  }, [inner, d, shelfYs])

  const spine = useMemo(() => new THREE.MeshStandardMaterial({ map: bookSpine(), roughness: 0.82 }), [])
  const covers = useMemo(
    () => [
      new THREE.MeshStandardMaterial({ map: magazine('MICRO', '#2f5d62', 'HOME COMPUTING'), roughness: 0.6 }),
      new THREE.MeshStandardMaterial({ map: magazine('DATA', '#a8461f', 'BITS & BYTES'), roughness: 0.6 }),
    ],
    [],
  )

  useLayoutEffect(() => {
    const im = mesh.current
    if (!im) return
    const dummy = new THREE.Object3D()
    const color = new THREE.Color()
    books.forEach((b, i) => {
      dummy.position.set(...b.position)
      dummy.rotation.set(0, 0, b.tilt)
      dummy.scale.set(...b.scale)
      dummy.updateMatrix()
      im.setMatrixAt(i, dummy.matrix)
      im.setColorAt(i, color.set(b.color))
    })
    im.instanceMatrix.needsUpdate = true
    if (im.instanceColor) im.instanceColor.needsUpdate = true
    im.computeBoundingSphere()
  }, [books])

  useLayoutEffect(
    () => () => {
      spine.dispose()
      covers.forEach((c) => c.dispose())
    },
    [spine, covers],
  )

  return (
    <group position={[BOOKSHELF.x, 0, BOOKSHELF.z]}>
      {/* carcass */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (w / 2 - 0.0175), h / 2, 0]} castShadow receiveShadow material={m.darkWood}>
          <boxGeometry args={[0.035, h, d]} />
        </mesh>
      ))}
      <mesh position={[0, h / 2, -d / 2 + 0.008]} material={m.walnutPlain} receiveShadow>
        <boxGeometry args={[w, h, 0.016]} />
      </mesh>
      <mesh position={[0, h - 0.0175, 0]} castShadow material={m.darkWood}>
        <boxGeometry args={[w + 0.03, 0.035, d + 0.02]} />
      </mesh>
      {shelfYs.map((y) => (
        <mesh key={y} position={[0, y, 0]} receiveShadow castShadow material={m.walnut}>
          <boxGeometry args={[inner, 0.024, d - 0.02]} />
        </mesh>
      ))}
      <mesh position={[0, 0.035, 0.01]} material={m.darkWood}>
        <boxGeometry args={[inner, 0.07, d - 0.04]} />
      </mesh>

      <instancedMesh ref={mesh} args={[undefined, undefined, books.length]} material={spine} castShadow>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>

      {/* magazines: a face-out issue and a flat stack */}
      <mesh position={[inner / 2 - 0.18, shelfYs[1] + 0.012 + 0.14, 0.02]} rotation-x={-0.14} material={covers[0]} castShadow>
        <boxGeometry args={[0.21, 0.28, 0.006]} />
      </mesh>
      <mesh position={[inner / 2 - 0.15, shelfYs[3] + 0.03, 0.01]} rotation-y={0.2} castShadow>
        <boxGeometry args={[0.21, 0.035, 0.28]} />
        <meshStandardMaterial attach="material-0" color="#e8dfc8" roughness={0.9} />
        <meshStandardMaterial attach="material-1" color="#e8dfc8" roughness={0.9} />
        <primitive object={covers[1]} attach="material-2" />
        <meshStandardMaterial attach="material-3" color="#e8dfc8" roughness={0.9} />
        <meshStandardMaterial attach="material-4" color="#e8dfc8" roughness={0.9} />
        <meshStandardMaterial attach="material-5" color="#e8dfc8" roughness={0.9} />
      </mesh>
      {/* small globe on the stack */}
      <group position={[inner / 2 - 0.15, shelfYs[3] + 0.05, 0.01]}>
        <mesh position-y={0.012} material={m.brass}>
          <cylinderGeometry args={[0.035, 0.045, 0.02, 14]} />
        </mesh>
        <mesh position-y={0.085} castShadow material={m.olivePaint}>
          <sphereGeometry args={[0.06, 18, 14]} />
        </mesh>
      </group>
    </group>
  )
}
