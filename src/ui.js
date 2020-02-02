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

    document.querySelector('button#evaluate').addEventListener('click', e => {
      e.preventDefault();
      this.snek.evaluate();
      return false;
    });

    document
      .querySelector('button#toggle-popup')
      .addEventListener('click', e => {
        e.preventDefault();
        if (this.popupDisplayed) {
          this.hidePopup();
        } else {
          this.showPopup({ title: 'Just a test' });
        }
        return false;
      });

    this.errorDisplayText = document.createTextNode('');
    this.errorDisplayEl = document.querySelector('#error-display');
    this.errorDisplayEl.appendChild(this.errorDisplayText);

    this.templates = templates;
    this.popupDisplayed = false;
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

  showPopup(data) {
    const popup = document.createElement('div');
    popup.setAttribute('id', 'popup-window');
    popup.classList.add('popup-window');
    popup.innerHTML = this.templates.popupSurround(data);

    const body = document.querySelector('body');
    body.appendChild(popup);
    this.popupDisplayed = true;
    console.log('showing popup');
  }

  hidePopup() {
    const popup = document.querySelector('#popup-window');
    if (popup) {
      popup.remove();
    }
    this.popupDisplayed = false;
    console.log('hiding popup');
  }
}
