import { StandardTokenTypes, LineTracker } from 'canto34';

import {
  LexerException,
  PatternDefinitionException,
  UnmatchedCharacterException,
} from './errors';

function isNullOrUndefined(x) {
  if (typeof x === 'undefined') {
    return true;
  }

  if (x === null) {
    return true;
  }

  return false;
}

export class Lexer {
  constructor(options) {
    const defaults = {
      languageName: 'unnamedlanguage',
    };
    this.options = { ...defaults, ...options };
    this.tokenTypes = [];
  }

  addTokenType(tokenType) {
    if (!tokenType.name) {
      throw new PatternDefinitionException(
        "Token types must have a 'name' property"
      );
    }

    // FOR CONSIDERATION: for some tokens, the full 'consume' is requ§red for correct interpretation
    // (eg, JSON strings with escaped character) but a regex will do for syntax highlighting. In this
    // situation, both are allowed but consume is used for lexing and regexp is used for language definition.
    // if (tokenType.regexp && tokenType.consume) {
    // 	throw new canto34.PatternDefinitionException("Token types cannot have both a 'regexp' pattern and 'consume' function.");
    // }

    if (!tokenType.regexp && !tokenType.consume) {
      throw new PatternDefinitionException(
        "Token types must have a 'regexp' property or a 'consume' function"
      );
    }

    if (tokenType.regexp && !(tokenType.regexp instanceof RegExp)) {
      throw new PatternDefinitionException(
        "Token types 'regexp' property must be an instance of RegExp"
      );
    }

    if (tokenType.consume && typeof tokenType.consume !== 'function') {
      throw new PatternDefinitionException(
        "Token types 'consume' property must be a function"
      );
    }

    if (tokenType.interpret && typeof tokenType.interpret !== 'function') {
      throw new PatternDefinitionException(
        "Token types 'interpret' property must be a function"
      );
    }
    this.tokenTypes.push(tokenType);
  }

  tokenize(content) {
    if (content === undefined) {
      throw new LexerException('No content provided');
    }

    if (this.tokenTypes.length === 0) {
      throw new LexerException('No token types defined');
    }

    const result = [];
    let consumed;
    let remaining = content;
    const tracker = new LineTracker();
    const tokenTypeLength = this.tokenTypes.length;
    let consumeResult;

    while (remaining.length > 0) {
      let somethingFoundThisPass = false;

      for (let i = 0; i < tokenTypeLength; i++) {
        const tokenType = this.tokenTypes[i];

        consumeResult = undefined;
        if (tokenType.consume) {
          // must have a consume function;
          consumeResult = tokenType.consume(remaining);
          // should have told us what it consumed;
          if (consumeResult.success) {
            if (remaining.indexOf(consumeResult.consumed) !== 0) {
              throw new LexerException(
                `The consume function for ${tokenType.name} failed to return the start of the remaining content at ${tracker.line}.${tracker.character} and instead returned ${consumeResult.consumed}`
              );
            } else {
              somethingFoundThisPass = true;
              consumed = consumeResult.consumed;
            }
          } else {
            continue;
          }
        } else {
          const match = tokenType.regexp.exec(remaining);
          if (match) {
            // we found a token! great. What did it say? We only
            // want to match at the start of the string
            if (match.index === 0) {
              somethingFoundThisPass = true;
              consumed = match[0];
            } else {
              continue;
            }
          } else {
            continue;
          }
        }

        // handle our new token
        if (tokenType.interpret) {
          content = tokenType.interpret(consumed);
        } else if (consumeResult && !isNullOrUndefined(consumeResult.content)) {
          content = consumeResult.content;
        } else {
          content = consumed;
        }

        const token = {
          content,
          type: tokenType.name,
          line: tracker.line,
          character: tracker.character,
        };

        if (!tokenType.ignore) {
          result.push(token);
        }

        remaining = remaining.substring(consumed.length);
        tracker.consume(consumed);
        break; // This break is needed as we need to start matching from top of tokenType list
      }

      if (!somethingFoundThisPass) {
        const userPartOfString = remaining.substring(0, 15);
        const visibleUserPartOfString = userPartOfString
          .replace('\r', '\\r')
          .replace('\t', '\\t')
          .replace('\n', '\\n');
        throw new UnmatchedCharacterException(
          visibleUserPartOfString,
          tracker.line,
          tracker.character
        );
      }
    }

    return result;
  }
}
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
