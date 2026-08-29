// Ports Artwork.update()'s g_scale/g_offset formula. Callers MUST pass rect
// and canvasHeightPx in drawing-buffer pixels (CSS-pixel values multiplied
// by gl.getPixelRatio()) -- gl_FragCoord in the fragment shader is in
// drawing-buffer space, not CSS pixels. Passing CSS pixels directly produces
// a subtly wrong crop/zoom on any display with devicePixelRatio != 1.
export interface TileRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TileUniforms {
  gOffsetX: number;
  gOffsetY: number;
  gScale: number;
}

export function computeTileUniforms(rect: TileRect, canvasHeightPx: number): TileUniforms {
  const gScale = (1 / rect.w) * 4;
  const gOffsetX = (-rect.x / rect.w - 0.5) * 4;
  const gOffsetY =
    (-(canvasHeightPx - rect.y - rect.h - (rect.w - rect.h) / 2) / rect.w - 0.5) * 4;
  return { gOffsetX, gOffsetY, gScale };
}
