import { ParserException } from 'canto34';

import * as ast from '../ast';

export default class ArithmaticShunter {
  constructor() {
    this.operatorStack = [];
    this.output = [];
    this.precedences = {
      '^': 15,
      '*': 14,
      '/': 14,
      '%': 14,
      '+': 13,
      '-': 13,
      '<': 11,
      '<=': 11,
      '>': 11,
      '>=': 11,
      '==': 10,
      '!=': 10,
      '&&': 6,
      '||': 5,
    };
  }
  shuntValue(value) {
    this.output.push(value);
  }
  collapseOp(operator, opts) {
    const position = opts.positions
      ? { line: operator.line, character: operator.character }
      : {};
    const v2 = this.output.pop();
    const v1 = this.output.pop();
    const expr = ast.BinaryOp(operator.content, v1, v2, undefined, position);
    this.output.push(expr);
  }
  shuntOp(newOp) {
    const opSymbol = newOp.content;
    if (!this.precedences[opSymbol]) {
      throw new ParserException(`${opSymbol} is not a valid operator`);
    }
    const peekOp = this.operatorStack[this.operatorStack.length - 1];
    if (this.precedences[opSymbol] <= this.precedences[peekOp]) {
      const topOp = this.operatorStack.pop();
      this.collapseOp(topOp);
    }
    this.operatorStack.push(newOp);
  }
  getOutput(opts) {
    while (this.operatorStack.length > 0) {
      this.collapseOp(this.operatorStack.pop(), opts);
    }
    if (this.output.length !== 1) {
      throw new ParserException(
        'Should only be a single expression in shunter output'
      );
    }
    return this.output.pop();
  }
}
