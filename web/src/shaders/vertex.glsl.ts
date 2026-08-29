// Simplified from app/src/main/resources/data/vertex.glsl: replaces
// Processing's transformMatrix/texMatrix uniforms with three.js's standard
// projectionMatrix/modelViewMatrix and a uv varying (Processing's
// texCoord/texMatrix dance has no equivalent outside its own pipeline).
export const VERTEX_SHADER = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
