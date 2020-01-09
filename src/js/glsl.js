export const defaultVertexShader = `
precision mediump float;
attribute vec2 a_position;
varying vec2 uv;

void main () {
  uv = a_position;
  gl_Position = vec4(2.0 * a_position - 1.0, 0, 1);
}`;
