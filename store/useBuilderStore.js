"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export const BRICK_BASE_HEIGHT = 0.72
export const STUD_HEIGHT = 0.18
// Intencional: altura de camada = altura da base. Os studs entram na peça de cima, eliminando o vão visual.
export const BRICK_LAYER_HEIGHT = BRICK_BASE_HEIGHT

export const PIECE_DEFS = {
  "1x1": { label: "Brick 1x1", w: 1, d: 1 },
  "1x2": { label: "Brick 1x2", w: 2, d: 1 },
  "1x3": { label: "Brick 1x3", w: 3, d: 1 },
  "1x4": { label: "Brick 1x4", w: 4, d: 1 },
  "2x2": { label: "Brick 2x2", w: 2, d: 2 },
  "2x3": { label: "Brick 2x3", w: 3, d: 2 },
  "2x4": { label: "Brick 2x4", w: 4, d: 2 },
  "2x6": { label: "Brick 2x6", w: 6, d: 2 },
  "2x8": { label: "Brick 2x8", w: 8, d: 2 },
  "4x4": { label: "Brick 4x4", w: 4, d: 4 },
}

export const COLOR_OPTIONS = [
  { key: "red", label: "Red", hex: "#ef4444" },
  { key: "blue", label: "Blue", hex: "#3b82f6" },
  { key: "green", label: "Green", hex: "#22c55e" },
  { key: "yellow", label: "Yellow", hex: "#facc15" },
  { key: "orange", label: "Orange", hex: "#fb923c" },
  { key: "white", label: "White", hex: "#f8fafc" },
  { key: "purple", label: "Purple", hex: "#a855f7" },
  { key: "black", label: "Black", hex: "#111827" },
]

export function normalizeRotation(rotation = 0) {
  return ((rotation % 180) + 180) % 180
}

export function getOrientedSize(type, rotation = 0) {
  const def = PIECE_DEFS[type]
  if (!def) return { w: 1, d: 1 }
  const normalized = normalizeRotation(rotation)
  return normalized === 90 ? { w: def.d, d: def.w } : { w: def.w, d: def.d }
}

export function getFootprintCells(blockLike) {
  const { w, d } = getOrientedSize(blockLike.type, blockLike.rotation || 0)
  const cells = []
  for (let ix = 0; ix < w; ix++) {
    for (let iz = 0; iz < d; iz++) {
      cells.push([blockLike.x + ix, blockLike.z + iz])
    }
  }
  return cells
}

export function blocksOverlapAtSameY(candidate, blocks, excludeId = null) {
  const candidateCells = getFootprintCells(candidate)
  return blocks.some((block) => {
    if (excludeId && block.id === excludeId) return false
    if (block.y !== candidate.y) return false
    const blockCells = getFootprintCells(block)
    return candidateCells.some(([cx, cz]) =>
      blockCells.some(([bx, bz]) => bx === cx && bz === cz)
    )
  })
}

export function canPlaceBlock(candidate, blocks, excludeId = null) {
  return !blocksOverlapAtSameY(candidate, blocks, excludeId)
}

export function findTopY(baseCandidate, blocks, startY = 0) {
  let y = startY
  while (y < 100) {
    const candidate = { ...baseCandidate, y }
    if (canPlaceBlock(candidate, blocks)) return y
    y += 1
  }
  return startY
}

export const useBuilderStore = create(
  persist(
    (set, get) => ({
      blocks: [],
      selectedPiece: "2x4",
      selectedColor: "red",
      selectedId: null,
      pendingRotation: 0,

      setSelectedPiece: (piece) => set({ selectedPiece: piece }),
      setSelectedColor: (color) => set({ selectedColor: color }),
      selectBlock: (id) => set({ selectedId: id }),
      clearSelection: () => set({ selectedId: null }),

      placeBlock: (candidate) => {
        const { blocks, selectedColor, selectedPiece, pendingRotation } = get()
        const block = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          type: candidate.type || selectedPiece,
          color: candidate.color || selectedColor,
          rotation: candidate.rotation ?? pendingRotation,
          x: candidate.x,
          y: candidate.y,
          z: candidate.z,
        }
        if (!canPlaceBlock(block, blocks)) return false
        set({ blocks: [...blocks, block], selectedId: block.id })
        return true
      },

      placeBlockAtGrid: (x, z) => {
        const { blocks, selectedPiece, selectedColor, pendingRotation } = get()
        const y = findTopY({ x, z, type: selectedPiece, rotation: pendingRotation }, blocks, 0)
        const block = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          x,
          y,
          z,
          type: selectedPiece,
          color: selectedColor,
          rotation: pendingRotation,
        }
        if (!canPlaceBlock(block, blocks)) return false
        set({ blocks: [...blocks, block], selectedId: block.id })
        return true
      },

      rotateSelectedOrPending: () => {
        const { selectedId, blocks, pendingRotation } = get()
        if (!selectedId) {
          set({ pendingRotation: (pendingRotation + 90) % 180 })
          return
        }
        const target = blocks.find((b) => b.id === selectedId)
        if (!target) return
        const nextRotation = (target.rotation + 90) % 180
        const candidate = { ...target, rotation: nextRotation }
        if (!canPlaceBlock(candidate, blocks, target.id)) return
        set({ blocks: blocks.map((b) => (b.id === selectedId ? { ...b, rotation: nextRotation } : b)) })
      },

      removeSelected: () => {
        const { selectedId, blocks } = get()
        if (!selectedId) return
        set({ blocks: blocks.filter((b) => b.id !== selectedId), selectedId: null })
      },

      clearProject: () => set({ blocks: [], selectedId: null }),

      saveProject: () => {
        const state = get()
        if (typeof window !== "undefined") {
          window.localStorage.setItem("lego-builder-product-final-v5-manual", JSON.stringify({ state }))
        }
      },
    }),
    {
      name: "lego-builder-product-final-v5",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        blocks: state.blocks,
        selectedPiece: state.selectedPiece,
        selectedColor: state.selectedColor,
        pendingRotation: state.pendingRotation,
      }),
    }
  )
)
