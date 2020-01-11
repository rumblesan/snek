/* global CodeMirror */

CodeMirror.defineMode('snek', function() {
  var ERRORCLASS = 'error';

  function wordRegexp(words) {
    return new RegExp('^((' + words.join(')|(') + '))\\b');
  }
  var singleOperators = new RegExp('^[\\+\\-\\*/%|\\^]');
  var singleDelimiters = new RegExp('^[\\(\\)\\[\\]\\{\\},;\\.]');
  var doubleOperators = new RegExp('^((->)|(=>)|(>>))');
  var identifiers = new RegExp('^[_A-Za-z][_A-Za-z0-9]*');

  var commonConstants = ['pi'];
  var constants = wordRegexp(commonConstants);

  function tokenBase(stream, state) {
    if (stream.sol()) {
      if (stream.eatSpace()) {
        var lineOffset = stream.indentation();
        if (lineOffset > state.indentation) {
          return 'indent';
        } else if (lineOffset < state.indentation) {
          return 'dedent';
        }
        return null;
      } else {
        if (state.indentation > 0) {
          return 'undent';
        }
      }
    }

    if (stream.eatSpace()) {
      return null;
    }

    var ch = stream.peek();

    if (ch === '/') {
      if (stream.match(/\/\//)) {
        stream.skipToEnd();
        return 'comment';
      }
    }

    // Handle number literals
    if (stream.match(/^-?[0-9.]/, false)) {
      // Floats
      if (stream.match(/^-?\d*\.\d+(e[+-]?\d+)?/i)) {
        return 'number';
      }
      if (stream.match(/^-?\d+\.\d*/)) {
        return 'number';
      }
      if (stream.match(/^-?\.\d+/)) {
        return 'number';
      }
      // Integers
      // Hex
      if (stream.match(/^-?0x[0-9a-f]+/i)) {
        return 'number';
      }
      // Decimal
      if (stream.match(/^-?[1-9]\d*(e[+-]?\d+)?/)) {
        return 'number';
      }
      // Zero by itself with no other piece of number.
      if (stream.match(/^-?0(?![\dx])/i)) {
        return 'number';
      }
    }

    // Handle operators and delimiters
    if (stream.match(doubleOperators) || stream.match(singleOperators)) {
      return 'operator';
    }
    if (stream.match(singleDelimiters)) {
      return 'punctuation';
    }

    if (stream.match(constants)) {
      return 'atom';
    }

    if (stream.match(identifiers)) {
      return 'variable';
    }

    // Handle non-detected items
    stream.next();
    return ERRORCLASS;
  }

  function tokenLexer(stream, state) {
    var style = state.tokenize(stream, state);
    return style;
  }

  var external = {
    startState: function() {
      return {
        tokenize: tokenBase,
        indentation: 0,
      };
    },

    token: tokenLexer,
  };
  return external;
});

CodeMirror.defineMIME('text/x-livecodelang', 'livecodelang');
