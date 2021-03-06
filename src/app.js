/* global CodeMirror */

import './index.html';
import './favicon.ico';
import './styles/main.scss';
import './code/editor/snek-mode';

import './code/polyfills';

import createREGL from 'regl';

import * as templates from './templates';

import { clickHandler } from './code/dom';
import { getConfig } from './code/config';
import { encodeProgram } from './code/encoder';

import { EventBus } from './code/event-bus';
import { Snek } from './code/snek';
import { Popups } from './code/ui/popups';
import { UI } from './code/ui';

const canvas = document.getElementById('canvas');

const config = getConfig();
const eventBus = new EventBus();
const ui = new UI(eventBus);
const popups = new Popups(document.querySelector('body'));
eventBus.on('display-popup', popups.trigger.bind(popups));
popups.register('error-popup', false, (message, error) => {
  return templates.errorPopup({
    message,
    error,
  });
});

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

  popups.register('glslcode', true, () => {
    return templates.glslDisplayPopup(snek.getGLSL());
  });
  popups.register('sharing', true, () => {
    const encodedProgram = encodeProgram(snek.getProgram());
    const programSharingURL = URL.fromLocation();
    programSharingURL.searchParams.set('program', encodedProgram);
    // TODO maybe make the entire URL clear of params???
    programSharingURL.hash = '';
    return templates.sharingPopup({
      programSharingURL: programSharingURL.toString(),
    });
  });
  popups.register('settings', true, () => {
    const defaultKeymapURL = URL.fromLocation();
    defaultKeymapURL.searchParams.delete('keymap');
    const vimKeymapURL = URL.fromLocation();
    vimKeymapURL.searchParams.set('keymap', 'vim');

    const performanceDisabledURL = URL.fromLocation();
    performanceDisabledURL.searchParams.delete('performancemode');
    const performanceEnabledURL = URL.fromLocation();
    performanceEnabledURL.searchParams.set('performancemode', 'enabled');

    const lineNumbersDisabledURL = URL.fromLocation();
    lineNumbersDisabledURL.searchParams.delete('linenumbers');
    const lineNumbersEnabledURL = URL.fromLocation();
    lineNumbersEnabledURL.searchParams.set('linenumbers', 'enabled');

    return templates.settingsPopup({
      defaultKeymapURL: defaultKeymapURL.toString(),
      vimKeymapURL: vimKeymapURL.toString(),
      performanceEnabledURL: performanceEnabledURL.toString(),
      performanceDisabledURL: performanceDisabledURL.toString(),
      lineNumbersEnabledURL: lineNumbersEnabledURL.toString(),
      lineNumbersDisabledURL: lineNumbersDisabledURL.toString(),
    });
  });

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
