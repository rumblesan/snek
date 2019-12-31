import * as canto34 from 'canto34';

const types = canto34.StandardTokenTypes;

const lexer = new canto34.Lexer({ languageName: 'snek' });

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

lexer.addTokenType(types.whitespaceWithNewlines());
lexer.addTokenType(comment());
lexer.addTokenType(types.constant(';', 'semi colon'));
lexer.addTokenType(types.comma());
lexer.addTokenType(types.period());

lexer.addTokenType(types.constant('->', 'patch arrow'));
lexer.addTokenType(types.constant('=>', 'subpatch arrow'));
lexer.addTokenType(types.constant('>>', 'route arrow'));

lexer.addTokenType(types.openParen());
lexer.addTokenType(types.closeParen());

lexer.addTokenType(operator());

lexer.addTokenType(number());

lexer.addTokenType(identifier());

export default lexer;
