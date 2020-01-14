export default function UI(config, snek) {
  const evalButton = document.querySelector('#evaluate');

  evalButton.addEventListener('click', e => {
    e.preventDefault();
    snek.evaluate();
    return false;
  });

  const body = document.querySelector('body');
  body.classList.add(`theme-${config.theme}`);
  if (config.performanceMode) {
    body.classList.add('performance-mode');
  }

  document.querySelectorAll('.hidden-until-load').forEach(el => {
    el.classList.remove('hidden-until-load');
  });
}
