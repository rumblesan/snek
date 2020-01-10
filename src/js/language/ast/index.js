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
export function Routing(from, to, { line, character } = {}) {
  return {
    node: ROUTING,
    from,
    to,
    line,
    character,
  };
}

/**
 *  value: BinaryOp | Num | Accessor | Bus
 */
export function Source(source, type, { line, character } = {}) {
  return {
    node: SOURCE,
    source,
    type,
    line,
    character,
  };
}

/**
 *  input: Source | Patch
 *  func:  Function | SubPatch
 */
export function Patch(input, func, type, { line, character } = {}) {
  return {
    node: PATCH,
    input,
    func,
    type,
    line,
    character,
  };
}

/**
 *  name: Identifier
 *  args: [Source | Patch]
 */
export function Func(name, args, type, { line, character } = {}) {
  return {
    node: FUNC,
    name,
    args,
    type,
    line,
    character,
  };
}

/**
 *  name: Identifier
 *  input: Identifier
 *  patch: Source | Patch
 */
export function SubPatch(input, patch, type, { line, character } = {}) {
  return {
    node: SUBPATCH,
    input,
    patch,
    type,
    line,
    character,
  };
}

/**
 *  operator: Op
 *  value1: Source
 *  value2: Source
 */
export function BinaryOp(op, value1, value2, type, { line, character } = {}) {
  return {
    node: BINARYOP,
    op,
    value1,
    value2,
    type,
    line,
    character,
  };
}

/**
 *  value: Float
 */
export function Num(value, type, { line, character } = {}) {
  return {
    node: NUM,
    value,
    type,
    line,
    character,
  };
}

/**
 *  source:   Bus | Function | SubPatch
 *  channels: [Identifier]
 */
export function Accessor(source, channels, type, { line, character } = {}) {
  return {
    node: ACCESSOR,
    source,
    channels,
    type,
    line,
    character,
  };
}

/**
 *  name:  Identifier
 */
export function Bus(name, type, { line, character } = {}) {
  return {
    node: BUS,
    name,
    type,
    line,
    character,
  };
}
