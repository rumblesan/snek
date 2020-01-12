import { Lexer, StandardTokenTypes } from '@rumblesan/virgil';

const lexer = new Lexer({ languageName: 'snek' });

const whiteSpace = StandardTokenTypes.whitespaceWithNewlines();

const comment = {
  name: 'comment',
  ignore: true,
  regexp: /^\/\/[^\n]*/,
};

const semicolon = StandardTokenTypes.constant(';', 'semi colon', 'punctuation');

const comma = StandardTokenTypes.constant(',', 'comma', 'punctuation');

const period = StandardTokenTypes.constant('.', 'period', 'operator');

const patchArrow = StandardTokenTypes.constant('->', 'patch arrow', 'keyword');

const subpatchArrow = StandardTokenTypes.constant(
  '=>',
  'subpatch arrow',
  'keyword'
);

const routeArrow = StandardTokenTypes.constant('>>', 'route arrow', 'keyword');

const openParen = StandardTokenTypes.constant('(', 'open paren', 'bracket');

const closeParen = StandardTokenTypes.constant(')', 'close paren', 'bracket');

const operator = {
  name: 'operator',
  regexp: /^[*/+\-%]+/,
  role: 'operator',
};

const number = {
  name: 'number',
  regexp: /^\d+(\.\d+)?/,
  role: 'number',
  interpret(content) {
    return parseFloat(content);
  },
};

const identifier = {
  name: 'identifier',
  regexp: /^[a-zA-Z][a-zA-Z0-9]*/,
  role: 'variable',
};

export const tokenIdentifiers = [
  whiteSpace,
  comment,
  semicolon,
  comma,
  period,
  patchArrow,
  routeArrow,
  openParen,
  closeParen,
  operator,
  number,
  identifier,
];

lexer.addTokenType(whiteSpace);
lexer.addTokenType(comment);
lexer.addTokenType(semicolon);
lexer.addTokenType(comma);
lexer.addTokenType(period);

lexer.addTokenType(patchArrow);
lexer.addTokenType(subpatchArrow);
lexer.addTokenType(routeArrow);

lexer.addTokenType(openParen);
lexer.addTokenType(closeParen);

lexer.addTokenType(operator);

lexer.addTokenType(number);

lexer.addTokenType(identifier);

export default lexer;
