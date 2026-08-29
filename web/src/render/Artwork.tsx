import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { DNA } from '../engine/dna';
import { ARGS_POOL_SIZE } from '../engine/constants';
import { buildArtworkMaterial } from './buildMaterial';
import { computeTileUniforms, type TileRect } from './tileUniforms';
import { appTimeClock } from '../state/appTimeClock';

export interface ArtworkProps {
  dna: DNA;
  rect: TileRect;
  canvasHeightPx: number;
  aa: number;
}

export function Artwork({ dna, rect, canvasHeightPx, aa }: ArtworkProps) {
  const { gl } = useThree();
  const material = useMemo(() => buildArtworkMaterial(dna.code), [dna.code]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame(() => {
    const pixelRatio = gl.getPixelRatio();
    const u = computeTileUniforms(
      {
        x: rect.x * pixelRatio,
        y: rect.y * pixelRatio,
        w: rect.w * pixelRatio,
        h: rect.h * pixelRatio,
      },
      canvasHeightPx * pixelRatio,
    );

    material.uniforms.u_g_off.value = [u.gOffsetX, u.gOffsetY];
    material.uniforms.u_g_scale.value = u.gScale;
    material.uniforms.u_off.value = [dna.offset.x, dna.offset.y];
    material.uniforms.u_scale.value = dna.scale;
    material.uniforms.u_hoff.value = dna.hueOffset;
    material.uniforms.u_aa.value = aa;

    const argsArray = material.uniforms.u_args.value as Float32Array;
    const addTime = Math.sin(appTimeClock.value * 2 * Math.PI);
    const count = Math.min(dna.args.length, ARGS_POOL_SIZE);
    for (let i = 0; i < count; i++) {
      argsArray[i * 3] = dna.args[i].x + addTime;
      argsArray[i * 3 + 1] = dna.args[i].y + addTime;
      argsArray[i * 3 + 2] = dna.args[i].z + addTime;
    }
  });

  return (
    <mesh position={[rect.x + rect.w / 2, -(rect.y + rect.h / 2), 0]}>
      <planeGeometry args={[rect.w, rect.h]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
