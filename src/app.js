/* global CodeMirror */

import './index.html';
import './favicon.ico';
import './code/editor/snek-mode';

import './code/polyfills';

import createREGL from 'regl';

import { clickHandler } from './code/dom';
import { getConfig } from './code/config';

import { EventBus } from './code/event-bus';
import { Snek } from './code/snek';
import { Popups } from './code/ui/popups';
import { UI } from './code/ui';

const canvas = document.getElementById('canvas');

const config = getConfig();
const eventBus = new EventBus();
const popups = new Popups(document.querySelector('body'));
eventBus.on('display-popup', popups.trigger.bind(popups));

const gl = canvas.getContext('webgl2');
if (!gl) {
  eventBus.emit(
    'display-popup',
    'error-popup',
    'Sorry, there was an error starting Snek up',
    'Could not create WebGL context'
  );
} else {
  const regl = createREGL({ gl: gl });

  const snek = new Snek(config, eventBus, regl, CodeMirror);
  const ui = new UI(eventBus, popups, snek);

  clickHandler('#evaluate', () => eventBus.emit('evaluate'));
  clickHandler('#display-glsl', () =>
    eventBus.emit('display-popup', 'glslcode')
  );
  clickHandler('#display-sharing', () =>
    eventBus.emit('display-popup', 'sharing')
  );
  clickHandler('#display-settings', () =>
    eventBus.emit('display-popup', 'settings')
  );

  if (config.performanceMode) {
    ui.performanceMode();
  }

  const hash = URL.getHash();
  if (hash) {
    eventBus.emit('display-popup', hash);
  }
}
