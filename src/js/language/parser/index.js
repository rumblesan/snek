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
  Channel,
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
  let signal = this.signal(debug);
  this.match('route arrow');
  let bus = this.bus(debug);
  this.match('semi colon');

  return Routing(signal, bus);
};

parser.signal = function(debug = false) {
  if (debug) console.log('Signal');
  const source = this.source(debug);
  if (this.la1('patch arrow')) {
    this.match('patch arrow');
    const to = this.signalChain(debug);
    return Patch(source, to);
  }
  return Signal(source);
};

parser.signalChain = function(debug = false) {
  if (debug) console.log('Signal Chain');
  const from = this.sink(debug);
  if (this.la1('patch arrow')) {
    this.match('patch arrow');
    const to = this.signalChain(debug);
    return Patch(from, to);
  }
  return from;
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
      return Channel(id, channelName);
    }
    return Bus(id);
  } else if (this.la1('open paren')) {
    this.match('open paren');
    const sig = this.signal(debug);
    this.match('close paren');
    return sig;
  }
};

parser.sink = function(debug = false) {
  if (debug) console.log('Sink');
  let snk = this.baseSink(debug);
  if (this.la1('operator')) {
    snk = this.operator(snk, debug);
  }
  return snk;
};

parser.baseSink = function(debug = false) {
  if (debug) console.log('Base Sink');
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
    const sink = this.sink(debug);
    this.match('close paren');
    return sink;
  }
};

parser.operator = function(left, debug = false) {
  if (debug) console.log('Operator');
  const shunter = new ArithmaticShunter();
  shunter.shuntValue(left);
  while (this.la1('operator')) {
    shunter.shuntOp(this.match('operator').content);
    shunter.shuntValue(this.source(debug));
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

export default parser;
