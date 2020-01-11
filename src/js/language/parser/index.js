import { ArithmaticShunter, Parser } from '@rumblesan/virgil';

import lexer from './lexer';

import * as ast from '../ast';

const operatorPrecedences = {
  '^': 15,
  '*': 14,
  '/': 14,
  '%': 14,
  '+': 13,
  '-': 13,
  '<': 11,
  '<=': 11,
  '>': 11,
  '>=': 11,
  '==': 10,
  '!=': 10,
  '&&': 6,
  '||': 5,
};

const BinaryOpConstructor = (opToken, value1Ast, value2Ast) => {
  // TODO pass position into BinaryOp
  return ast.BinaryOp(opToken.content, value1Ast, value2Ast, undefined, {});
};

const parser = new Parser();

parser.parse = function(program, options = {}) {
  this.debugLog('With Debugging');
  try {
    const tokens = lexer.tokenize(program);
    this.initialize(tokens, options);
    return this.program();
  } catch (err) {
    if (err.displayable) {
      return {
        ast: null,
        errors: [err],
      };
    } else {
      throw err;
    }
  }
};

parser.program = function() {
  const routings = [];
  const errors = [];
  while (!this.eof()) {
    try {
      routings.push(this.routing());
    } catch (err) {
      if (err.displayable) {
        errors.push(err);
        this.resetStream('semi colon');
      } else {
        throw err;
      }
    }
  }
  return {
    ast: ast.Program(routings),
    errors,
  };
};

parser.routing = function() {
  this.debugLog('Routing');
  const position = this.position();
  const signal = this.signal();
  this.match('route arrow');
  const bus = this.bus();
  this.match('semi colon');

  return ast.Routing(signal, bus, position);
};

parser.signal = function() {
  this.debugLog('Signal');
  const position = this.position();
  let source = this.source();
  while (this.la1('patch arrow')) {
    this.match('patch arrow');
    const func = this.func();
    source = ast.Patch(source, func, undefined, position);
  }
  return source;
};

parser.source = function() {
  this.debugLog('Source');
  const position = this.position();
  let src = this.baseSource();
  if (this.la1('operator')) {
    src = this.operator(src);
  }
  return ast.Source(src, undefined, position);
};

parser.baseSource = function() {
  this.debugLog('Base Source');
  const position = this.position();
  if (this.la1('number')) {
    return ast.Num(this.match('number').content, undefined, position);
  } else if (this.la1('identifier')) {
    const bus = ast.Bus(this.match('identifier').content, undefined, position);
    if (this.la1('period')) {
      this.match('period');
      const channelPosition = this.position();
      const channels = this.match('identifier')
        .content.split('')
        .map(c => ast.Channel(c, channelPosition));
      return ast.Accessor(bus, channels, undefined, position);
    }
    return bus;
  } else if (this.la1('open paren')) {
    this.match('open paren');
    const source = this.source();
    this.match('close paren');
    return source;
  }
};

parser.func = function() {
  this.debugLog('Function');
  if (this.la1('open paren')) {
    this.match('open paren');
    const func = this.func();
    this.match('close paren');
    return func;
  }

  let func;
  const position = this.position();
  const id = this.match('identifier').content;
  if (this.la1('open paren')) {
    this.match('open paren');
    const args = this.argList();
    this.match('close paren');
    func = ast.Func(id, args, undefined, position);
  } else if (this.la1('subpatch arrow')) {
    this.match('subpatch arrow');
    const body = this.signal();
    func = ast.SubPatch(id, body, undefined, position);
  } else {
    // TODO error handling
  }

  if (this.la1('period')) {
    this.match('period');
    const channelPosition = this.position();
    const channels = this.match('identifier')
      .content.split('')
      .map(c => ast.Channel(c, channelPosition));
    return ast.Accessor(func, channels, undefined, position);
  }
  return func;
};

parser.operator = function(left) {
  this.debugLog('Operator');
  const shunter = new ArithmaticShunter(operatorPrecedences, {
    astConstructor: BinaryOpConstructor,
  });
  const position = this.testing
    ? {}
    : { line: left.line, character: left.character };
  shunter.shuntValue(ast.Source(left, undefined, position));
  while (this.la1('operator')) {
    shunter.shuntOp(this.match('operator'));
    shunter.shuntValue(this.source());
  }
  return shunter.getOutput();
};

parser.argList = function() {
  const args = [];
  if (this.la1('close paren')) {
    this.debugLog('argList: 0 args');
    return args;
  }
  args.push(this.signal());
  while (this.la1('comma')) {
    this.match('comma');
    args.push(this.signal());
  }
  this.debugLog(`argList: ${args.length} args`);
  return args;
};

parser.bus = function() {
  const position = this.position();
  const busName = this.match('identifier').content;
  this.debugLog(`parsed Bus: ${busName}`);
  return ast.Bus(busName, undefined, position);
};

export default parser;
