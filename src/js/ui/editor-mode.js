/* global CodeMirror */

import { tokenIdentifiers } from '../language/parser/lexer';

CodeMirror.defineMode('snek', function() {
  var ERRORCLASS = 'error';

  function tokenise(stream /*, state*/) {
    for (let i = 0; i < tokenIdentifiers.length; i += 1) {
      const tid = tokenIdentifiers[i];
      if (stream.match(tid.regexp)) {
        console.log('matched', tid.name, tid.role);
        if (!tid.role) return null;

        if (Array.isArray(tid.role)) {
          return tid.role.join(' ');
        }

        return tid.role;
      }
    }
    stream.next();
    return ERRORCLASS;
  }

  var external = {
    token: tokenise,
  };
  return external;
});

CodeMirror.defineMIME('text/x-snek', 'snek');
