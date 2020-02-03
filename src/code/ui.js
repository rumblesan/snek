import * as templates from '../templates';
import { encodeProgram } from './encoder';

export function startupError(message) {
  const errMsg = document.querySelector('#startup-error-message');
  errMsg.appendChild(document.createTextNode(message));
  const startupError = document.querySelector('#startup-error');
  startupError.classList.remove('hidden');
}

export class UI {
  constructor(config, snek) {
    this.clickHandler('#evaluate', () => snek.evaluate());
    this.clickHandler('#display-glsl', () => this.showGLSLCode(snek));
    this.clickHandler('#display-sharing', () => this.showSharing(snek));
    this.clickHandler('#display-settings', () => this.showSettings());

    this.displayedPopup = null;
    this.checkHash();
    if (config.performanceMode) {
      document.querySelector('body').classList.add('performance-mode');
    }
  }

  display() {
    document.querySelectorAll('.invisible-until-load').forEach(el => {
      el.classList.remove('invisible-until-load');
    });
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

  checkHash() {
    switch (URL.fromLocation().hash) {
      case '#settings':
        this.showSettings();
        break;
      case '#glslcode':
        this.showGLSLCode();
        break;
      case '#sharing':
        this.showSharing();
        break;
    }
  }

  showSharing(snek) {
    const encodedProgram = encodeProgram(snek.getProgram());
    const programSharingURL = URL.fromLocation();
    programSharingURL.searchParams.set('program', encodedProgram);

    this.showPopup('sharing', templates.sharingPopup, {
      programSharingURL: programSharingURL.toString(),
    });
  }

  showGLSLCode(snek) {
    this.showPopup('glslcode', templates.glslDisplayPopup, snek.currentGLSL);
  }

  showSettings() {
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

    this.showPopup('settings', templates.settingsPopup, {
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

  showPopup(name, template, data) {
    if (this.displayedPopup === name) {
      this.hidePopup();
      return;
    }
    if (this.displayedPopup) {
      this.hidePopup();
    }
    this.displayedPopup = name;
    URL.setHash(this.displayedPopup);

    const popup = document.createElement('div');
    popup.setAttribute('id', 'popup-window');
    popup.classList.add('popup-window');
    popup.innerHTML = template(data);

    const close = popup.querySelector('#popup-close');
    if (close) {
      close.addEventListener('click', e => {
        e.preventDefault();
        this.hidePopup();
        return false;
      });
    }

    const body = document.querySelector('body');
    body.appendChild(popup);
    this.popupDisplayed = true;
  }

  hidePopup() {
    const popup = document.querySelector('#popup-window');
    if (popup) {
      popup.remove();
    }
    this.displayedPopup = '';
    URL.setHash(this.displayedPopup);
  }
}
