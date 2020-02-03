/* global CodeMirror */

import './index.html';
import './styles/main.scss';
import './js/editor/snek-mode';

import createREGL from 'regl';

import { getConfig } from './config.js';

import Snek from './snek';
import { startupError } from './ui';

const canvas = document.getElementById('canvas');

const gl = canvas.getContext('webgl2');
if (!gl) {
  startupError('Could not create WebGL context');
  console.log('No webgl support');
} else {
  const config = getConfig();

  const regl = createREGL({ gl: gl });

  const snek = new Snek(config, regl, CodeMirror);

  snek.start();
}
