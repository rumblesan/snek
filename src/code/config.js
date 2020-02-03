const defaultConfig = {
  keyMap: 'default',
  lineNumbers: false,
  theme: 'snek',
  performanceMode: false,
  program: 'position.x -> osc(5) >> out;',
};

export function getConfig() {
  const url = URL.fromLocation();

  const keyMap = url.searchParams.has('keymap')
    ? url.searchParams.get('keymap')
    : defaultConfig.keyMap;

  const lineNumbers =
    url.searchParams.has('linenumbers') | defaultConfig.lineNumbers;

  const theme = url.searchParams.has('theme')
    ? url.searchParams.get('theme')
    : defaultConfig.theme;

  const performanceMode =
    url.searchParams.has('performancemode') | defaultConfig.performanceMode;

  const program = defaultConfig.program;

  return {
    keyMap,
    lineNumbers,
    theme,
    performanceMode,
    program,
  };
}
