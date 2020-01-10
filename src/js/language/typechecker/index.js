import {
  GENERIC,
  INPUT,
  VEC,
  Float,
  Vector,
  typesMatch,
  typeToString,
  busTypeChannels,
  validChannelsForSource,
} from '../types';
import {
  PROGRAM,
  ROUTING,
  SOURCE,
  PATCH,
  FUNC,
  SUBPATCH,
  BINARYOP,
  NUM,
  ACCESSOR,
  BUS,
} from '../ast/nodes';

export class TypeCheckerException extends Error {
  constructor(message) {
    super(message);
  }
}

function CheckerState(busses, functions, operators) {
  const busDict = {};
  busses.forEach(b => (busDict[b.id] = b));

  const funcDict = {};
  functions.forEach(f => (funcDict[f.id] = f));

  const opDict = {};
  operators.forEach(o => (opDict[o.id] = o));

  return {
    busses: busDict,
    functions: funcDict,
    operators: opDict,
  };
}

export function BusType(id, type, channels) {
  return {
    id,
    type,
    channels,
  };
}

export function InternalBusType(id, type) {
  return {
    id,
    type,
    channels: busTypeChannels(type),
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

export function FunctionType(id, inputType, argTypes, returnType) {
  return {
    id,
    inputType,
    argTypes,
    returnType,
  };
}

function nodeAssert(ast, expected) {
  if (ast.node !== expected) {
    throw new TypeCheckerException(
      `Expected a ${expected} to typecheck but got ${ast.node}`
    );
  }
}

export function typeCheck(ast, busses = [], functions = [], ops = []) {
  nodeAssert(ast, PROGRAM);

  const state = CheckerState(busses, functions, ops);

  typeCheckProgram(ast, state);
  return {
    ast,
    errors: [],
  };
}

function typeCheckProgram(ast, state) {
  nodeAssert(ast, PROGRAM);
  ast.routings.forEach(routing => typeCheckRouting(routing, state));
}

function typeCheckRouting(ast, state) {
  nodeAssert(ast, ROUTING);
  const bus = ast.to;
  bus.type = typeCheckSignal(ast.from, state);

  if (state.busses[bus.name]) {
    if (!typesMatch(state.busses[bus.name].type, bus.type)) {
      const signalTypeString = typeToString(bus.type);
      const busTypeString = typeToString(state.busses[bus.name].type);
      throw new TypeCheckerException(
        `Types must match for pre-existing bus ${bus.name}: Can't send ${signalTypeString} to ${busTypeString}`
      );
    }
  }
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
  nodeAssert(ast, PATCH);
  const inputType = typeCheckSignal(ast.input, state);
  switch (ast.func.node) {
    case FUNC:
      ast.type = typeCheckFunction(ast.func, inputType, state);
      return ast.type;
    case SUBPATCH:
      ast.type = typeCheckSubPatch(ast.func, inputType, state);
      return ast.type;
    case ACCESSOR:
      ast.type = typeCheckAccessor(ast.func, inputType, state);
      return ast.type;
    default:
      throw new TypeCheckerException(
        `Expecting Function or SubPatch but found ${ast.func.node}`
      );
  }
}

function typeCheckSource(ast, state) {
  nodeAssert(ast, SOURCE);
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

function typeCheckFunction(ast, inputType, state) {
  nodeAssert(ast, FUNC);
  const funcTypes = state.functions[ast.name];
  const argTypes = ast.args.map(a => typeCheckSignal(a, state));
  if (
    typesMatch(funcTypes.inputType, inputType) &&
    argTypes.every((a, idx) => typesMatch(a, funcTypes.argTypes[idx]))
  ) {
    if (funcTypes.returnType.type === INPUT) {
      if (funcTypes.inputType.type === GENERIC) {
        ast.type = inputType;
      } else {
        ast.type = funcTypes.inputType;
      }
    } else {
      ast.type = funcTypes.returnType;
    }
    return ast.type;
  } else {
    throw new TypeCheckerException(
      `Expecting BinaryOp, Number or Accessor but found ${ast.node}`
    );
  }
}

function typeCheckSubPatch(ast /*, inputType, state*/) {
  nodeAssert(ast, SUBPATCH);
  throw new TypeCheckerException(`SubPatch not yet implemented`);
}

function typeCheckBinaryOp(ast, state) {
  nodeAssert(ast, BINARYOP);
  const leftType = typeCheckSource(ast.value1, state);
  const rightType = typeCheckSource(ast.value2, state);
  const opTypes = state.operators[ast.op];
  if (
    typesMatch(opTypes.leftType, leftType) &&
    typesMatch(opTypes.rightType, rightType)
  ) {
    ast.type = opTypes.returnType;
    return ast.type;
  } else {
    throw new TypeCheckerException(
      `Expecting BinaryOp, Number or Accessor but found ${ast.node}`
    );
  }
}

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
    throw new TypeCheckerException(
      "Can't take a single channel from a non Vector type bus"
    );
  } else if (validChannelsForSource(ast.channels, sourceType)) {
    if (ast.channels.length === 1) {
      ast.type = sourceType.dataType;
    } else {
      ast.type = Vector(ast.channels.length, sourceType.dataType);
    }
    return ast.type;
  } else {
    throw new TypeCheckerException(
      `Accessor ${ast.channel} is not available on a vector with only ${ast.source.type.count} elements`
    );
  }
}

function typeCheckBus(bus, state) {
  const busTyping = state.busses[bus.name];
  bus.type = busTyping.type;
  return bus.type;
}

function typeCheckNum(ast) {
  nodeAssert(ast, NUM);
  ast.type = Float();
  return ast.type;
}
