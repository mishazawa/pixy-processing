import { describe, it, expect } from 'vitest';
import { buildFragmentShader, buildArtworkMaterial } from './buildMaterial';
import { ARGS_POOL_SIZE } from '../engine/constants';

describe('buildFragmentShader', () => {
  it('substitutes the DNA code into the template', () => {
    const source = buildFragmentShader('vec3 col = g_x();');
    expect(source).toContain('vec3 col = g_x();');
    expect(source).not.toContain('__DNA_CODE__');
  });
});

describe('buildArtworkMaterial', () => {
  it('produces a material with the injected fragment shader and expected uniforms', () => {
    const material = buildArtworkMaterial('vec3 col = g_x();');

    expect(material.fragmentShader).toContain('vec3 col = g_x();');
    expect(material.uniforms.u_args.value.length).toBe(ARGS_POOL_SIZE * 3);
    expect(material.uniforms.u_aa.value).toBe(1);
    expect(material.uniforms.u_scale.value).toBe(4);
  });
});
