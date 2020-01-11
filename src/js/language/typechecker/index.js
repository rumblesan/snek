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

export class UnexpectedTypeException extends TypeCheckerException {
  constructor(expected, ast) {
    const msg = `Found ${ast.node} with type ${typeToString(
      ast.type
    )} but expected ${typeToString(expected)}`;
    super(msg);
    this.name = 'UnexpectedTypeException';
    this.displayable = true;
    this.line = ast.line;
    this.character = ast.character;
    this.length = 1;
  }
}

export class IncorrectPatchTypeException extends TypeCheckerException {
  constructor(func, inputAst, funcAst) {
    const msg = `Function ${func.name} expected a ${typeToString(
      func.inputType
    )} input but received ${typeToString(inputAst.type)}`;
    super(msg);
    this.name = 'UnexpectedTypeException';
    this.displayable = true;
    this.line = funcAst.line;
    this.character = funcAst.character;
    this.length = func.name.length;
  }
}

export class InvalidAccessorException extends TypeCheckerException {
  constructor(message, accessorAst) {
    super(message);
    this.name = 'InvalidAccessorException';
    this.displayable = true;
    this.line = accessorAst.line;
    this.character = accessorAst.character;
    this.length = 1;
  }
}

export class InvalidBusException extends TypeCheckerException {
  constructor(ast) {
    const message = `Bus ${ast.name} is invalid`;
    super(message);
    this.name = 'InvalidBusException';
    this.displayable = true;
    this.line = ast.line;
    this.character = ast.character;
    this.length = ast.name.length;
  }
}

function CheckerState(busses, functions, operators) {
  const busDict = {};
  busses.forEach(b => (busDict[b.id] = b));

  const funcDict = {};
  functions.forEach(f => (funcDict[f.name] = f));

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

export function FunctionType(name, inputType, argTypes, returnType) {
  return {
    name,
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

  return typeCheckProgram(ast, state);
}

function typeCheckProgram(ast, state) {
  nodeAssert(ast, PROGRAM);
  const result = { ast: null, errors: [] };
  ast.routings.forEach(routing => {
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
  nodeAssert(ast, ROUTING);
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
  nodeAssert(ast, PATCH);
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

function typeCheckFunction(ast, inputAst, state) {
  nodeAssert(ast, FUNC);
  const funcTypes = state.functions[ast.name];
  ast.args.forEach(a => typeCheckSignal(a, state));
  if (!typesMatch(funcTypes.inputType, inputAst.type)) {
    throw new IncorrectPatchTypeException(funcTypes, inputAst, ast);
  }
  ast.args.forEach((arg, idx) => {
    if (!typesMatch(arg.type, funcTypes.argTypes[idx])) {
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

function typeCheckSubPatch(ast /*, inputType, state*/) {
  nodeAssert(ast, SUBPATCH);
  throw new TypeCheckerException(`SubPatch not yet implemented`);
}

function typeCheckBinaryOp(ast, state) {
  nodeAssert(ast, BINARYOP);
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
  } else if (validChannelsForSource(ast.channels, sourceType)) {
    if (ast.channels.length === 1) {
      ast.type = sourceType.dataType;
    } else {
      ast.type = Vector(ast.channels.length, sourceType.dataType);
    }
    return ast.type;
  } else {
    throw new InvalidAccessorException(
      `Accessor ${ast.channel} is not available on a vector with only ${ast.source.type.count} elements`,
      ast.line,
      ast.character
    );
  }
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
  nodeAssert(ast, NUM);
  ast.type = Float();
  return ast.type;
}
