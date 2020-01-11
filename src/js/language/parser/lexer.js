import { Lexer, StandardTokenTypes } from '@rumblesan/virgil';

const lexer = new Lexer({ languageName: 'snek' });

const comment = () => ({
  name: 'comment',
  ignore: true,
  regexp: /^\/\/[^\n]*/,
});

const identifier = () => ({
  name: 'identifier',
  regexp: /^[a-zA-Z][a-zA-Z0-9]*/,
});

const operator = () => ({
  name: 'operator',
  regexp: /^[*/+\-%]+/,
});

const number = () => ({
  name: 'number',
  regexp: /^\d+(\.\d+)?/,
  role: ['constant', 'numeric'],
  interpret(content) {
    return parseFloat(content);
  },
});

lexer.addTokenType(StandardTokenTypes.whitespaceWithNewlines());
lexer.addTokenType(comment());
lexer.addTokenType(StandardTokenTypes.constant(';', 'semi colon'));
lexer.addTokenType(StandardTokenTypes.comma());
lexer.addTokenType(StandardTokenTypes.period());

lexer.addTokenType(StandardTokenTypes.constant('->', 'patch arrow'));
lexer.addTokenType(StandardTokenTypes.constant('=>', 'subpatch arrow'));
lexer.addTokenType(StandardTokenTypes.constant('>>', 'route arrow'));

lexer.addTokenType(StandardTokenTypes.openParen());
lexer.addTokenType(StandardTokenTypes.closeParen());

lexer.addTokenType(operator());

lexer.addTokenType(number());

lexer.addTokenType(identifier());

export default lexer;
