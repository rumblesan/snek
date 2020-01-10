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
 *  from: Source | Patch
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
export function Source(source, type, { line, pos } = {}) {
  return {
    node: SOURCE,
    source,
    type,
    line,
    pos,
  };
}

/**
 *  input: Source | Patch
 *  func:  Function | SubPatch
 */
export function Patch(input, func, type, { line, pos } = {}) {
  return {
    node: PATCH,
    input,
    func,
    type,
    line,
    pos,
  };
}

/**
 *  name: Identifier
 *  args: [Source | Patch]
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
 *  patch: Source | Patch
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
 *  value1: Source
 *  value2: Source
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
 *  source:   Bus | Function | SubPatch
 *  channels: [Identifier]
 */
export function Accessor(source, channels, type, { line, pos } = {}) {
  return {
    node: ACCESSOR,
    source,
    channels,
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
