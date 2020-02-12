import * as templates from '../../templates';
import { encodeProgram } from '../encoder';

export class UI {
  constructor(eventBus, popups, snek) {
    this.displayedPopupName = null;

    popups.register('glslcode', true, () => this.showGLSLMarkup(snek));
    popups.register('sharing', true, () => this.sharingMarkup(snek));
    popups.register('settings', true, () => this.settingsMarkup());

    eventBus.on('display-error', err => this.displayError(err));
    eventBus.on('clear-error', () => this.clearError());
  }

  performanceMode() {
    document.querySelector('body').classList.add('performance-mode');
  }

  displayError(err) {
    const errorDisplayEl = document.querySelector('#error-display');
    errorDisplayEl.classList.remove('hidden');
    errorDisplayEl.innerText = err.message.substring(0, 10);
  }

  clearError() {
    const errorDisplayEl = document.querySelector('#error-display');
    errorDisplayEl.classList.add('hidden');
    errorDisplayEl.innerText = '';
  }

  sharingMarkup(snek) {
    const encodedProgram = encodeProgram(snek.getProgram());
    const programSharingURL = URL.fromLocation();
    programSharingURL.searchParams.set('program', encodedProgram);
    // TODO maybe make the entire URL clear of params???
    programSharingURL.hash = '';
    return templates.sharingPopup({
      programSharingURL: programSharingURL.toString(),
    });
  }

  showGLSLMarkup(snek) {
    return templates.glslDisplayPopup(snek.getGLSL());
  }

  settingsMarkup() {
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
  }
}
