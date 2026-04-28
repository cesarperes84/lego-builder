import { Canvas } from "@react-three/fiber"
import Header from "./Header"
import LeftPanel from "./LeftPanel"
import RightPanel from "./RightPanel"
import Scene from "./Scene"

export default function Editor() {
  return (
    <div className="app-shell">
      <Header />
      <div className="workspace">
        <LeftPanel />
        <main className="canvas-area">
          <Canvas shadows camera={{ position: [8.5, 8.5, 8.5], fov: 44 }}>
            <Scene />
          </Canvas>
          <div className="canvas-overlay">
            <div className="overlay-pill">Hover face to preview</div>
            <div className="overlay-pill">Click brick to select</div>
            <div className="overlay-pill">Click selected face to place</div>
            <div className="overlay-pill">R to rotate</div>
          </div>
        </main>
        <RightPanel />
      </div>
    </div>
  )
}
