import * as templates from '../templates';
import { encodeProgram } from './encoder';

export function startupError(message) {
  const errMsg = document.querySelector('#startup-error-message');
  errMsg.appendChild(document.createTextNode(message));
  const startupError = document.querySelector('#startup-error');
  startupError.classList.remove('hidden');
}

export class UI {
  constructor(config, eventBus, snek) {
    this.eventBus = eventBus;

    this.popups = {};
    this.displayedPopupName = null;

    this.registerPopup('glslcode', () => this.showGLSLMarkup(snek));
    this.registerPopup('sharing', () => this.sharingMarkup(snek));
    this.registerPopup('settings', () => this.settingsMarkup());

    this.clickHandler('#evaluate', () => this.eventBus.emit('evaluate'));
    this.clickHandler('#display-glsl', () => this.triggerPopup('glslcode'));
    this.clickHandler('#display-sharing', () => this.triggerPopup('sharing'));
    this.clickHandler('#display-settings', () => this.triggerPopup('settings'));

    this.eventBus.on('display-error', err => this.displayError(err));
    this.eventBus.on('clear-error', () => this.clearError());
  }

  display() {
    document.querySelectorAll('.invisible-until-load').forEach(el => {
      el.classList.remove('invisible-until-load');
    });
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

  clickHandler(selector, callback) {
    document.querySelector(selector).addEventListener('click', e => {
      e.preventDefault();
      callback();
      return false;
    });
  }

  registerPopup(name, markupGenerator) {
    this.popups[name] = {
      name,
      markupGenerator: markupGenerator,
    };
  }

  triggerPopup(name) {
    if (!this.popups[name]) {
      return;
    }

    if (this.displayedPopupName === name) {
      // If the currently displayed popup is the one we're triggering
      // then assume that the button has been clicked to hide it again
      this.hidePopup();
      return;
    }

    // If a popup is displayed, but isn't the triggered one,
    // then hide it and display the newly triggered one
    if (this.displayedPopupName) {
      this.hidePopup();
    }

    this.displayedPopupName = name;
    URL.setHash(this.displayedPopupName);

    const popup = document.createElement('div');
    popup.setAttribute('id', 'popup-window');
    popup.classList.add('popup-window');
    popup.innerHTML = this.popups[name].markupGenerator();

    popup.querySelector('#popup-close').addEventListener('click', e => {
      e.preventDefault();
      this.hidePopup();
      return false;
    });

    document.querySelector('body').appendChild(popup);
  }

  hidePopup() {
    const popup = document.querySelector('#popup-window');
    if (popup) {
      popup.remove();
    }
    this.displayedPopupName = '';
    URL.setHash(this.displayedPopupName);
  }
}
