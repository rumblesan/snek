/* global CodeMirror */

import './index.html';
import './css/style.css';
import './css/snek-theme.css';
import './js/editor/snek-mode';

import createREGL from 'regl';

import { getConfig } from './config.js';

import Snek from './snek';
import UI from './ui';

const startProgram = 'position.x -> osc(5) >> out;';

const canvas = document.getElementById('canvas');

var gl = canvas.getContext('webgl2');
if (!gl) {
  console.log('No webgl support');
} else {
  const config = getConfig();

  const regl = createREGL({ gl: gl });

  const snek = new Snek(config, regl, CodeMirror);
  snek.setProgram(startProgram);
  snek.evaluate();

  UI(config, snek);

  snek.start();
}
