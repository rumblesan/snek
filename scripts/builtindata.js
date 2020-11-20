/* global process */
import { glslFuncs } from '../src/code/language/builtins/functions';
import { glslOps } from '../src/code/language/builtins/ops';
import { glslBusses } from '../src/code/language/builtins/busses';

import { writeFileSync } from 'fs';

const functions = [];

Object.keys(glslFuncs).forEach((name) => {
  const ndata = glslFuncs[name];
  functions.push({
    name,
    args: ndata.args,
    output: ndata.returnType,
  });
});

const ops = [];

Object.keys(glslOps).forEach((name) => {
  const ndata = glslOps[name];
  ops.push({
    name,
    left: ndata.leftType,
    right: ndata.rightType,
    output: ndata.outputType,
  });
});

const busses = [];

Object.keys(glslBusses).forEach((name) => {
  const ndata = glslBusses[name];
  busses.push({
    name,
    type: ndata.type,
    channels: ndata.channels,
    direction: ndata.direction,
  });
});

const output = { functions, ops, busses };
const outputName = process.argv[2] || 'builtin-data.json';
console.log(`Writing output to ${outputName}`);
writeFileSync(outputName, JSON.stringify(output));
