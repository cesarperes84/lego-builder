"use client"
import { COLOR_OPTIONS, useBuilderStore } from "../store/useBuilderStore"

export default function RightPanel() {
  const selectedColor = useBuilderStore((s) => s.selectedColor)
  const setSelectedColor = useBuilderStore((s) => s.setSelectedColor)
  return (
    <aside className="sidebar right">
      <div className="section"><h3>Colors</h3><p>Choose the active color for the next brick you place.</p></div>
      <div className="swatch-grid">
        {COLOR_OPTIONS.map((color) => (
          <div key={color.key} className={`swatch ${selectedColor === color.key ? "selected" : ""}`} onClick={() => setSelectedColor(color.key)}>
            <span className="swatch-chip" style={{ background: color.hex }} /><span className="swatch-label">{color.label}</span>
          </div>
        ))}
      </div>
      <div className="footer-note">Save stores the current state in local storage. Clear removes every brick in the scene. Remove deletes only the selected brick.</div>
    </aside>
  )
}
