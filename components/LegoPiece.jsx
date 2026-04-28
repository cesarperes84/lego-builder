"use client"
import { useMemo } from "react"
import { COLOR_OPTIONS, getOrientedSize, BRICK_BASE_HEIGHT, STUD_HEIGHT } from "../store/useBuilderStore"

function getColorHex(key) {
  return COLOR_OPTIONS.find((c) => c.key === key)?.hex || key
}

export default function LegoPiece({ type, color, rotation = 0, selected = false, opacity = 1 }) {
  const { w, d } = getOrientedSize(type, rotation)
  const colorHex = getColorHex(color)

  const studs = useMemo(() => {
    const result = []
    for (let x = 0; x < w; x++) {
      for (let z = 0; z < d; z++) {
        result.push([x - w / 2 + 0.5, BRICK_BASE_HEIGHT + STUD_HEIGHT / 2, z - d / 2 + 0.5])
      }
    }
    return result
  }, [w, d])

  return (
    <group>
      <mesh castShadow receiveShadow position={[0, BRICK_BASE_HEIGHT / 2, 0]}>
        <boxGeometry args={[w, BRICK_BASE_HEIGHT, d]} />
        <meshStandardMaterial
          color={colorHex}
          roughness={0.28}
          metalness={0.02}
          transparent={opacity < 1}
          opacity={opacity}
          emissive={selected ? "#4f46e5" : "#000000"}
          emissiveIntensity={selected ? 0.26 : 0}
        />
      </mesh>

      {studs.map((stud, index) => (
        <mesh key={index} castShadow position={stud}>
          <cylinderGeometry args={[0.24, 0.24, STUD_HEIGHT, 24]} />
          <meshStandardMaterial
            color={colorHex}
            roughness={0.24}
            metalness={0.02}
            transparent={opacity < 1}
            opacity={opacity}
          />
        </mesh>
      ))}
    </group>
  )
}
