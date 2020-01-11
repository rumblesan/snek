import Parser from './parser';
import { typeCheck } from './typechecker';
import { compile } from './compiler';

import { funcTypes, funcCompileTargets } from './builtins/functions';
import { opTypes } from './builtins/ops';
import { busTypes, busCompileTargets } from './builtins/busses';

export function codeToFrag(snekCode) {
  const errors = [];
  const parser = new Parser();
  const parseResult = parser.parse(snekCode);
  parseResult.errors.forEach(err => errors.push(err));

  if (!parseResult.ast) {
    return { errors };
  }

  const typeCheckResult = typeCheck(
    parseResult.ast,
    busTypes,
    funcTypes,
    opTypes
  );
  typeCheckResult.errors.forEach(err => errors.push(err));
  if (!typeCheckResult.ast) {
    return { errors };
  }

  const compileResult = compile(
    typeCheckResult.ast,
    busCompileTargets,
    funcCompileTargets
  );
  compileResult.errors.forEach(err => errors.push(err));
  return {
    code: compileResult.code,
    errors,
  };
}

export function lint(code) {
  console.log('linting');
  return codeToFrag(code);
}
