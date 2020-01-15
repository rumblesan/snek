import { Lexer, StandardTokenTypes } from '@rumblesan/virgil';

const lexer = new Lexer({ languageName: 'snek' });

const whiteSpace = StandardTokenTypes.whitespaceWithNewlines();

const comment = {
  name: 'comment',
  ignore: true,
  regexp: /^\/\/[^\n]*/,
};

const semicolon = StandardTokenTypes.constant(';', 'semi colon');

const comma = StandardTokenTypes.constant(',', 'comma');

const period = StandardTokenTypes.constant('.', 'period');

const patchArrow = StandardTokenTypes.constant('->', 'patch arrow');

const subpatchArrow = StandardTokenTypes.constant('=>', 'subpatch arrow');

const routeArrow = StandardTokenTypes.constant('>>', 'route arrow');

const openParen = StandardTokenTypes.constant('(', 'open paren');

const closeParen = StandardTokenTypes.constant(')', 'close paren');

const operator = {
  name: 'operator',
  regexp: /^[*/+\-%]+/,
};

const number = {
  name: 'number',
  regexp: /^\d+(\.\d+)?/,
  interpret(content) {
    return parseFloat(content);
  },
};

const identifier = {
  name: 'identifier',
  regexp: /^[a-zA-Z][a-zA-Z0-9]*/,
};

export const tokenIdentifiers = {
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
};

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
