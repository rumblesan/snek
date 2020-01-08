import { Parser } from 'canto34';

import lexer from './lexer';
import ArithmaticShunter from './shuntingYard';

import {
  Program,
  Routing,
  Signal,
  Patch,
  Func,
  SubPatch,
  //BinaryOp,
  Num,
  Accessor,
  Bus,
} from '../ast';

const parser = new Parser();

parser.parse = function(program, debug = false) {
  if (debug) console.log('With Debugging');
  const tokens = lexer.tokenize(program);
  this.initialize(tokens);
  return this.program(debug);
};

parser.program = function(debug = false) {
  const routings = [];
  while (!this.eof()) {
    routings.push(this.routing(debug));
  }
  return Program(routings);
};

parser.routing = function(debug = false) {
  if (debug) console.log('Routing');
  const signal = this.signal(debug);
  this.match('route arrow');
  const bus = this.bus(debug);
  this.match('semi colon');

  return Routing(signal, bus);
};

parser.signal = function(debug = false) {
  if (debug) console.log('Signal');
  let source = Signal(this.source(debug));
  while (this.la1('patch arrow')) {
    this.match('patch arrow');
    const func = this.func(debug);
    source = Patch(source, func);
  }
  return source;
};

parser.source = function(debug = false) {
  if (debug) console.log('Source');
  let src = this.baseSource(debug);
  if (this.la1('operator')) {
    src = this.operator(src);
  }
  return src;
};

parser.baseSource = function(debug = false) {
  if (debug) console.log('Base Source');
  if (this.la1('number')) {
    return Num(this.match('number').content);
  } else if (this.la1('identifier')) {
    const id = this.match('identifier').content;
    if (this.la1('period')) {
      this.match('period');
      const channelName = this.match('identifier').content;
      return Accessor(id, channelName);
    }
    return Bus(id);
  } else if (this.la1('open paren')) {
    this.match('open paren');
    const source = this.source(debug);
    this.match('close paren');
    return source;
  }
};

parser.func = function(debug = false) {
  if (debug) console.log('Function');
  if (this.la1('identifier')) {
    const id = this.match('identifier').content;
    if (this.la1('open paren')) {
      this.match('open paren');
      const args = this.argList(debug);
      this.match('close paren');
      return Func(id, args);
    } else if (this.la1('subpatch arrow')) {
      this.match('subpatch arrow');
      const body = this.signal(debug);
      return SubPatch(id, body);
    }
    return Bus(id);
  } else if (this.la1('open paren')) {
    this.match('open paren');
    const func = this.func(debug);
    this.match('close paren');
    return func;
  }
};

parser.operator = function(left, debug = false) {
  if (debug) console.log('Operator');
  const shunter = new ArithmaticShunter();
  shunter.shuntValue(Signal(left));
  while (this.la1('operator')) {
    shunter.shuntOp(this.match('operator').content);
    shunter.shuntValue(Signal(this.source(debug)));
  }
  return shunter.getOutput();
};

parser.argList = function(debug = false) {
  const args = [];
  if (this.la1('close paren')) {
    if (debug) console.log('argList: 0 args');
    return args;
  }
  args.push(this.signal());
  while (this.la1('comma')) {
    this.match('comma');
    args.push(this.signal(debug));
  }
  if (debug) console.log(`argList: ${args.length} args`);
  return args;
};

parser.bus = function(debug = false) {
  const busName = this.match('identifier').content;
  if (debug) console.log(`parsed Bus: ${busName}`);
  return Bus(busName);
};

parser.position = function() {
  const { line, character } = this.tokens[0];
  return { line, character };
};

export default parser;
