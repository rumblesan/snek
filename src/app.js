/* global CodeMirror */

import './index.html';
import './css/reset.css';
import './css/style.css';

import createREGL from 'regl';

import { defaultVertexShader } from './js/glsl';

import { codeToFrag } from './js/language';

const startProgram = 'position.x -> osc(5) >> out;';
const snek = {
  drawFunc: null,
};

function updateDrawFunc(regl, fragShader) {
  console.log(fragShader);
  const drawSnek = regl({
    frag: fragShader,

    vert: defaultVertexShader,

    attributes: {
      a_position: [-2, 0, 0, -2, 2, 2],
    },

    uniforms: {
      u_time: ({ tick }) => 0.01 * tick,
    },

    count: 3,
  });
  snek.drawFunc = drawSnek;
}

function run() {
  const urlParams = new URLSearchParams(window.location.search);

  const keyMap = urlParams.has('keymap') ? urlParams.get('keymap') : 'vim';
  console.log(keyMap);

  const canvas = document.getElementById('c');

  var gl = canvas.getContext('webgl2');
  if (!gl) {
    return;
  }
  const regl = createREGL({
    gl: gl,
  });

  const textArea = document.getElementById('code');

  const editor = CodeMirror.fromTextArea(textArea, {
    lineNumbers: true,
    keyMap,
    value: startProgram,
    extraKeys: {
      'Ctrl-Enter': function(instance) {
        var program = instance.getValue();
        updateDrawFunc(regl, codeToFrag(program));
      },
    },
  });

  const button = document.getElementById('compile');
  button.addEventListener('click', () => {
    const program = editor.getValue();
    updateDrawFunc(regl, codeToFrag(program));
  });

  updateDrawFunc(regl, codeToFrag(editor.getValue()));

  regl.frame(function() {
    regl.clear({
      color: [0, 0, 0, 1],
    });

    if (snek.drawFunc !== null) {
      snek.drawFunc();
    }
  });
}

run();
