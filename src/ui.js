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

    this.errorDisplayText = document.createTextNode('');
    this.errorDisplayEl = document.querySelector('#error-display');
    this.errorDisplayEl.appendChild(this.errorDisplayText);
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
}
