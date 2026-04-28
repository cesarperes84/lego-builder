"use client"
import { useBuilderStore } from "../store/useBuilderStore"

function HeaderButton({ className, icon, label, onClick }) {
  return <button className={`action-btn ${className}`} onClick={onClick}><span>{icon}</span><span>{label}</span></button>
}

export default function Header() {
  const rotateSelectedOrPending = useBuilderStore((s) => s.rotateSelectedOrPending)
  const removeSelected = useBuilderStore((s) => s.removeSelected)
  const saveProject = useBuilderStore((s) => s.saveProject)
  const clearProject = useBuilderStore((s) => s.clearProject)

  return (
    <header className="header">
      <div className="brand">
        <div className="brand-logo" aria-hidden="true"><span/><span/><span/><span/></div>
        <div className="brand-title"><strong>LEGO BUILDER</strong><small>Visual Builder Prototype</small></div>
      </div>
      <div className="header-actions">
        <HeaderButton className="neutral" icon="↻" label="Rotate" onClick={rotateSelectedOrPending}/>
        <HeaderButton className="neutral" icon="🧹" label="Clear" onClick={clearProject}/>
        <HeaderButton className="success" icon="💾" label="Save" onClick={saveProject}/>
        <HeaderButton className="danger" icon="🗑" label="Remove" onClick={removeSelected}/>
      </div>
    </header>
  )
}
