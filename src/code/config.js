import { decodeProgram } from './encoder';

const defaultConfig = {
  keyMap: 'default',
  lineNumbers: false,
  theme: 'snek',
  performanceMode: false,
  program: `
position.y -> osc(3).rg >> mod;

time -> osc(0.2).yz -> rotate(2) >> mod2;

position -> modulate(mod) -> repeat(time / 8, 3, 1, 1.1)
    -> rotate(mod2.r * 10).x -> osc(5, mod2.g / 10, mod.g) >> out;`,
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

  // TODO this could do with error handling
  const program = params.has('program')
    ? decodeProgram(params.get('program'))
    : defaultConfig.program;

  return {
    keyMap,
    lineNumbers,
    theme,
    performanceMode,
    program,
  };
}
