import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'
import { GROUND_Y, VIADUCT } from '../layout'
import { seeded } from '../textures/canvas'
import { glowSprite } from '../textures/surfaces'

const noRaycast = () => null

/** Deep-blue evening sky with a soft glow above the horizon, a moon and a few stars. */
export const Sky = () => {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {},
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vDir;
          float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          void main() {
            float h = clamp(vDir.y, -0.2, 1.0);
            vec3 zenith = vec3(0.012, 0.022, 0.07);
            vec3 mid = vec3(0.035, 0.07, 0.19);
            vec3 low = vec3(0.1, 0.15, 0.32);
            vec3 glow = vec3(0.36, 0.25, 0.3);
            vec3 col = mix(mid, zenith, smoothstep(0.12, 0.75, h));
            col = mix(low, col, smoothstep(0.0, 0.22, h));
            col = mix(glow, col, smoothstep(-0.03, 0.075, h));
            // sparse stars, fading out toward the bright horizon
            vec2 cell = floor(vDir.xz / max(vDir.y, 0.05) * 90.0);
            float star = step(0.9965, hash(cell)) * smoothstep(0.16, 0.5, h);
            col += vec3(0.8, 0.85, 1.0) * star * (0.3 + 0.7 * hash(cell + 3.0));
            // moon with a faint halo
            vec3 moonDir = normalize(vec3(0.38, 0.33, -1.0));
            float m = dot(normalize(vDir), moonDir);
            col += vec3(0.95, 0.93, 0.82) * smoothstep(0.99935, 0.9996, m);
            col += vec3(0.3, 0.36, 0.5) * pow(max(m, 0.0), 600.0) * 0.5;
            gl_FragColor = vec4(col, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `,
      }),
    [],
  )
  useLayoutEffect(() => () => material.dispose(), [material])
  return (
    <mesh material={material} raycast={noRaycast} frustumCulled={false}>
      <sphereGeometry args={[2200, 32, 20]} />
    </mesh>
  )
}

interface Lane {
  from: THREE.Vector3
  to: THREE.Vector3
  cars: number
  speed: number
  /** Which lights face the room: white headlights, red tail lights, or both for crossing traffic. */
  facing: 'head' | 'tail' | 'cross'
}

const AVENUE_X = 28
const ROAD_Y = GROUND_Y + 0.6
const CROSS_Z = VIADUCT.z - 20

const LANES: Lane[] = [
  // avenue running away from the building: nearer lane comes toward us
  { from: new THREE.Vector3(AVENUE_X - 4, ROAD_Y, -900), to: new THREE.Vector3(AVENUE_X - 4, ROAD_Y, -34), cars: 22, speed: 15, facing: 'head' },
  { from: new THREE.Vector3(AVENUE_X + 4, ROAD_Y, -34), to: new THREE.Vector3(AVENUE_X + 4, ROAD_Y, -900), cars: 22, speed: 14, facing: 'tail' },
  // road running along the metro line
  { from: new THREE.Vector3(-420, ROAD_Y, CROSS_Z - 3), to: new THREE.Vector3(420, ROAD_Y, CROSS_Z - 3), cars: 20, speed: 13, facing: 'cross' },
  { from: new THREE.Vector3(420, ROAD_Y, CROSS_Z + 3), to: new THREE.Vector3(-420, ROAD_Y, CROSS_Z + 3), cars: 20, speed: 12, facing: 'cross' },
  // service road in front of the viaduct
  { from: new THREE.Vector3(-300, ROAD_Y, VIADUCT.z + 22), to: new THREE.Vector3(300, ROAD_Y, VIADUCT.z + 22), cars: 12, speed: 10, facing: 'cross' },
  { from: new THREE.Vector3(300, ROAD_Y, VIADUCT.z + 28), to: new THREE.Vector3(-300, ROAD_Y, VIADUCT.z + 28), cars: 12, speed: 9, facing: 'cross' },
]

/** Moving road traffic, drawn as soft points of head and tail light. */
export const Traffic = () => {
  const compact = useStore((s) => s.compact)
  const points = useRef<THREE.Points>(null)

  const data = useMemo(() => {
    const rand = seeded(909)
    const cars: { lane: Lane; offset: number; jitter: number }[] = []
    LANES.forEach((lane) => {
      const n = compact ? Math.ceil(lane.cars / 2) : lane.cars
      for (let i = 0; i < n; i++) cars.push({ lane, offset: (i + rand() * 0.7) / n, jitter: 0.85 + rand() * 0.3 })
    })
    // two lights per car
    const positions = new Float32Array(cars.length * 2 * 3)
    const colors = new Float32Array(cars.length * 2 * 3)
    const head = new THREE.Color('#fff1cf')
    const tail = new THREE.Color('#ff2a1a')
    cars.forEach((car, i) => {
      const a = car.lane.facing === 'tail' ? tail : head
      const b = car.lane.facing === 'head' ? head : tail
      a.toArray(colors, i * 6)
      b.toArray(colors, i * 6 + 3)
    })
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    const material = new THREE.PointsMaterial({
      size: 2.6,
      map: glowSprite(),
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      toneMapped: false,
      fog: false,
    })
    return { cars, geometry, material, dir: new THREE.Vector3(), p: new THREE.Vector3() }
  }, [compact])

  useLayoutEffect(
    () => () => {
      data.geometry.dispose()
      data.material.dispose()
    },
    [data],
  )

  useFrame(({ clock }) => {
    const still = useStore.getState().reducedMotion
    const t = still ? 20 : clock.elapsedTime
    const attr = data.geometry.attributes.position as THREE.BufferAttribute
    data.cars.forEach((car, i) => {
      const { lane } = car
      const length = lane.from.distanceTo(lane.to)
      const u = (car.offset + (t * lane.speed * car.jitter) / length) % 1
      data.p.lerpVectors(lane.from, lane.to, u)
      data.dir.subVectors(lane.to, lane.from).normalize()
      // front and rear of the car, 4.2 m apart
      attr.setXYZ(i * 2, data.p.x + data.dir.x * 2.1, data.p.y, data.p.z + data.dir.z * 2.1)
      attr.setXYZ(i * 2 + 1, data.p.x - data.dir.x * 2.1, data.p.y, data.p.z - data.dir.z * 2.1)
    })
    attr.needsUpdate = true
  })

  return <points ref={points} geometry={data.geometry} material={data.material} frustumCulled={false} raycast={noRaycast} />
}

/** Roads, streetlights and the carpet of distant city lights. */
export const Streets = () => {
  const compact = useStore((s) => s.compact)
  const data = useMemo(() => {
    const rand = seeded(515)
    const positions: number[] = []
    const colors: number[] = []
    const warm = new THREE.Color('#ffc477')
    const white = new THREE.Color('#dfe9ff')
    const push = (x: number, y: number, z: number, c: THREE.Color, k = 1) => {
      positions.push(x, y, z)
      colors.push(c.r * k, c.g * k, c.b * k)
    }
    // streetlights along the avenue and the roads beside the metro
    for (let z = -40; z > -900; z -= 26) {
      push(AVENUE_X - 9, GROUND_Y + 9, z, warm)
      push(AVENUE_X + 9, GROUND_Y + 9, z, warm)
    }
    for (let x = -420; x <= 420; x += 30) {
      push(x, GROUND_Y + 9, CROSS_Z - 9, warm)
      push(x + 15, GROUND_Y + 9, VIADUCT.z + 33, warm)
    }
    // distant sprawl: thousands of windows and lamps merging toward the horizon
    const far = compact ? 700 : 1800
    for (let i = 0; i < far; i++) {
      const z = -230 - Math.pow(rand(), 1.4) * 1500
      const x = (rand() - 0.5) * (900 + Math.abs(z) * 1.6)
      const k = 0.35 + rand() * 0.65
      push(x, GROUND_Y + 2 + rand() * 26, z, rand() > 0.72 ? white : warm, k)
    }
    // red obstruction lights on the tallest roofs
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    const material = new THREE.PointsMaterial({
      size: 3.4,
      map: glowSprite(),
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      toneMapped: false,
      fog: false,
    })
    const road = new THREE.MeshBasicMaterial({ color: '#1b1f2b' })
    const lit = new THREE.MeshBasicMaterial({ color: '#4a3a24', transparent: true, opacity: 0.55, depthWrite: false })
    return { geometry, material, road, lit }
  }, [compact])

  useLayoutEffect(
    () => () => {
      data.geometry.dispose()
      data.material.dispose()
      data.road.dispose()
      data.lit.dispose()
    },
    [data],
  )

  const strip = (x: number, z: number, w: number, d: number, key: string) => (
    <group key={key}>
      <mesh rotation-x={-Math.PI / 2} position={[x, GROUND_Y + 0.05, z]} material={data.road} raycast={noRaycast}>
        <planeGeometry args={[w, d]} />
      </mesh>
      {/* warm pool of streetlight on the asphalt */}
      <mesh rotation-x={-Math.PI / 2} position={[x, GROUND_Y + 0.08, z]} material={data.lit} raycast={noRaycast}>
        <planeGeometry args={[w * 0.999, d * 0.7]} />
      </mesh>
    </group>
  )

  return (
    <group>
      {strip(AVENUE_X, -470, 16, 880, 'avenue')}
      {strip(0, CROSS_Z, 900, 14, 'cross')}
      {strip(0, VIADUCT.z + 25, 700, 12, 'service')}
      <points geometry={data.geometry} material={data.material} frustumCulled={false} raycast={noRaycast} />
    </group>
  )
}
