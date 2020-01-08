import {
  PROGRAM,
  ROUTING,
  SIGNAL,
  PATCH,
  FUNC,
  SUBPATCH,
  BINARYOP,
  NUM,
  ACCESSOR,
  BUS,
} from './nodes';

/**
 *  value: [Routings]
 */
export function Program(routings) {
  return {
    node: PROGRAM,
    routings,
  };
}

/**
 *  from: Signal | Patch
 *  to:   Bus
 */
export function Routing(from, to, { line, pos } = {}) {
  return {
    node: ROUTING,
    from,
    to,
    line,
    pos,
  };
}

/**
 *  value: BinaryOp | Num | Accessor | Bus
 */
export function Signal(signal, type, { line, pos } = {}) {
  return {
    node: SIGNAL,
    signal,
    type,
    line,
    pos,
  };
}

/**
 *  source:      Signal | Patch
 *  transformer: Function | SubPatch
 */
export function Patch(source, transformer, type, { line, pos } = {}) {
  return {
    node: PATCH,
    source,
    transformer,
    type,
    line,
    pos,
  };
}

/**
 *  name: Identifier
 *  args: [Signal | Patch]
 */
export function Func(name, args, type, { line, pos } = {}) {
  return {
    node: FUNC,
    name,
    args,
    type,
    line,
    pos,
  };
}

/**
 *  name: Identifier
 *  input: Identifier
 *  patch: Signal | Patch
 */
export function SubPatch(input, patch, type, { line, pos } = {}) {
  return {
    node: SUBPATCH,
    input,
    patch,
    type,
    line,
    pos,
  };
}

/**
 *  operator: Op
 *  value1: Expression | Signal
 *  value2: Expression | Signal
 */
export function BinaryOp(op, value1, value2, type, { line, pos } = {}) {
  return {
    node: BINARYOP,
    op,
    value1,
    value2,
    type,
    line,
    pos,
  };
}

/**
 *  value: Float
 */
export function Num(value, type, { line, pos } = {}) {
  return {
    node: NUM,
    value,
    type,
    line,
    pos,
  };
}

/**
 *  source:  Identifier
 *  channel: Identifier
 */
export function Accessor(bus, channel, type, { line, pos } = {}) {
  return {
    node: ACCESSOR,
    bus,
    channel,
    type,
    line,
    pos,
  };
}

/**
 *  name:  Identifier
 */
export function Bus(name, type, { line, pos } = {}) {
  return {
    node: BUS,
    name,
    type,
    line,
    pos,
  };
}
