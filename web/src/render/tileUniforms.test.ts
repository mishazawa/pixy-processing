import { describe, it, expect } from 'vitest';
import { computeTileUniforms } from './tileUniforms';

describe('computeTileUniforms', () => {
  it('matches Artwork.update()\'s formula for a full-canvas square tile', () => {
    // g_scale = 1/w*4; g_offset = (-x/w-0.5, -(dh-y-h-(w-h)/2)/w-0.5) * 4
    const result = computeTileUniforms({ x: 0, y: 0, w: 800, h: 800 }, 800);

    expect(result.gScale).toBeCloseTo((1 / 800) * 4);
    expect(result.gOffsetX).toBeCloseTo(-2);
    expect(result.gOffsetY).toBeCloseTo(-2);
  });

  it('matches the formula for an offset grid tile', () => {
    const rect = { x: 100, y: 50, w: 200, h: 200 };
    const canvasHeightPx = 500;

    const result = computeTileUniforms(rect, canvasHeightPx);

    const expectedScale = (1 / rect.w) * 4;
    const expectedOffX = (-rect.x / rect.w - 0.5) * 4;
    const expectedOffY =
      (-(canvasHeightPx - rect.y - rect.h - (rect.w - rect.h) / 2) / rect.w - 0.5) * 4;

    expect(result.gScale).toBeCloseTo(expectedScale);
    expect(result.gOffsetX).toBeCloseTo(expectedOffX);
    expect(result.gOffsetY).toBeCloseTo(expectedOffY);
  });
});
