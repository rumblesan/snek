import { dedent } from 'dentist';

import {
  SOURCE,
  FUNC,
  SUBPATCH,
  PATCH,
  BINARYOP,
  NUM,
  ACCESSOR,
  BUS,
} from '../ast/nodes';

import { typeToString } from '../types';

export class CompilerException extends Error {
  constructor(message) {
    super(message);
  }
}

function CompilerState(busses, functions) {
  const funcDict = {};
  functions.forEach(f => (funcDict[f.name] = f));

  const busDict = {};
  busses.forEach(b => (busDict[b.name] = b));

  return {
    busses: busDict,
    functions: funcDict,
  };
}

function simpleCode(programCode) {
  return {
    usedBuiltIns: {},
    programCode,
  };
}

function compiledCode(usedBuiltIns, programCode) {
  return {
    usedBuiltIns,
    programCode,
  };
}

export function BuiltInBus(name, direction, type, glslName, glslType) {
  return {
    name,
    direction,
    type,
    glslName,
    glslType,
  };
}

export function BuiltInFunction(
  name,
  defaultArgs,
  generic,
  typedNames,
  body,
  typedBody
) {
  return {
    name,
    defaultArgs,
    generic,
    typedNames,
    body,
    typedBody,
  };
}

export function compile(ast, builtInBusses, builtinFunctions) {
  const state = CompilerState(builtInBusses, builtinFunctions);

  return compileProgram(ast, state);
}

function compileProgram(ast, state) {
  const usedBuiltIns = {};
  const programCode = [];

  const builtInBusCode = Object.values(state.busses)
    .filter(b => b.direction === 'input')
    .map(b => `${b.glslType} ${typeToString(b.type)} ${b.glslName};`)
    .join('\n');

  ast.routings.forEach(routing => {
    const output = compileRouting(routing, state);
    Object.values(output.usedBuiltIns).forEach(
      ub => (usedBuiltIns[ub.name] = ub)
    );
    programCode.push(output.programCode);
  });

  const builtInFuncCode = Object.values(usedBuiltIns).map(ub => ub.body);

  const mainBody = dedent(`
    precision mediump float;

    ${builtInBusCode}

    ${builtInFuncCode.join('\n')}

    void main() {
      ${programCode.join('\n')}
    }
  `);

  return mainBody;
}

function compileRouting(ast, state) {
  const signal = compileSignal(ast.from, state);
  const bus = ast.to;
  let assignment = '';
  if (state.busses[bus.name] && state.busses[bus.name].direction === 'output') {
    assignment = `${state.busses[bus.name].glslName} =`;
  } else {
    assignment = `${typeToString(bus.type)} ${bus.name} =`;
  }
  return compiledCode(
    signal.usedBuiltIns,
    `${assignment} ${signal.programCode};`
  );
}

function compileSignal(ast, state) {
  if (ast.node === PATCH) {
    return compilePatch(ast, state);
  } else if (ast.node === SOURCE) {
    return compileSource(ast, state);
  }
}

function compileSource(ast, state) {
  const source = ast.source;
  switch (source.node) {
    case BINARYOP:
      return compileBinaryOp(source, state);
    case NUM:
      return compileNum(source, state);
    case ACCESSOR:
      return compileAccessor(source, state);
    case BUS:
      return compileBus(source, state);
  }
}

function compilePatch(ast, state) {
  const inputCode = compileSignal(ast.input, state);
  const usedBuiltIns = inputCode.usedBuiltIns;
  let output;
  switch (ast.func.node) {
    case FUNC:
      output = compileFunction(
        ast.func,
        ast.input,
        inputCode.programCode,
        state
      );
      break;
    case SUBPATCH:
      output = compileSubPatch(
        ast.func,
        ast.input,
        inputCode.programCode,
        state
      );
      break;
  }
  Object.values(output.usedBuiltIns).forEach(ub => (usedBuiltIns[ub] = ub));
  return compiledCode(usedBuiltIns, output.programCode);
}

function compileFunction(ast, inputAst, signalInputCode, state) {
  const func = state.functions[ast.name];
  if (ast.args.length <= func.defaultArgs.length) {
    for (let i = ast.args.length; i < func.defaultArgs.length; i += 1) {
      ast.args.push(func.defaultArgs[i]);
    }
  }
  let usedFuncName = func.name;
  let funcBody = func.body;
  if (func.generic) {
    const type = typeToString(inputAst.type);
    usedFuncName = func.typedNames[type];
    funcBody = func.typedBody[type];
  }
  const usedBuiltIns = { usedFuncName: { name: usedFuncName, body: funcBody } };
  const argCode = [signalInputCode];
  ast.args.forEach(arg => {
    const output = compileSignal(arg, state);
    Object.values(output.usedBuiltIns).forEach(ub => (usedBuiltIns[ub] = ub));
    argCode.push(output.programCode);
  });
  const funcCode = `${usedFuncName}(${argCode.join(', ')})`;
  return compiledCode(usedBuiltIns, funcCode);
}

function compileSubPatch(/*ast, signalInputCode, state*/) {
  throw new CompilerException(`SubPatches not currently supported`);
}

function compileBinaryOp(ast, state) {
  const left = compileSource(ast.value1, state);
  const right = compileSource(ast.value2, state);
  return simpleCode(`${left.programCode} ${ast.op} ${right.programCode}`);
}

function compileNum(ast /*, state */) {
  return simpleCode(
    Number.isInteger(ast.value) ? `${ast.value}.0` : `${ast.value}`
  );
}

function compileAccessor(ast /*, state */) {
  return simpleCode(`${ast.bus}.${ast.channel}`);
}

function compileBus(ast /*, state */) {
  return simpleCode(`${ast.name}`);
}
