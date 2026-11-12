import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'
import { BACK_Z, ROOM, WIN } from '../layout'

const PROBE = new THREE.Vector3(0.3, 1.5, -0.9)

/**
 * Window glass with a faint reflection of the room.
 *
 * A real-time mirror would double the render cost, so the room is captured once into a
 * small cube map (and again whenever the television changes state). The glass samples it
 * with a box-projected reflection vector, which keeps the lamp and the screen glow where
 * a visitor expects to see them as the camera moves.
 */
export const WindowGlass = () => {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const mesh = useRef<THREE.Mesh>(null)
  const phase = useStore((s) => s.phase)
  const pending = useRef(8)

  const probe = useMemo(() => {
    const target = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter })
    const camera = new THREE.CubeCamera(0.05, 20, target)
    camera.position.copy(PROBE)
    return { target, camera }
  }, [])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uEnv: { value: probe.target.texture },
          uProbe: { value: PROBE.clone() },
          uBoxMin: { value: new THREE.Vector3(-ROOM.halfW, 0, -ROOM.halfD) },
          uBoxMax: { value: new THREE.Vector3(ROOM.halfW, ROOM.h, ROOM.halfD) },
          uReady: { value: 0 },
        },
        vertexShader: /* glsl */ `
          varying vec3 vWorld;
          void main() {
            vec4 world = modelMatrix * vec4(position, 1.0);
            vWorld = world.xyz;
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform samplerCube uEnv;
          uniform vec3 uProbe;
          uniform vec3 uBoxMin;
          uniform vec3 uBoxMax;
          uniform float uReady;
          varying vec3 vWorld;
          void main() {
            vec3 n = vec3(0.0, 0.0, 1.0);
            vec3 v = normalize(vWorld - cameraPosition);
            vec3 r = reflect(v, n);
            // box projection: find where the reflected ray meets the room walls
            vec3 a = (uBoxMax - vWorld) / r;
            vec3 b = (uBoxMin - vWorld) / r;
            vec3 far = max(a, b);
            float dist = min(min(far.x, far.y), far.z);
            vec3 hit = vWorld + r * dist;
            vec3 env = textureCube(uEnv, hit - uProbe).rgb;
            float fresnel = pow(1.0 - max(dot(-v, n), 0.0), 3.0);
            float strength = mix(0.11, 0.6, fresnel) * uReady;
            // keep only the brighter parts so dark walls do not fog the view outside
            float luma = dot(env, vec3(0.299, 0.587, 0.114));
            env *= smoothstep(0.02, 0.5, luma);
            gl_FragColor = vec4(env * strength, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `,
      }),
    [probe],
  )

  useLayoutEffect(
    () => () => {
      material.dispose()
      probe.target.dispose()
    },
    [material, probe],
  )

  // Refresh the capture shortly after the television turns on or off.
  useLayoutEffect(() => {
    if (phase === 'sectionOpen' || phase === 'room') pending.current = 20
  }, [phase])

  useFrame(() => {
    if (pending.current <= 0) return
    pending.current -= 1
    if (pending.current > 0) return
    const glass = mesh.current
    const city = scene.getObjectByName('city')
    if (!glass) return
    // Capture the room only: hide the glass itself and everything outside.
    glass.visible = false
    if (city) city.visible = false
    probe.camera.update(gl, scene)
    glass.visible = true
    if (city) city.visible = true
    material.uniforms.uReady.value = 1
  })

  const w = WIN.x1 - WIN.x0
  const h = WIN.y1 - WIN.y0
  return (
    <mesh ref={mesh} position={[(WIN.x0 + WIN.x1) / 2, (WIN.y0 + WIN.y1) / 2, BACK_Z - 0.04]} material={material} raycast={() => null} renderOrder={5}>
      <planeGeometry args={[w, h]} />
    </mesh>
  )
}
