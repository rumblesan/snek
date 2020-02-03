const defaultConfig = {
  keyMap: 'default',
  lineNumbers: false,
  theme: 'snek',
  performanceMode: false,
  program: 'position.x -> osc(5) >> out;',
};

export function getConfig() {
  const params = URL.fromLocation().searchParams;

  const keyMap = params.has('keymap')
    ? params.get('keymap')
    : defaultConfig.keyMap;

  const lineNumbers = params.has('linenumbers') | defaultConfig.lineNumbers;

  const theme = params.has('theme') ? params.get('theme') : defaultConfig.theme;

  const performanceMode =
    params.has('performancemode') | defaultConfig.performanceMode;

  const program = defaultConfig.program;

  return {
    keyMap,
    lineNumbers,
    theme,
    performanceMode,
    program,
  };
}
