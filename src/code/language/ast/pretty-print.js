import { SOURCE, NUM, CHANNEL, BUS } from './nodes';

export function prettyPrint(ast) {
  switch (ast.node) {
    case SOURCE:
      return `${prettyPrint(ast.source)} ->`;
    case NUM:
      return `${ast.value}`;
    case CHANNEL:
      return `${ast.name}`;
    case BUS:
      return `${ast.name}`;
    default:
      return 'unknown';
  }
}
