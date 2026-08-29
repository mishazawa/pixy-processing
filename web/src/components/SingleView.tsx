import { useEffect, useRef } from 'react';
import { usePixiStore } from '../state/store';
import { Scene } from './Scene';
import { Artwork } from '../render/Artwork';
import { NodeGraph } from './NodeGraph';
import { TimeControls, GenControls, MainControls } from './ControlPanels';

// Ports Artwork.addOffset/addScale/mouseMove and Pixi.java's arrow/a/z key
// handling. addScale's amount-based offset.div(amount) and the 0.05..50
// clamp are preserved (that clamp already exists to bound periodic genes
// from aliasing at extreme zoom — see app/CLAUDE.md's rendering notes).
export function SingleView({ width, height }: { width: number; height: number }) {
  const { members, focusedId, setView, aa } = usePixiStore();
  const dna = members[focusedId]?.dna;
  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  const side = Math.min(width, height * 0.6);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!dna) return;
      const step = 0.05;
      if (e.key === 'ArrowUp') dna.offset.y += step;
      if (e.key === 'ArrowDown') dna.offset.y -= step;
      if (e.key === 'ArrowLeft') dna.offset.x -= step;
      if (e.key === 'ArrowRight') dna.offset.x += step;
      if (e.key === 'z') {
        dna.scale = Math.max(0.05, Math.min(50, dna.scale * 1.05));
        dna.offset.x /= 1.05;
        dna.offset.y /= 1.05;
      }
      if (e.key === 'a') {
        dna.scale = Math.max(0.05, Math.min(50, dna.scale * 0.95));
        dna.offset.x /= 0.95;
        dna.offset.y /= 0.95;
      }
      if (e.key === 'Escape' || e.key === 'Backspace') setView('GRID');
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dna, setView]);

  if (!dna) return null;

  return (
    <div style={{ display: 'flex', width, height }}>
      <div
        style={{ width: side, height: side }}
        onPointerDown={(e) => {
          dragging.current = true;
          lastPointer.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerLeave={() => {
          dragging.current = false;
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          const gScale = (1 / side) * 4;
          const dx = (e.clientX - lastPointer.current.x) * gScale;
          const dy = (e.clientY - lastPointer.current.y) * gScale;
          dna.offset.x -= dx;
          dna.offset.y += dy;
          lastPointer.current = { x: e.clientX, y: e.clientY };
        }}
      >
        <Scene width={side} height={side}>
          <Artwork
            dna={dna}
            rect={{ x: 0, y: 0, w: side, h: side }}
            canvasHeightPx={side}
            aa={aa}
          />
        </Scene>
      </div>
      <div style={{ flex: 1, padding: 20 }}>
        <NodeGraph dna={dna} width={Math.max(width - side - 40, 100)} height={200} />
        <MainControls />
        <GenControls />
        <TimeControls />
      </div>
    </div>
  );
}
