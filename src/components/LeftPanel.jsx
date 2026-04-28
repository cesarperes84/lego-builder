import { PIECE_DEFS, useBuilderStore } from "../store/useBuilderStore"

function PieceCard({ pieceKey, piece, selected, onClick }) {
  return (
    <div className={`option-card ${selected ? "selected" : ""}`} onClick={onClick}>
      <div className="option-card-title"><span>{piece.label}</span><span className="option-card-sub">{piece.w}x{piece.d}</span></div>
      <div className="piece-preview">
        <div className="dot-grid" style={{ gridTemplateColumns: `repeat(${piece.w}, 10px)` }}>
          {Array.from({ length: piece.w * piece.d }).map((_, index) => <span key={`${pieceKey}-${index}`} className="dot" />)}
        </div>
      </div>
    </div>
  )
}

export default function LeftPanel() {
  const selectedPiece = useBuilderStore((s) => s.selectedPiece)
  const setSelectedPiece = useBuilderStore((s) => s.setSelectedPiece)
  return (
    <aside className="sidebar">
      <div className="section"><h3>Pieces</h3><p>Select the brick format you want to place on the build area.</p></div>
      <div className="card-grid">
        {Object.entries(PIECE_DEFS).map(([key, piece]) => (
          <PieceCard key={key} pieceKey={key} piece={piece} selected={selectedPiece === key} onClick={() => setSelectedPiece(key)}/>
        ))}
      </div>
      <div className="footer-note">Hover a brick face to preview the next snap. Click a brick once to select it and click the hovered face again to place. Use <span className="kbd">R</span> to rotate.</div>
    </aside>
  )
}
