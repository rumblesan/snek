import { typeToString } from '../types';

export class TypeCheckerException extends Error {
  constructor(message) {
    super(message);
  }
}

export class IncorrectPatchTypeException extends TypeCheckerException {
  constructor(func, inputAst, funcAst) {
    const msg = `Function ${func.name} expected a ${typeToString(
      func.inputType
    )} input but received ${typeToString(inputAst.type)}`;
    super(msg);
    this.name = 'UnexpectedTypeException';
    this.displayable = true;
    this.line = funcAst.line;
    this.character = funcAst.character;
    this.length = func.name.length;
  }
}

export class InvalidAccessorException extends TypeCheckerException {
  constructor(message, accessorAst) {
    super(message);
    this.name = 'InvalidAccessorException';
    this.displayable = true;
    this.line = accessorAst.line;
    this.character = accessorAst.character;
    this.length = 1;
  }
}

export class InvalidBusException extends TypeCheckerException {
  constructor(ast) {
    const message = `Bus ${ast.name} is invalid`;
    super(message);
    this.name = 'InvalidBusException';
    this.displayable = true;
    this.line = ast.line;
    this.character = ast.character;
    this.length = ast.name.length;
  }
}

export class UnexpectedTypeException extends TypeCheckerException {
  constructor(expected, ast) {
    const msg = `Found ${ast.node} with type ${typeToString(
      ast.type
    )} but expected ${typeToString(expected)}`;
    super(msg);
    this.name = 'UnexpectedTypeException';
    this.displayable = true;
    this.line = ast.line;
    this.character = ast.character;
    this.length = 1;
  }
}
