import { usePixiStore } from '../state/store';
import { Scene } from './Scene';
import { Artwork } from '../render/Artwork';

const MARGIN = 20;
const GRID_GAP = 10;

function tileRect(index: number, popRow: number, width: number) {
  const cell = (width - MARGIN * 2 + GRID_GAP) / popRow - GRID_GAP;
  const col = index % popRow;
  const row = Math.floor(index / popRow);
  return {
    x: MARGIN + col * (cell + GRID_GAP),
    y: MARGIN + row * (cell + GRID_GAP),
    w: cell,
    h: cell,
  };
}

export function GridView({ width, height }: { width: number; height: number }) {
  const { members, popRow, focusedId, isFocused, toggleSelect, focus, blurFocus, setView, aa } = usePixiStore();

  return (
    <div style={{ position: 'relative', width, height }}>
      <Scene width={width} height={height}>
        {members.map((m, i) => (
          <Artwork
            key={i}
            dna={m.dna}
            rect={tileRect(i, popRow, width)}
            canvasHeightPx={height}
            aa={aa}
          />
        ))}
      </Scene>
      <div style={{ position: 'absolute', inset: 0 }}>
        {members.map((m, i) => {
          const rect = tileRect(i, popRow, width);
          const focusedHere = isFocused && i === focusedId;
          const borderColor = m.isSelected ? (focusedHere ? '#bb4dff' : '#9b00ff') : focusedHere ? '#969696' : '#4d4d4d';
          return (
            <div
              key={i}
              onMouseEnter={() => focus(i)}
              onMouseLeave={blurFocus}
              onClick={() => setView('SINGLE')}
              style={{
                position: 'absolute',
                left: rect.x,
                top: rect.y,
                width: rect.w,
                height: rect.h,
                border: `${m.isSelected || focusedHere ? 3 : 1}px solid ${borderColor}`,
                cursor: 'pointer',
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelect(i);
                }}
                style={{ position: 'absolute', right: 4, bottom: 4 }}
              >
                {m.isSelected ? '✓' : ' '}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
