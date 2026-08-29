import { describe, it, expect } from 'vitest';
import { FRAGMENT_SHADER_TEMPLATE } from './fragment.glsl';

describe('FRAGMENT_SHADER_TEMPLATE', () => {
  it('contains exactly one DNA code placeholder', () => {
    const matches = FRAGMENT_SHADER_TEMPLATE.match(/__DNA_CODE__/g) ?? [];
    expect(matches.length).toBe(1);
  });

  it('declares u_args sized to 1536 floats (ARGS_POOL_SIZE * 3)', () => {
    expect(FRAGMENT_SHADER_TEMPLATE).toContain('uniform float u_args[1536];');
  });

  it('uses highp precision, not mediump', () => {
    expect(FRAGMENT_SHADER_TEMPLATE).toContain('precision highp float;');
    expect(FRAGMENT_SHADER_TEMPLATE).not.toContain('mediump');
  });

  it('never uses u_aa directly as a loop bound', () => {
    expect(FRAGMENT_SHADER_TEMPLATE).not.toMatch(/for\s*\([^)]*<\s*u_aa/);
  });

  it('the placeholder sits inside the AA sampling loop, before precol is written', () => {
    const placeholderIndex = FRAGMENT_SHADER_TEMPLATE.indexOf('__DNA_CODE__');
    const precolWriteIndex = FRAGMENT_SHADER_TEMPLATE.indexOf('precol[iter] = col;');
    const iterYIndex = FRAGMENT_SHADER_TEMPLATE.indexOf('iterY = y_;');
    expect(placeholderIndex).toBeGreaterThan(iterYIndex);
    expect(placeholderIndex).toBeLessThan(precolWriteIndex);
  });
});
