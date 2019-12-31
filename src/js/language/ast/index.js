import {
  PROGRAM,
  ROUTING,
  SIGNAL,
  PATCH,
  FUNC,
  SUBPATCH,
  BINARYOP,
  NUM,
  CHANNEL,
  BUS,
} from './nodes';

import { FLOAT } from '../types';

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
 *  source: Signal | Patch
 *  to:     Bus
 */
export function Routing(from, to) {
  return {
    node: ROUTING,
    from,
    to,
  };
}

/**
 *  value: BinaryOp | UnaryOp | Num | Channel | Bus
 */
export function Signal(signal, type) {
  return {
    node: SIGNAL,
    signal,
    type,
  };
}

/**
 *  source:  Signal | Patch
 *  sink:    Function | SubPatch
 */
export function Patch(source, sink) {
  return {
    node: PATCH,
    source,
    sink,
  };
}

/**
 *  name: Identifier
 *  args: [Signal | Patch]
 */
export function Func(name, args, type) {
  return {
    node: FUNC,
    name,
    args,
    type,
  };
}

/**
 *  name: Identifier
 *  input: Identifier
 *  patch: Signal | Patch
 */
export function SubPatch(input, patch, type) {
  return {
    node: SUBPATCH,
    input,
    patch,
    type,
  };
}

/**
 *  operator: Op
 *  value1: Expression | Signal
 *  value2: Expression | Signal
 */
export function BinaryOp(op, value1, value2, type) {
  return {
    node: BINARYOP,
    op,
    value1,
    value2,
    type,
  };
}

/**
 *  value: Float
 */
export function Num(value) {
  return {
    node: NUM,
    value,
    type: FLOAT,
  };
}

/**
 *  source:  Identifier
 *  channel: Identifier
 */
export function Channel(source, channel, type) {
  return {
    node: CHANNEL,
    name,
    type,
  };
}

/**
 *  name:  Identifier
 */
export function Bus(name, type) {
  return {
    node: BUS,
    name,
    type,
  };
}
