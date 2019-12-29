/* global regl */

const snek = {
  drawFuncs: [],
};

function run() {

  const canvas = document.getElementById("c");

  var gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }
  const regl = createREGL({
    gl: gl
  })

  const body = `
    c = osc(uv, 5.0, 0.1, 0.0);
  `;

  const drawSnek = regl({
    frag: generateFragCode(body, [glslFuncs.osc.glsl]),

    vert: generateVertCode(),

    attributes: {
      a_position: [
        -2, 0,
        0, -2,
        2, 2]
    },

    uniforms: {
      u_time: ({tick}) => 0.01 * tick
    },

    count: 3
  })

  snek.drawFuncs.push(drawSnek);

  regl.frame(function () {
    regl.clear({
      color: [0, 0, 0, 1]
    })

    for (let i = 0; i < snek.drawFuncs.length; i++) {
      snek.drawFuncs[i]();
    }
  })
}

run();
