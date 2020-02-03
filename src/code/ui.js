import settingsPopup from '../templates/settings-menu.handlebars';
import glslDisplayPopup from '../templates/glsl-display-popup.handlebars';

export function startupError(message) {
  const errMsg = document.querySelector('#startup-error-message');
  errMsg.appendChild(document.createTextNode(message));
  const startupError = document.querySelector('#startup-error');
  startupError.classList.remove('hidden');
}

export class UI {
  constructor(snek) {
    this.snek = snek;

    this.clickHandler('button#evaluate', this.snek.evaluate.bind(this.snek));
    this.clickHandler('button#display-glsl', this.showGLSLCode.bind(this));
    this.clickHandler('button#display-settings', this.showSettings.bind(this));

    this.errorDisplayText = document.createTextNode('');
    this.errorDisplayEl = document.querySelector('#error-display');
    this.errorDisplayEl.appendChild(this.errorDisplayText);

    this.displayedPopup = null;
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
      case '#glslcode':
        this.showGLSLCode();
        break;
    }
  }

  showGLSLCode() {
    const programs = this.snek.currentGLSL;
    const contents = glslDisplayPopup(programs);
    this.showPopup('glslcode', contents);
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

    const data = {
      defaultKeymapURL: defaultKeymapURL.toString(),
      vimKeymapURL: vimKeymapURL.toString(),
      performanceEnabledURL: performanceEnabledURL.toString(),
      performanceDisabledURL: performanceDisabledURL.toString(),
      lineNumbersEnabledURL: lineNumbersEnabledURL.toString(),
      lineNumbersDisabledURL: lineNumbersDisabledURL.toString(),
    };
    const contents = settingsPopup(data);
    this.showPopup('settings', contents);
  }

  clickHandler(selector, callback) {
    document.querySelector(selector).addEventListener('click', e => {
      e.preventDefault();
      callback();
      return false;
    });
  }

  showPopup(name, contents) {
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
