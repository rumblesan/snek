const defaultConfig = {
  keyMap: 'default',
  lineNumbers: false,
  theme: 'snek',
  performanceMode: false,
};

export function getConfig() {
  const urlParams = new URLSearchParams(window.location.search);

  const keyMap = urlParams.has('keymap')
    ? urlParams.get('keymap')
    : defaultConfig.keyMap;

  const lineNumbers = urlParams.has('linenumbers') | defaultConfig.lineNumbers;

  const theme = urlParams.has('theme')
    ? urlParams.get('theme')
    : defaultConfig.theme;

  const performanceMode =
    urlParams.has('performancemode') | defaultConfig.performanceMode;

  return {
    keyMap,
    lineNumbers,
    theme,
    performanceMode,
  };
}
