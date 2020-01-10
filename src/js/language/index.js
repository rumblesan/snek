import parser from './parser';
import { typeCheck } from './typechecker';
import { compile } from './compiler';

import { funcTypes, funcCompileTargets } from './builtins/functions';
import { opTypes } from './builtins/ops';
import { busTypes, busCompileTargets } from './builtins/busses';

export function codeToFrag(snekCode) {
  const errors = [];
  const parseResult = parser.parse(snekCode);
  parseResult.errors.forEach(errors.push);

  const typeCheckResult = typeCheck(
    parseResult.ast,
    busTypes,
    funcTypes,
    opTypes
  );
  typeCheckResult.errors.forEach(errors.push);
  const compileResult = compile(
    typeCheckResult.ast,
    busCompileTargets,
    funcCompileTargets
  );
  compileResult.errors.forEach(errors.push);
  return {
    code: compileResult.code,
    errors,
  };
}
