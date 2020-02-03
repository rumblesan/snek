import { Float } from '../types';
import { OperatorType } from '../typechecker';

export const glslOps = {
  '+': {
    inputType: Float(),
    leftType: Float(),
    rightType: Float(),
    outputType: Float(),
  },
  '-': {
    inputType: Float(),
    leftType: Float(),
    rightType: Float(),
    outputType: Float(),
  },
  '/': {
    inputType: Float(),
    leftType: Float(),
    rightType: Float(),
    outputType: Float(),
  },
  '*': {
    inputType: Float(),
    leftType: Float(),
    rightType: Float(),
    outputType: Float(),
  },
  '%': {
    inputType: Float(),
    leftType: Float(),
    rightType: Float(),
    outputType: Float(),
  },
};

export const opTypes = Object.keys(glslOps).map(op => {
  const info = glslOps[op];
  return OperatorType(
    op,
    info.inputType,
    info.leftType,
    info.rightType,
    info.outputType
  );
});
