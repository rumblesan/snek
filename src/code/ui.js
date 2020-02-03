import * as templates from './templates';

export function startupError(message) {
  const errMsg = document.querySelector('#startup-error-message');
  errMsg.appendChild(document.createTextNode(message));
  const startupError = document.querySelector('#startup-error');
  startupError.classList.remove('hidden');
}

export class UI {
  constructor(snek) {
    this.snek = snek;

    this.setupButton('button#evaluate', this.snek.evaluate.bind(this));

    this.setupPopup('button#display-glsl', this.showGLSLCode.bind(this));
    this.setupPopup('button#display-settings', this.showSettings.bind(this));

    this.errorDisplayText = document.createTextNode('');
    this.errorDisplayEl = document.querySelector('#error-display');
    this.errorDisplayEl.appendChild(this.errorDisplayText);

    this.templates = templates;
    this.popupDisplayed = false;
    this.checkHash();
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
    this.errorDisplayEl.classList.remove('hidden');
    this.errorDisplayText.nodeValue = err.message.substring(0, 10);
  }
  clearError() {
    this.errorDisplayEl.classList.add('hidden');
    this.errorDisplayText.nodeValue = '';
  }
  checkHash() {
    switch (URL.fromLocation().hash) {
      case '#settings':
        this.showSettings();
        break;
      case '#glsl':
        this.showGLSLCode();
        break;
    }
  }

  showGLSLCode() {
    URL.setHash('glsl');
    const programs = this.snek.currentGLSL;
    const contents = this.templates.glslDisplay(programs);
    this.showPopup(contents);
  }

  showSettings() {
    URL.setHash('settings');

    const defaultKeymapURL = URL.fromLocation();
    defaultKeymapURL.searchParams.delete('keymap');
    const vimKeymapURL = URL.fromLocation();
    vimKeymapURL.searchParams.set('keymap', 'vim');

    const performanceDisabledURL = URL.fromLocation();
    performanceDisabledURL.searchParams.delete('performancemode');
    const performanceEnabledURL = URL.fromLocation();
    performanceEnabledURL.searchParams.set('performancemode', 'enabled');

    const data = {
      defaultKeymapURL: defaultKeymapURL.toString(),
      vimKeymapURL: vimKeymapURL.toString(),
      performanceEnabledURL: performanceEnabledURL.toString(),
      performanceDisabledURL: performanceDisabledURL.toString(),
    };
    const contents = this.templates.settingsDisplay(data);
    this.showPopup(contents);
  }

  setupButton(selector, callback) {
    document.querySelector(selector).addEventListener('click', e => {
      e.preventDefault();
      callback();
      return false;
    });
  }

  setupPopup(selector, callback) {
    document.querySelector(selector).addEventListener('click', e => {
      e.preventDefault();
      if (this.popupDisplayed) {
        this.hidePopup();
      } else {
        callback();
      }
      return false;
    });
  }

  showPopup(contents) {
    if (this.popupDisplayed) {
      this.hidePopup();
    }
    const popup = document.createElement('div');
    popup.setAttribute('id', 'popup-window');
    popup.classList.add('popup-window');
    popup.innerHTML = contents;
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
    console.log('showing popup');
  }

  hidePopup() {
    window.location.hash = '';
    const popup = document.querySelector('#popup-window');
    if (popup) {
      popup.remove();
    }
    this.popupDisplayed = false;
    console.log('hiding popup');
  }
}
