/* global CodeMirror */

import './index.html';
import './styles/main.scss';
import './code/editor/snek-mode';

import './code/polyfills';

import createREGL from 'regl';

import { getConfig } from './code/config';

import { EventBus } from './code/event-bus';
import { Snek } from './code/snek';
import { UI } from './code/ui';

const canvas = document.getElementById('canvas');

const gl = canvas.getContext('webgl2');
if (!gl) {
  UI.startupError('Could not create WebGL context');
  console.log('No webgl support');
} else {
  const regl = createREGL({ gl: gl });

  const config = getConfig();
  const eventBus = new EventBus();
  const snek = new Snek(config, eventBus, regl, CodeMirror);
  const ui = new UI(config, eventBus, snek);

  ui.display();

  snek.start();

  if (config.performanceMode) {
    ui.performanceMode();
  }

  const hash = URL.getHash();
  if (hash) {
    ui.triggerPopup(hash);
  }
}
