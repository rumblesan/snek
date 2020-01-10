/* global describe, it */

import { compile, BuiltInBus, BuiltInFunction } from '../../compiler';
import parser from '../../parser';

import {
  typeCheck,
  BusType,
  FunctionType,
  OperatorType,
} from '../../typechecker';
import { Float, Vector } from '../../types';

import { dedent } from 'dentist';

import assert from 'assert';

describe('Compiler', function() {
  it('compiles a simple patch', function() {
    const program = dedent(`
                           position.x + 1 -> osc(10).w -> osc(4) >> out;
                           `);

    const { ast } = parser.parse(program);
    const busTypes = [BusType('position', Vector(2, Float()), ['x', 'y'])];
    const functionTypes = [
      FunctionType('osc', Float(), [Float()], Vector(4, Float())),
    ];
    const opTypes = [OperatorType('+', Float(), Float(), Float())];
    typeCheck(ast, busTypes, functionTypes, opTypes);

    const bibs = [
      BuiltInBus('out', 'output', Vector(4, Float()), 'gl_FragColor', ''),
      BuiltInBus(
        'position',
        'input',
        Vector(2, Float()),
        'position',
        'varying'
      ),
    ];
    const bifs = [BuiltInFunction('osc', [], false, { default: 'test' })];

    const result = compile(ast, bibs, bifs);

    const expected = dedent(`
    precision mediump float;

    varying vec2 position;

    test

    void main() {
      gl_FragColor = osc(osc(position.x + 1.0, 10.0).w, 4.0);
    }
    `);

    assert.deepEqual(result.code, expected);
  });
});
