import { Parser } from 'canto34';

import lexer from './lexer';
import ArithmaticShunter from './shuntingYard';

import * as ast from '../ast';

const parser = new Parser();

export const defaultOpts = {
  debug: false,
  positions: true,
};

parser.parse = function(program, opts = {}) {
  if (opts.debug) console.log('With Debugging');
  const tokens = lexer.tokenize(program);
  this.initialize(tokens);
  return this.program(opts);
};

parser.clearLine = function(opts = {}) {
  if (opts.debug) console.log('Clearing Line');
  while (!this.eof() && !this.la1('semi colon')) {
    this.tokens.shift();
  }
  if (this.la1('semi colon')) this.tokens.shift();
};

parser.program = function(opts = {}) {
  const routings = [];
  const errors = [];
  while (!this.eof()) {
    try {
      routings.push(this.routing(opts));
    } catch (e) {
      errors.push(e);
      this.clearLine(opts);
    }
  }
  return {
    ast: ast.Program(routings),
    errors,
  };
};

parser.routing = function(opts = {}) {
  if (opts.debug) console.log('Routing');
  const position = this.position(opts);
  const signal = this.signal(opts);
  this.match('route arrow');
  const bus = this.bus(opts);
  this.match('semi colon');

  return ast.Routing(signal, bus, position);
};

parser.signal = function(opts = {}) {
  if (opts.debug) console.log('Signal');
  const position = this.position(opts);
  let source = this.source(opts);
  while (this.la1('patch arrow')) {
    this.match('patch arrow');
    const func = this.func(opts);
    source = ast.Patch(source, func, undefined, position);
  }
  return source;
};

parser.source = function(opts = {}) {
  if (opts.debug) console.log('Source');
  const position = this.position(opts);
  let src = this.baseSource(opts);
  if (this.la1('operator')) {
    src = this.operator(src);
  }
  return ast.Source(src, undefined, position);
};

parser.baseSource = function(opts = {}) {
  if (opts.debug) console.log('Base Source');
  const position = this.position(opts);
  if (this.la1('number')) {
    return ast.Num(this.match('number').content, undefined, position);
  } else if (this.la1('identifier')) {
    const bus = ast.Bus(this.match('identifier').content, undefined, position);
    if (this.la1('period')) {
      this.match('period');
      const channelNames = this.match('identifier').content.split('');
      return ast.Accessor(bus, channelNames, undefined, position);
    }
    return bus;
  } else if (this.la1('open paren')) {
    this.match('open paren');
    const source = this.source(opts);
    this.match('close paren');
    return source;
  }
};

parser.func = function(opts = {}) {
  if (opts.debug) console.log('Function');
  if (this.la1('open paren')) {
    this.match('open paren');
    const func = this.func(opts);
    this.match('close paren');
    return func;
  }

  let func;
  const position = this.position(opts);
  const id = this.match('identifier').content;
  if (this.la1('open paren')) {
    this.match('open paren');
    const args = this.argList(opts);
    this.match('close paren');
    func = ast.Func(id, args, undefined, position);
  } else if (this.la1('subpatch arrow')) {
    this.match('subpatch arrow');
    const body = this.signal(opts);
    func = ast.SubPatch(id, body, undefined, position);
  } else {
    // TODO error handling
  }

  if (this.la1('period')) {
    this.match('period');
    const channelNames = this.match('identifier').content.split('');
    return ast.Accessor(func, channelNames, undefined, position);
  }
  return func;
};

parser.operator = function(left, opts = {}) {
  if (opts.debug) console.log('Operator');
  const shunter = new ArithmaticShunter();
  const position = opts.positions
    ? { line: left.line, character: left.character }
    : {};
  shunter.shuntValue(ast.Source(left, undefined, position));
  while (this.la1('operator')) {
    shunter.shuntOp(this.match('operator'));
    shunter.shuntValue(this.source(opts));
  }
  return shunter.getOutput(opts);
};

parser.argList = function(opts = {}) {
  const args = [];
  if (this.la1('close paren')) {
    if (opts.debug) console.log('argList: 0 args');
    return args;
  }
  args.push(this.signal());
  while (this.la1('comma')) {
    this.match('comma');
    args.push(this.signal(opts));
  }
  if (opts.debug) console.log(`argList: ${args.length} args`);
  return args;
};

parser.bus = function(opts = {}) {
  const position = this.position(opts);
  const busName = this.match('identifier').content;
  if (opts.debug) console.log(`parsed Bus: ${busName}`);
  return ast.Bus(busName, undefined, position);
};

parser.position = function(opts) {
  if (!opts.positions) return {};

  const { line, character } = this.tokens[0];
  return { line, character };
};

export default parser;
