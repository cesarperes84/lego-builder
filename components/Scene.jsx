"use client"

import { useEffect, useState } from "react"
import { ContactShadows, OrbitControls } from "@react-three/drei"
import { useBuilderStore, getOrientedSize, canPlaceBlock, BRICK_LAYER_HEIGHT, BRICK_BASE_HEIGHT } from "../store/useBuilderStore"
import LegoPiece from "./LegoPiece"

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)) }

function detectFace(localX, localY, localZ, w, d) {
  if (localY > BRICK_BASE_HEIGHT * 0.82) return "top"
  const options = [
    { face: "left", distance: Math.abs(localX + w / 2) },
    { face: "right", distance: Math.abs(localX - w / 2) },
    { face: "front", distance: Math.abs(localZ + d / 2) },
    { face: "back", distance: Math.abs(localZ - d / 2) },
  ]
  options.sort((a,b)=>a.distance-b.distance)
  return options[0].face
}

function buildFacePreview(target, face, localX, localZ, selectedPiece, pendingRotation, selectedColor, blocks) {
  const targetSize = getOrientedSize(target.type, target.rotation)
  const candidateSize = getOrientedSize(selectedPiece, pendingRotation)
  let x = target.x, y = target.y, z = target.z
  const relX = localX + targetSize.w / 2
  const relZ = localZ + targetSize.d / 2
  const alignXWithin = () => candidateSize.w <= targetSize.w ? target.x + clamp(Math.round(relX - candidateSize.w / 2), 0, targetSize.w - candidateSize.w) : target.x - Math.floor((candidateSize.w - targetSize.w) / 2)
  const alignZWithin = () => candidateSize.d <= targetSize.d ? target.z + clamp(Math.round(relZ - candidateSize.d / 2), 0, targetSize.d - candidateSize.d) : target.z - Math.floor((candidateSize.d - targetSize.d) / 2)

  if (face === "top") {
    // Top snap by hover position, not only by the target brick bounds.
    // This allows placing a brick bridging/centered between two existing bricks.
    x = Math.round(target.x + relX - candidateSize.w / 2)
    z = Math.round(target.z + relZ - candidateSize.d / 2)
    y = target.y + 1
  }
  if (face === "left") { x = target.x - candidateSize.w; z = alignZWithin(); y = target.y }
  if (face === "right") { x = target.x + targetSize.w; z = alignZWithin(); y = target.y }
  if (face === "front") { x = alignXWithin(); z = target.z - candidateSize.d; y = target.y }
  if (face === "back") { x = alignXWithin(); z = target.z + targetSize.d; y = target.y }

  const candidate = { x, y, z, type: selectedPiece, color: selectedColor, rotation: pendingRotation, previewFace: face, sourceTargetId: target.id, source: "face" }
  if (!canPlaceBlock(candidate, blocks)) return null
  return candidate
}

function buildGridPreview(gridX, gridZ, selectedPiece, pendingRotation, selectedColor, blocks) {
  let y = 0
  while (y < 100) {
    const candidate = { x: gridX, y, z: gridZ, type: selectedPiece, color: selectedColor, rotation: pendingRotation, source: "grid" }
    if (canPlaceBlock(candidate, blocks)) return candidate
    y += 1
  }
  return null
}

function PreviewBrick({ preview }) {
  if (!preview) return null
  const size = getOrientedSize(preview.type, preview.rotation)
  const worldX = preview.x + size.w / 2 - 0.5
  const worldZ = preview.z + size.d / 2 - 0.5
  return <group position={[worldX, preview.y * BRICK_LAYER_HEIGHT, worldZ]}><LegoPiece type={preview.type} color={preview.color} rotation={preview.rotation} opacity={0.35}/></group>
}

function Brick({ block, isSelected, preview, setPreview }) {
  const selectedId = useBuilderStore((s) => s.selectedId)
  const selectBlock = useBuilderStore((s) => s.selectBlock)
  const placeBlock = useBuilderStore((s) => s.placeBlock)
  const selectedPiece = useBuilderStore((s) => s.selectedPiece)
  const selectedColor = useBuilderStore((s) => s.selectedColor)
  const pendingRotation = useBuilderStore((s) => s.pendingRotation)
  const blocks = useBuilderStore((s) => s.blocks)
  const size = getOrientedSize(block.type, block.rotation)
  const worldX = block.x + size.w / 2 - 0.5
  const worldZ = block.z + size.d / 2 - 0.5

  return (
    <group position={[worldX, block.y * BRICK_LAYER_HEIGHT, worldZ]}
      onPointerMove={(e) => {
        e.stopPropagation()
        const localX = e.point.x - worldX
        const localY = e.point.y - block.y * BRICK_LAYER_HEIGHT
        const localZ = e.point.z - worldZ
        const face = detectFace(localX, localY, localZ, size.w, size.d)
        setPreview(buildFacePreview(block, face, localX, localZ, selectedPiece, pendingRotation, selectedColor, blocks))
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (selectedId === block.id && preview && preview.source === "face" && preview.sourceTargetId === block.id) { placeBlock(preview); return }
        selectBlock(block.id)
      }}>
      <LegoPiece type={block.type} color={block.color} rotation={block.rotation} selected={isSelected}/>
    </group>
  )
}

export default function Scene() {
  const blocks = useBuilderStore((s) => s.blocks)
  const selectedId = useBuilderStore((s) => s.selectedId)
  const selectedPiece = useBuilderStore((s) => s.selectedPiece)
  const selectedColor = useBuilderStore((s) => s.selectedColor)
  const pendingRotation = useBuilderStore((s) => s.pendingRotation)
  const placeBlockAtGrid = useBuilderStore((s) => s.placeBlockAtGrid)
  const clearSelection = useBuilderStore((s) => s.clearSelection)
  const rotateSelectedOrPending = useBuilderStore((s) => s.rotateSelectedOrPending)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    const onKey = (event) => {
      if (event.key.toLowerCase() === "r") rotateSelectedOrPending()
      if (event.key === "Escape") { clearSelection(); setPreview(null) }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [rotateSelectedOrPending, clearSelection])

  return (
    <>
      <color attach="background" args={["#0f131b"]}/>
      <ambientLight intensity={0.72}/>
      <directionalLight castShadow intensity={1.05} position={[7,10,5]} shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-near={0.5} shadow-camera-far={40}/>
      <hemisphereLight intensity={0.34} groundColor="#0c1018"/>
      <mesh rotation={[-Math.PI/2,0,0]} receiveShadow
        onPointerMove={(e)=>setPreview(buildGridPreview(Math.round(e.point.x), Math.round(e.point.z), selectedPiece, pendingRotation, selectedColor, blocks))}
        onClick={(e)=>{e.stopPropagation(); placeBlockAtGrid(Math.round(e.point.x), Math.round(e.point.z))}}>
        <planeGeometry args={[14,14]}/>
        <meshStandardMaterial color="#141a23" roughness={0.94} metalness={0.02}/>
      </mesh>
      <gridHelper args={[14,14,"#30405d","#243146"]} position={[0,0.01,0]}/>
      {blocks.map((block)=><Brick key={block.id} block={block} isSelected={block.id===selectedId} preview={preview} setPreview={setPreview}/>)}
      <PreviewBrick preview={preview}/>
      <ContactShadows position={[0,-0.01,0]} opacity={0.55} scale={18} blur={2.4} far={18}/>
      <OrbitControls makeDefault enablePan enableZoom minDistance={6} maxDistance={22} maxPolarAngle={Math.PI/2.15} target={[1.5,0.6,1.5]}/>
    </>
  )
}
