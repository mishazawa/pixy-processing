import { useEffect, useRef } from 'react';
import type { DNA } from '../engine/dna';
import type { Gene } from '../engine/gene';

const XMAR = 5;
const YMAR = 20;
const NXSIZE = 35;
const NYSIZE = 25;

function arraysEqual(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

// Ports NodeDisplay.java: lay genes out in layers by depth, draw an edge
// from each node to its parent (found by trimming one address segment and
// matching against the previous layer).
export function NodeGraph({ dna, width, height }: { dna: DNA; width: number; height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, width, height);
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let prevLayer: Gene[] = [];
    let iter = 1;
    for (;;) {
      const layer = dna.genes.filter((g) => g.depth === iter);
      if (layer.length === 0) break;

      layer.forEach((gene, i) => {
        const x = width / 2 + (NXSIZE + XMAR) * i - ((NXSIZE + XMAR) * layer.length) / 2;
        const y = (NYSIZE + YMAR) * iter;

        if (iter > 1) {
          const parentAdress = gene.adress.slice(0, -1);
          const parentIndex = prevLayer.findIndex((p) => arraysEqual(p.adress, parentAdress));
          if (parentIndex >= 0) {
            const px = width / 2 + (NXSIZE + XMAR) * parentIndex - ((NXSIZE + XMAR) * prevLayer.length) / 2;
            const py = (NYSIZE + YMAR) * (iter - 1);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(x, y - NYSIZE / 2);
            ctx.stroke();
          }
        }

        ctx.fillStyle = '#fff';
        ctx.fillText(gene.type.toUpperCase(), x, y);
      });

      prevLayer = layer;
      iter++;
    }
  }, [dna, width, height]);

  return <canvas ref={canvasRef} width={width} height={height} />;
}
