import parser from './parser';
import { typeCheck } from './typechecker';
import { compile } from './compiler';

import { funcTypes, funcCompileTargets } from './builtins/functions';
import { opTypes } from './builtins/ops';
import { busTypes, busCompileTargets } from './builtins/busses';

export function codeToFrag(snekCode) {
  const ast = parser.parse(snekCode);

  typeCheck(ast, busTypes, funcTypes, opTypes);
  return compile(ast, busCompileTargets, funcCompileTargets);
}
