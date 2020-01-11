import lexer from './lexer';
import ArithmaticShunter from './arithmatic-shunter';
import { ParserException, UnexpectedTokenException } from './errors';

import * as ast from '../ast';

class Parser {
  initialize(tokens, options = {}) {
    if (!tokens) {
      throw new ParserException('No tokens provided to the parser');
    }

    if (!(tokens instanceof Array)) {
      throw new ParserException(
        'A non-array was provided to the parser instead of a token array'
      );
    }

    this.debug = options.debug || false;
    this.testing = options.testing || false;
    this.tokens = tokens;
  }

  la1(tokenType) {
    if (this.eof()) {
      throw new ParserException('No tokens available');
    }

    return this.tokens[0].type == tokenType;
  }

  match(tokenType) {
    if (this.eof()) {
      throw new ParserException(`Expected ${tokenType} but found EOF`);
    }

    if (!this.la1(tokenType)) {
      throw new UnexpectedTokenException(tokenType, this.tokens[0]);
    }

    return this.tokens.shift();
  }

  eof() {
    return this.tokens.length === 0;
  }

  expectEof() {
    if (!this.eof()) {
      throw new UnexpectedTokenException('EOF', this.tokens[0]);
    }
  }

  resetStream(tokenType) {
    while (!this.eof() && !this.la1(tokenType)) {
      this.tokens.shift();
    }
    if (!this.eof() && this.la1(tokenType)) this.tokens.shift();
  }

  position() {
    if (this.testing) return {};

    return { line: this.tokens[0].line, character: this.tokens[0].character };
  }

  debugLog(msg) {
    if (this.debug) console.log(msg);
  }
}

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
  const shunter = new ArithmaticShunter({ testing: this.testing });
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
