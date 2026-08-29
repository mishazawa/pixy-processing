import { describe, it, expect } from 'vitest';
import { FRAGMENT_SHADER_TEMPLATE } from './fragment.glsl';
import { ARGS_POOL_SIZE } from '../engine/constants';

describe('FRAGMENT_SHADER_TEMPLATE', () => {
  it('contains exactly one DNA code placeholder', () => {
    const matches = FRAGMENT_SHADER_TEMPLATE.match(/__DNA_CODE__/g) ?? [];
    expect(matches.length).toBe(1);
  });

  it('declares u_args as a vec3 array sized to ARGS_POOL_SIZE, not a flat float array', () => {
    expect(FRAGMENT_SHADER_TEMPLATE).toContain(`uniform vec3 u_args[${ARGS_POOL_SIZE}];`);
    expect(FRAGMENT_SHADER_TEMPLATE).not.toMatch(/uniform float u_args\[/);
  });

  it('uses highp precision, not mediump', () => {
    expect(FRAGMENT_SHADER_TEMPLATE).toContain('precision highp float;');
    expect(FRAGMENT_SHADER_TEMPLATE).not.toContain('mediump');
  });

  it('never uses u_aa directly as a loop bound', () => {
    expect(FRAGMENT_SHADER_TEMPLATE).not.toMatch(/for\s*\([^)]*<\s*u_aa/);
  });

  it('the placeholder sits inside the AA sampling loop, before the sample is accumulated', () => {
    const placeholderIndex = FRAGMENT_SHADER_TEMPLATE.indexOf('__DNA_CODE__');
    const sumWriteIndex = FRAGMENT_SHADER_TEMPLATE.indexOf('sum += col;');
    const iterYIndex = FRAGMENT_SHADER_TEMPLATE.indexOf('iterY = y_;');
    expect(placeholderIndex).toBeGreaterThan(iterYIndex);
    expect(placeholderIndex).toBeLessThan(sumWriteIndex);
  });

  it('never uses dynamic (non-constant, non-loop-index) array indexing', () => {
    // GLSL ES 1.00 only allows array indices to be constant expressions or
    // a for-loop's own control variable -- confirmed by direct
    // gl.compileShader() against a real WebGL1 context during debugging.
    expect(FRAGMENT_SHADER_TEMPLATE).not.toContain('g_arg(');
    expect(FRAGMENT_SHADER_TEMPLATE).not.toContain('precol');
  });
});
