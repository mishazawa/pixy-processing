import * as THREE from 'three';
import { FRAGMENT_SHADER_TEMPLATE } from '../shaders/fragment.glsl';
import { VERTEX_SHADER } from '../shaders/vertex.glsl';
import { ARGS_POOL_SIZE } from '../engine/constants';

const DNA_CODE_PLACEHOLDER = '__DNA_CODE__';

export function buildFragmentShader(dnaCode: string): string {
  if (!FRAGMENT_SHADER_TEMPLATE.includes(DNA_CODE_PLACEHOLDER)) {
    throw new Error('fragment shader template is missing the DNA code placeholder');
  }
  return FRAGMENT_SHADER_TEMPLATE.replace(DNA_CODE_PLACEHOLDER, dnaCode);
}

export function buildArtworkMaterial(dnaCode: string): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader: buildFragmentShader(dnaCode),
    uniforms: {
      u_g_off: { value: [0, 0] },
      u_g_scale: { value: 1 },
      u_off: { value: [0, 0] },
      u_scale: { value: 4 },
      u_hoff: { value: 0 },
      u_args: { value: new Float32Array(ARGS_POOL_SIZE * 3) },
      u_aa: { value: 1 },
    },
  });
}
