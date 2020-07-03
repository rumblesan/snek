/* global CodeMirror */

import { tokenIdentifiers } from '../language/parser/lexer';

CodeMirror.defineMode('snek', function() {
  const ERRORCLASS = 'error';

  const identifierRe = tokenIdentifiers.identifier.regexp;
  const numberRe = tokenIdentifiers.number.regexp;
  const operatorRe = tokenIdentifiers.operator.regexp;
  const commentRe = tokenIdentifiers.comment.regexp;

  const arrowRe = /^[-=>]>/;

  const globalBusses = ['position', 'time', 'out'];

  function tokenise(stream, state) {
    const ch = stream.peek();
    switch (ch) {
      case ';':
      case ',':
        stream.next();
        return 'atom';
      case '.':
        stream.next();
        return checkPeriod(stream, state);
      case '(':
      case ')':
      case '[':
      case ']':
        stream.next();
        return 'bracket';
      case '=':
        stream.next();
        return 'keyword';
      default:
      // fallthrough
    }

    if (stream.eatSpace()) {
      return null;
    }

    let match;
    if ((match = stream.match(identifierRe))) {
      return checkIdentifier(stream, state, match[0]);
    } else if (stream.match(numberRe)) {
      return 'number';
    } else if (stream.match(arrowRe)) {
      return 'operator';
    } else if (stream.match(operatorRe)) {
      return 'operator';
    } else if (stream.match(commentRe)) {
      return 'comment';
    }

    stream.next();
    return ERRORCLASS;
  }

  function checkIdentifier(stream, state, match) {
    if (state.parsingChannel) {
      state.parsingChannel = false;
      return 'attribute';
    }

    if (globalBusses.includes(match)) {
      return 'tag';
    }

    if (stream.peek() === '.') {
      return 'variable-2';
    }

    return 'variable';
  }

  function checkPeriod(stream, state) {
    state.parsingChannel = true;
    return 'operator';
  }

  return {
    startState: function() {
      return {
        parsingChannel: false,
      };
    },

    token: tokenise,
  };
});

CodeMirror.defineMIME('text/x-snek', 'snek');
