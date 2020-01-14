/* global CodeMirror */

import './index.html';
import './css/style.css';
import './css/snek-theme.css';

import createREGL from 'regl';

import { defaultVertexShader } from './js/glsl';

import { codeToFrag, lint } from './js/language';

import './js/editor/snek-mode';

const startProgram = 'position.x -> osc(5) >> out;';

const snek = {
  drawFunc: null,
};

function updateDrawFunc(regl, fragShader) {
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

const defaultConfig = {
  keyMap: 'default',
  lineNumbers: false,
  theme: 'snek',
  performanceMode: false,
};

function getConfig() {
  const urlParams = new URLSearchParams(window.location.search);

  const keyMap = urlParams.has('keymap')
    ? urlParams.get('keymap')
    : defaultConfig.keyMap;

  const lineNumbers = urlParams.has('linenumbers') | defaultConfig.lineNumbers;

  const theme = urlParams.has('theme')
    ? urlParams.get('theme')
    : defaultConfig.theme;

  const performanceMode =
    urlParams.has('performancemode') | defaultConfig.performanceMode;

  return {
    keyMap,
    lineNumbers,
    theme,
    performanceMode,
  };
}

function run() {
  const canvas = document.getElementById('canvas');

  var gl = canvas.getContext('webgl2');
  if (!gl) {
    return;
  }

  document.querySelectorAll('.hidden-until-load').forEach(el => {
    el.classList.remove('hidden-until-load');
  });

  const config = getConfig();
  const body = document.querySelector('body');
  body.classList.add(`theme-${config.theme}`);
  if (config.performanceMode) {
    body.classList.add('performance-mode');
  }

  const regl = createREGL({
    gl: gl,
  });

  const evaluate = editor => {
    const program = editor.getValue();
    const result = codeToFrag(program);
    if (result.errors.length < 1) {
      updateDrawFunc(regl, result.code);
    } else {
      console.log('errors', result.errors);
    }
  };

  const editor = CodeMirror.fromTextArea(document.getElementById('code'), {
    keyMap: config.keyMap,
    lineNumbers: config.lineNumbers,
    theme: config.theme,
    mode: 'snek',
    autofocus: true,
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
      'Ctrl-Enter': evaluate,
    },
  });

  editor.setValue(startProgram);
  evaluate(editor);

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
