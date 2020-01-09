/* global describe, it */

import parser from '../../parser';

import {
  Program,
  Routing,
  Source,
  Patch,
  Func,
  BinaryOp,
  Num,
  Accessor,
  Bus,
} from '../../ast';

import { typeCheck, BusType, FunctionType, OperatorType } from '../index';
import { Float, Generic, Input, Vector } from '../../types';

import { dedent } from 'dentist';

import assert from 'assert';

describe('Type Checker', function() {
  it('typechecks a simple patch', function() {
    const program = dedent(`
                           position.x + 1 -> osc(10) >> speed;
                           `);

    const parsed = parser.parse(program);
    const busTypes = [BusType('position', Vector(2, Float()), ['x', 'y'])];
    const functionTypes = [FunctionType('osc', Float(), [Float()], Float())];
    const opTypes = [OperatorType('+', Float(), Float(), Float(), Float())];
    typeCheck(parsed, busTypes, functionTypes, opTypes);

    const expected = Program([
      Routing(
        Patch(
          Source(
            BinaryOp(
              '+',
              Source(Accessor('position', 'x', Float()), Float()),
              Source(Num(1, Float()), Float()),
              Float()
            ),
            Float()
          ),
          Func('osc', [Source(Num(10, Float()), Float())], Float()),
          Float()
        ),
        Bus('speed', Float())
      ),
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('type checks a chain of functions', function() {
    const program = dedent(`
                           position.x -> osc(10) -> invert() -> modulate(position.y -> osc(1)) >> out;
                           `);

    const parsed = parser.parse(program);
    const busTypes = [BusType('position', Vector(2, Float()), ['x', 'y'])];
    const functionTypes = [
      FunctionType('osc', Float(), [Float()], Vector(4, Float())),
      FunctionType('invert', Vector(4, Float()), [], Vector(4, Float())),
      FunctionType(
        'modulate',
        Vector(4, Float()),
        [Vector(4, Float())],
        Vector(4, Float())
      ),
    ];
    const opTypes = [];
    typeCheck(parsed, busTypes, functionTypes, opTypes);

    const expected = Program([
      Routing(
        Patch(
          Patch(
            Patch(
              Source(Accessor('position', 'x', Float()), Float()),
              Func(
                'osc',
                [Source(Num(10, Float()), Float())],
                Vector(4, Float())
              ),
              Vector(4, Float())
            ),
            Func('invert', [], Vector(4, Float())),
            Vector(4, Float())
          ),
          Func(
            'modulate',
            [
              Patch(
                Source(Accessor('position', 'y', Float()), Float()),
                Func(
                  'osc',
                  [Source(Num(1, Float()), Float())],
                  Vector(4, Float())
                ),
                Vector(4, Float())
              ),
            ],
            Vector(4, Float())
          ),
          Vector(4, Float())
        ),
        Bus('out', Vector(4, Float()))
      ),
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('typechecks a generic function', function() {
    const program = dedent(`
                           position.x -> osc(10) -> invert() >> speed;
                           `);

    const parsed = parser.parse(program);
    const busTypes = [BusType('position', Vector(2, Float()), ['x', 'y'])];
    const functionTypes = [
      FunctionType('osc', Float(), [Float()], Vector(4, Float())),
      FunctionType('invert', Generic(), [], Input()),
    ];
    const opTypes = [];
    typeCheck(parsed, busTypes, functionTypes, opTypes);

    const expected = Program([
      Routing(
        Patch(
          Patch(
            Source(Accessor('position', 'x', Float()), Float()),
            Func(
              'osc',
              [Source(Num(10, Float()), Float())],
              Vector(4, Float())
            ),
            Vector(4, Float())
          ),
          Func('invert', [], Vector(4, Float())),
          Vector(4, Float())
        ),
        Bus('speed', Vector(4, Float()))
      ),
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('typechecks an internal bus', function() {
    const program = dedent(`
                           position.x -> osc(10) >> foo;
                           foo.w -> osc(2) >> out;
                           `);

    const parsed = parser.parse(program);
    const busTypes = [BusType('position', Vector(2, Float()), ['x', 'y'])];
    const functionTypes = [
      FunctionType('osc', Float(), [Float()], Vector(4, Float())),
    ];
    const opTypes = [];
    typeCheck(parsed, busTypes, functionTypes, opTypes);

    const expected = Program([
      Routing(
        Patch(
          Source(Accessor('position', 'x', Float()), Float()),
          Func('osc', [Source(Num(10, Float()), Float())], Vector(4, Float())),
          Vector(4, Float())
        ),
        Bus('foo', Vector(4, Float()))
      ),
      Routing(
        Patch(
          Source(Accessor('foo', 'w', Float()), Float()),
          Func('osc', [Source(Num(2, Float()), Float())], Vector(4, Float())),
          Vector(4, Float())
        ),
        Bus('out', Vector(4, Float()))
      ),
    ]);

    assert.deepEqual(parsed, expected);
  });
});
