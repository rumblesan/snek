const fragHeader = `
precision mediump float;
uniform sampler2D texture;
uniform float u_time;
varying vec2 uv;
`

const vertHeader = `
precision mediump float;
attribute vec2 a_position;
varying vec2 uv;
`

function generateVertCode() {
  return `
  ${vertHeader}

  void main () {
    uv = a_position;
    gl_Position = vec4(2.0 * a_position - 1.0, 0, 1);
  }`;
}

function generateFragCode(body, funcs=[]) {
  return `
  ${fragHeader}

  ${funcs.join('\n')}

  void main () {
    vec4 c = vec4(0, 0, 0, 0);
    vec2 st = uv;
    ${body}
    gl_FragColor = c;
  }`;
}
