/* global CodeMirror */

import './index.html';
import './css/reset.css';
import './css/style.css';

import createREGL from 'regl';

import { defaultVertexShader } from './js/glsl';

import { codeToFrag, lint } from './js/language';

const startProgram = 'position.x -> osc(5) >> out;';
const snek = {
  drawFunc: null,
};

function updateDrawFunc(regl, fragShader) {
  //console.log(fragShader);
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

  const canvas = document.getElementById('canvas');

  var gl = canvas.getContext('webgl2');
  if (!gl) {
    return;
  }
  const regl = createREGL({
    gl: gl,
  });

  const textArea = document.getElementById('code');

  const editor = CodeMirror.fromTextArea(textArea, {
    keyMap,
    value: startProgram,
    theme: 'snek',
    mode: 'snek',
    gutters: ['CodeMirror-lint-markers'],
    lint: {
      getAnnotations: text => {
        const { errors } = lint(text);

        return errors.map(err => ({
          from: CodeMirror.Pos(err.line - 1, err.character - 1),
          to: CodeMirror.Pos(err.line - 1, err.character - 1 + err.length),
          message: err.message,
          severity: 'error',
        }));
      },
    },
    extraKeys: {
      'Ctrl-Enter': function(instance) {
        var program = instance.getValue();
        const result = codeToFrag(program);
        if (result.errors.length < 1) {
          updateDrawFunc(regl, result.code);
        } else {
          console.log('errors', result.errors);
        }
      },
    },
  });

  const result = codeToFrag(editor.getValue());
  if (result.errors.length < 1) {
    updateDrawFunc(regl, result.code);
  }

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
