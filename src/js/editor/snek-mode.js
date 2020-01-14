/* global CodeMirror */

import { tokenIdentifiers } from '../language/parser/lexer';

CodeMirror.defineMode('snek', function() {
  const ERRORCLASS = 'error';

  const globalBusses = ['position', 'time', 'out'];
  function tokenise(stream, state) {
    for (let i = 0; i < tokenIdentifiers.length; i += 1) {
      const tid = tokenIdentifiers[i];
      const match = stream.match(tid.regexp);
      if (match) {
        switch (tid.name) {
          case 'identifier':
            return checkIdentifier(stream, state, tid, match[0]);
          case 'period':
            return checkPeriod(stream, state, tid, match[0]);
          default:
            return tokenToType(tid, match[0]);
        }
      }
    }
    stream.next();
    return ERRORCLASS;
  }

  function checkIdentifier(stream, state, tid, match) {
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

    return tokenToType(tid);
  }

  function checkPeriod(stream, state) {
    state.parsingChannel = true;
    return 'operator';
  }

  function tokenToType(tid) {
    if (!tid.role) return null;

    if (Array.isArray(tid.role)) {
      return tid.role.join(' ');
    }

    return tid.role;
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
