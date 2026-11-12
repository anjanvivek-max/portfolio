import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'
import { GROUND_Y, VIADUCT } from '../layout'
import { seeded } from '../textures/canvas'

export const FOG_COLOR = '#18244a'
export const FOG_DENSITY = 0.0011

const vertexShader = /* glsl */ `
  attribute float aSeed;
  attribute vec3 aTint;
  uniform vec3 uScale;
  varying vec2 vFacade;
  varying float vHeight;
  varying float vSide;
  varying float vSeed;
  varying vec3 vTint;
  varying vec3 vWorld;

  void main() {
    #ifdef USE_INSTANCING
      mat4 im = instanceMatrix;
      vec3 scl = vec3(length(im[0].xyz), length(im[1].xyz), length(im[2].xyz));
    #else
      mat4 im = mat4(1.0);
      vec3 scl = uScale;
    #endif
    float faceW = abs(normal.x) > 0.5 ? scl.z : scl.x;
    #ifdef ROUND
      faceW = uScale.x;
    #endif
    vFacade = vec2(uv.x * faceW, uv.y * scl.y);
    vHeight = scl.y;
    vSide = abs(normal.y) < 0.5 ? 1.0 : 0.0;
    vSeed = aSeed;
    vTint = aTint;
    vec4 world = modelMatrix * im * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  varying vec2 vFacade;
  varying float vHeight;
  varying float vSide;
  varying float vSeed;
  varying vec3 vTint;
  varying vec3 vWorld;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    // The seed is constant per building, but an interpolated varying carries tiny rounding
    // differences from pixel to pixel, and the hash below amplifies them into speckle.
    // Snapping it to the grid it was generated on makes it exact again.
    float seed = floor(vSeed * 8.0 + 0.5) * 0.125;
    vec3 col = vTint * 0.35;
    if (vSide > 0.5) {
      float floorH = 4.1;
      float bay = 5.2;
      vec2 g = vec2(vFacade.x / bay, vFacade.y / floorH);
      vec2 cell = floor(g);
      vec2 f = fract(g);

      // Each office re-rolls its light occasionally, at its own moment: the city breathes.
      float r = hash(cell + seed * 1.37);
      float phase = floor(uTime * 0.012 + r * 40.0);
      float roll = hash(cell + seed * 1.37 + phase * 1.618);
      float floorBias = hash(vec2(cell.y, seed * 2.31));
      float chance = mix(0.1, 0.62, floorBias * floorBias) * mix(0.55, 1.0, hash(vec2(seed, 3.0)));
      // Low blocks near the building stay dim so they do not compete with the skyline.
      float tall = smoothstep(10.0, 34.0, vHeight);
      chance *= mix(0.3, 1.0, tall);
      float lit = step(roll, chance);

      // smoothstep is only defined for edge0 < edge1, so falling edges are written as 1 - rise.
      float mask = smoothstep(0.04, 0.09, f.x) * (1.0 - smoothstep(0.91, 0.96, f.x))
                 * smoothstep(0.22, 0.3, f.y) * (1.0 - smoothstep(0.76, 0.84, f.y));

      float warm = step(0.38, hash(cell * 1.7 + seed));
      vec3 lightCol = mix(vec3(0.62, 0.8, 1.0), vec3(1.0, 0.74, 0.42), warm);
      float bright = 0.28 + 0.5 * hash(cell * 3.1 + seed * 0.77);

      // Dark glass with a faint sky reflection that brightens toward the top.
      float up = vFacade.y / max(vHeight, 1.0);
      vec3 glass = (vTint * (0.24 + 0.44 * up) + vec3(0.02, 0.035, 0.07) * up) * mix(0.3, 1.0, tall);
      // floor slabs and column lines give the curtain wall its structure
      glass *= 0.82 + 0.18 * smoothstep(0.02, 0.1, f.y);
      vec3 detailed = mix(glass, lightCol * bright, lit * mask);
      // Far away, individual windows merge into an even glow instead of shimmering.
      float px = fwidth(g.y);
      float detail = 1.0 - smoothstep(0.2, 0.55, px);
      vec3 merged = mix(glass, lightCol * 0.55, chance * 0.4);
      col = mix(merged, detailed, detail);

      // Roof-line light on some towers.
      float crown = tall * step(0.55, hash(vec2(seed, 9.0))) * smoothstep(vHeight - 1.6, vHeight - 0.9, vFacade.y);
      col += crown * mix(vec3(0.6, 0.85, 1.0), vec3(1.0, 0.75, 0.45), hash(vec2(seed, 4.0))) * 0.9;
      // Podium glow near the street.
      col += vec3(1.0, 0.72, 0.4) * 0.045 * tall * (1.0 - smoothstep(0.0, 9.0, vFacade.y));
    }

    float d = distance(vWorld, cameraPosition);
    float fogF = 1.0 - exp(-pow(d * uFogDensity, 2.0));
    col = mix(col, uFogColor, clamp(fogF, 0.0, 1.0));
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

const makeTowerMaterial = (round: boolean, scale?: THREE.Vector3) =>
  new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    defines: round ? { ROUND: '' } : {},
    uniforms: {
      uTime: { value: 0 },
      uFogColor: { value: new THREE.Color(FOG_COLOR) },
      uFogDensity: { value: FOG_DENSITY },
      uScale: { value: scale ?? new THREE.Vector3(1, 1, 1) },
    },
  })

interface Tower {
  x: number
  z: number
  w: number
  d: number
  h: number
  rot: number
  seed: number
  tint: [number, number, number]
}

const TINTS: [number, number, number][] = [
  [0.1, 0.17, 0.3],
  [0.08, 0.2, 0.28],
  [0.13, 0.16, 0.26],
  [0.09, 0.14, 0.24],
  [0.12, 0.2, 0.25],
]

/** Lays out the district: low-rise near the building, glass towers beyond the metro line. */
const layoutTowers = (count: number): Tower[] => {
  const rand = seeded(2026)
  const towers: Tower[] = []
  const add = (x: number, z: number, w: number, d: number, h: number) => {
    // Keep the avenue that runs away from the window clear.
    if (x + w / 2 > 12 && x - w / 2 < 44) return
    towers.push({ x, z, w, d, h, rot: (rand() - 0.5) * 0.16, seed: Math.round(rand() * 800) / 8, tint: TINTS[Math.floor(rand() * TINTS.length)] })
  }
  // Low-rise blocks between the building and the viaduct.
  for (let x = -230; x <= 230; x += 30 + rand() * 16) {
    add(x, -46 - rand() * 22, 20 + rand() * 12, 16 + rand() * 10, 5 + rand() * 6)
  }
  const rows: { z: number; depth: number; minH: number; maxH: number; span: number; step: number }[] = [
    { z: VIADUCT.z - 85, depth: 30, minH: 26, maxH: 52, span: 330, step: 52 },
    { z: VIADUCT.z - 160, depth: 50, minH: 40, maxH: 92, span: 440, step: 56 },
    { z: VIADUCT.z - 270, depth: 80, minH: 55, maxH: 150, span: 600, step: 62 },
    { z: VIADUCT.z - 430, depth: 120, minH: 50, maxH: 170, span: 860, step: 70 },
    { z: VIADUCT.z - 640, depth: 200, minH: 40, maxH: 150, span: 1200, step: 84 },
  ]
  rows.forEach((row) => {
    for (let x = -row.span; x <= row.span; x += row.step * (0.75 + rand() * 0.6)) {
      const h = row.minH + Math.pow(rand(), 1.6) * (row.maxH - row.minH)
      add(x, row.z - rand() * row.depth, 22 + rand() * 20, 20 + rand() * 18, h)
    }
  })
  return towers.slice(0, count)
}

/** Glass towers of the IT district, drawn as one instanced mesh with procedural windows. */
export const Skyline = () => {
  const compact = useStore((s) => s.compact)
  const mesh = useRef<THREE.InstancedMesh>(null)
  const towers = useMemo(() => layoutTowers(compact ? 90 : 190), [compact])

  const material = useMemo(() => makeTowerMaterial(false), [])
  // A broad cylindrical landmark form, inspired by the district's early IT buildings.
  const round = useMemo(() => {
    const radius = 27
    const height = 44
    return {
      radius,
      height,
      material: makeTowerMaterial(true, new THREE.Vector3(Math.PI * 2 * radius, height, 1)),
    }
  }, [])

  const geometry = useMemo(() => {
    const g = new THREE.BoxGeometry(1, 1, 1)
    g.translate(0, 0.5, 0)
    g.setAttribute('aSeed', new THREE.InstancedBufferAttribute(new Float32Array(towers.map((t) => t.seed)), 1))
    g.setAttribute('aTint', new THREE.InstancedBufferAttribute(new Float32Array(towers.flatMap((t) => t.tint)), 3))
    return g
  }, [towers])

  const roundGeometry = useMemo(() => {
    const g = new THREE.CylinderGeometry(round.radius, round.radius, round.height, 48, 1)
    g.translate(0, round.height / 2, 0)
    const n = g.attributes.position.count
    g.setAttribute('aSeed', new THREE.BufferAttribute(new Float32Array(n).fill(42.5), 1))
    const tint = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) tint.set([0.1, 0.19, 0.29], i * 3)
    g.setAttribute('aTint', new THREE.BufferAttribute(tint, 3))
    return g
  }, [round])

  useLayoutEffect(() => {
    const im = mesh.current
    if (!im) return
    const dummy = new THREE.Object3D()
    towers.forEach((t, i) => {
      dummy.position.set(t.x, GROUND_Y, t.z)
      dummy.rotation.set(0, t.rot, 0)
      dummy.scale.set(t.w, t.h, t.d)
      dummy.updateMatrix()
      im.setMatrixAt(i, dummy.matrix)
    })
    im.instanceMatrix.needsUpdate = true
  }, [towers])

  useLayoutEffect(
    () => () => {
      geometry.dispose()
    },
    [geometry],
  )
  useLayoutEffect(
    () => () => {
      material.dispose()
      round.material.dispose()
      roundGeometry.dispose()
    },
    [material, round, roundGeometry],
  )

  useFrame(({ clock }) => {
    const t = useStore.getState().reducedMotion ? 0 : clock.elapsedTime
    material.uniforms.uTime.value = t
    round.material.uniforms.uTime.value = t
  })

  return (
    <group>
      <instancedMesh
        ref={mesh}
        args={[geometry, material, towers.length]}
        frustumCulled={false}
        raycast={() => null}
      />
      <mesh
        geometry={roundGeometry}
        material={round.material}
        position={[-66, GROUND_Y, VIADUCT.z - 62]}
        raycast={() => null}
      />
    </group>
  )
}
