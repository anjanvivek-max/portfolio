import * as THREE from 'three'
import { floorPlanks, rug, speakerGrille, wallpaper, woodGrain } from './textures/surfaces'

const std = (params: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(params)

const build = () => {
  const grain = woodGrain([1, 1], 11)
  const grainLong = woodGrain([3, 1], 17)
  const grainFine = woodGrain([1, 2], 29)

  return {
    // woods
    walnut: std({ color: '#7a4f2e', map: grainLong, roughness: 0.55, metalness: 0.02 }),
    walnutPlain: std({ color: '#6f4627', map: grain, roughness: 0.6 }),
    darkWood: std({ color: '#43291a', map: grain, roughness: 0.62 }),
    tvWood: std({ color: '#6a4126', map: grainFine, roughness: 0.48 }),
    lightWood: std({ color: '#b08355', map: grain, roughness: 0.6 }),
    floor: std({ map: floorPlanks(), roughness: 0.5, metalness: 0.03 }),

    // room shell
    wall: std({ map: wallpaper(), roughness: 0.94 }),
    wallPlain: std({ color: '#dccba6', roughness: 0.95 }),
    ceiling: std({ color: '#d8ccb2', roughness: 1 }),
    rug: std({ map: rug(), roughness: 1 }),

    // plastics and metals
    black: std({ color: '#171615', roughness: 0.52, metalness: 0.08 }),
    blackGloss: std({ color: '#0c0c0c', roughness: 0.22, metalness: 0.2 }),
    charcoal: std({ color: '#2b2927', roughness: 0.6 }),
    beige: std({ color: '#cfc2a2', roughness: 0.62 }),
    beigeDark: std({ color: '#b3a686', roughness: 0.66 }),
    keycap: std({ color: '#ddd3b8', roughness: 0.7 }),
    cream: std({ color: '#ece1c6', roughness: 0.7 }),
    brass: std({ color: '#b08d4a', roughness: 0.32, metalness: 0.85 }),
    steel: std({ color: '#9a9c9f', roughness: 0.34, metalness: 0.9 }),
    chrome: std({ color: '#d9d9d6', roughness: 0.16, metalness: 1 }),
    olivePaint: std({ color: '#5d6336', roughness: 0.42, metalness: 0.25 }),
    rustPaint: std({ color: '#a8461f', roughness: 0.45, metalness: 0.2 }),

    // soft goods
    fabricOlive: std({ color: '#5f6539', roughness: 1 }),
    fabricRust: std({ color: '#9b4a26', roughness: 1 }),
    leather: std({ color: '#5a2f1c', roughness: 0.55 }),
    paper: std({ color: '#f3ead4', roughness: 0.95 }),
    grille: std({ map: speakerGrille(), roughness: 1 }),

    // plants
    leaf: std({ color: '#4f7a3a', roughness: 0.7, side: THREE.DoubleSide }),
    leafDark: std({ color: '#35592c', roughness: 0.7, side: THREE.DoubleSide }),
    terracotta: std({ color: '#a9552f', roughness: 0.9 }),
    soil: std({ color: '#2a1d14', roughness: 1 }),
  }
}

export type Materials = ReturnType<typeof build>

let cache: Materials | null = null

/** Shared materials, created once on first use. */
export const materials = (): Materials => {
  if (!cache) cache = build()
  return cache
}

export const disposeMaterials = () => {
  if (!cache) return
  Object.values(cache).forEach((m) => m.dispose())
  cache = null
}
