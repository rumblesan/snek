/* global CodeMirror */

import './index.html';
import './css/style.css';
import './css/snek-theme.css';

import createREGL from 'regl';

import { getConfig } from './config.js';

import './js/editor/snek-mode';

import Snek from './snek';

const startProgram = 'position.x -> osc(5) >> out;';

const canvas = document.getElementById('canvas');

var gl = canvas.getContext('webgl2');
if (!gl) {
  console.log('No webgl support');
} else {
  document.querySelectorAll('.hidden-until-load').forEach(el => {
    el.classList.remove('hidden-until-load');
  });

  const config = getConfig();
  const body = document.querySelector('body');
  body.classList.add(`theme-${config.theme}`);
  if (config.performanceMode) {
    body.classList.add('performance-mode');
  }

  const regl = createREGL({ gl: gl });

  const snek = new Snek(config, regl, CodeMirror);
  snek.setProgram(startProgram);
  snek.evaluate();

  snek.start();
}
