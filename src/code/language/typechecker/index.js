import { GENERIC, INPUT, VEC, Float, Vector, typesMatch } from '../types';

import {
  PROGRAM,
  SOURCE,
  PATCH,
  FUNC,
  SUBPATCH,
  BINARYOP,
  NUM,
  ACCESSOR,
  BUS,
} from '../ast/nodes';

import {
  TypeCheckerException,
  IncorrectPatchTypeException,
  InvalidAccessorException,
  InvalidBusException,
  UnexpectedTypeException,
} from './errors';

function CheckerState(busses, functions, operators) {
  const busDict = {};
  busses.forEach((b) => (busDict[b.id] = b));

  const funcDict = {};
  functions.forEach((f) => (funcDict[f.name] = f));

  const opDict = {};
  operators.forEach((o) => (opDict[o.id] = o));

  return {
    busses: busDict,
    functions: funcDict,
    operators: opDict,
  };
}

export function BusType(id, type) {
  return {
    id,
    type,
  };
}

export function InternalBusType(id, type) {
  return {
    id,
    type,
  };
}

export function OperatorType(id, leftType, rightType, returnType) {
  return {
    id,
    leftType,
    rightType,
    returnType,
  };
}

export function FunctionType(name, inputType, argTypes, returnType) {
  return {
    name,
    inputType,
    argTypes,
    returnType,
  };
}

export function typeCheck(ast, busses = [], functions = [], ops = []) {
  if (ast.node !== PROGRAM) {
    throw new TypeCheckerException(
      `Expected a Program to typecheck but got ${ast.node}`
    );
  }

  const state = CheckerState(busses, functions, ops);

  return typeCheckProgram(ast, state);
}

function typeCheckProgram(ast, state) {
  const result = { ast: null, errors: [] };
  ast.routings.forEach((routing) => {
    try {
      typeCheckRouting(routing, state);
    } catch (err) {
      if (err.displayable) {
        result.errors.push(err);
      } else {
        throw err;
      }
    }
  });
  if (result.errors.length < 1) {
    result.ast = ast;
  }
  return result;
}

function typeCheckRouting(ast, state) {
  const bus = ast.to;
  const signalType = typeCheckSignal(ast.from, state);

  if (state.busses[bus.name]) {
    const existingBus = state.busses[bus.name];
    if (!typesMatch(existingBus.type, signalType)) {
      throw new UnexpectedTypeException(signalType, existingBus);
    }
  }
  bus.type = signalType;
  state.busses[bus.name] = InternalBusType(bus.name, bus.type);
  return bus.type;
}

function typeCheckSignal(ast, state) {
  if (ast.node === PATCH) {
    ast.type = typeCheckPatch(ast, state);
  } else if (ast.node === SOURCE) {
    ast.type = typeCheckSource(ast, state);
  } else {
    throw new TypeCheckerException(
      `Expecting Patch or Signal but found ${ast.node}`
    );
  }
  return ast.type;
}

function typeCheckPatch(ast, state) {
  typeCheckSignal(ast.input, state);
  switch (ast.func.node) {
    case FUNC:
      ast.type = typeCheckFunction(ast.func, ast.input, state);
      return ast.type;
    case SUBPATCH:
      ast.type = typeCheckSubPatch(ast.func, ast.input, state);
      return ast.type;
    case ACCESSOR:
      ast.type = typeCheckAccessor(ast.func, ast.input, state);
      return ast.type;
    default:
      throw new TypeCheckerException(
        `Expecting Function or SubPatch but found ${ast.func.node}`
      );
  }
}

function typeCheckSource(ast, state) {
  const source = ast.source;
  switch (source.node) {
    case BINARYOP:
      ast.type = typeCheckBinaryOp(source, state);
      return ast.type;
    case NUM:
      ast.type = typeCheckNum(source, state);
      return ast.type;
    case ACCESSOR:
      ast.type = typeCheckAccessor(source, null, state);
      return ast.type;
    case BUS:
      ast.type = typeCheckBus(source, state);
      return ast.type;
    default:
      throw new TypeCheckerException(
        `Expecting BinaryOp, Number or Accessor but found ${ast.node}`
      );
  }
}

function typeCheckFunction(ast, inputAst, state) {
  const funcTypes = state.functions[ast.name];
  ast.args.forEach((a) => typeCheckSignal(a, state));
  if (!typesMatch(funcTypes.inputType, inputAst.type)) {
    throw new IncorrectPatchTypeException(funcTypes, inputAst, ast);
  }
  ast.args.forEach((arg, idx) => {
    if (
      funcTypes.argTypes[idx] &&
      !typesMatch(arg.type, funcTypes.argTypes[idx])
    ) {
      throw new UnexpectedTypeException(funcTypes.argTypes[idx], arg);
    }
  });
  if (funcTypes.returnType.type === INPUT) {
    if (funcTypes.inputType.type === GENERIC) {
      ast.type = inputAst.type;
    } else {
      ast.type = funcTypes.inputType;
    }
  } else {
    ast.type = funcTypes.returnType;
  }
  return ast.type;
}

function typeCheckSubPatch(/*ast, inputType, state*/) {
  throw new TypeCheckerException(`SubPatch not yet implemented`);
}

function typeCheckBinaryOp(ast, state) {
  const leftType = typeCheckSource(ast.value1, state);
  const rightType = typeCheckSource(ast.value2, state);
  const opTypes = state.operators[ast.op];
  if (!typesMatch(opTypes.leftType, leftType)) {
    throw new UnexpectedTypeException(opTypes.leftType, ast.value1);
  }
  if (!typesMatch(opTypes.rightType, rightType)) {
    throw new UnexpectedTypeException(opTypes.rightType, ast.value2);
  }
  ast.type = opTypes.returnType;
  return ast.type;
}

const channelNumbers = {
  x: 0,
  r: 0,
  y: 1,
  g: 1,
  z: 2,
  b: 2,
  w: 3,
  a: 3,
};

function typeCheckAccessor(ast, inputType, state) {
  let sourceType;
  switch (ast.source.node) {
    case BUS:
      sourceType = typeCheckBus(ast.source, state);
      break;
    case FUNC:
      sourceType = typeCheckFunction(ast.source, inputType, state);
      break;
    case SUBPATCH:
      sourceType = typeCheckSubPatch(ast.source, inputType, state);
      break;
  }
  if (sourceType.type !== VEC) {
    throw new InvalidAccessorException(
      "Can't access channels from a non Vector type bus",
      ast
    );
  }

  ast.channels.every((c) => {
    if (channelNumbers[c.name] > sourceType.count - 1) {
      throw new InvalidAccessorException(
        `${c.name} is not available on a signal with only ${sourceType.count} channels`,
        c.line,
        c.character
      );
    }
  });

  if (ast.channels.length === 1) {
    ast.type = sourceType.dataType;
  } else {
    ast.type = Vector(ast.channels.length, sourceType.dataType);
  }
  return ast.type;
}

function typeCheckBus(ast, state) {
  const busInfo = state.busses[ast.name];
  if (!busInfo) {
    throw new InvalidBusException(ast);
  }
  const busTyping = state.busses[ast.name];
  ast.type = busTyping.type;
  return ast.type;
}

function typeCheckNum(ast) {
  ast.type = Float();
  return ast.type;
}
