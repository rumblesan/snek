/* global describe, it */

import parser from '../index';

import {
  Program,
  Routing,
  Signal,
  Patch,
  Func,
  SubPatch,
  BinaryOp,
  Num,
  Accessor,
  Bus,
} from '../../ast';

import { dedent } from 'dentist';

import assert from 'assert';

describe('Parser', function() {
  it('parses a simple patch', function() {
    const program = dedent(`
                           position.x + 1 -> osc(10) >> speed;
                           `);

    const parsed = parser.parse(program);

    const expected = Program([
      Routing(
        Patch(
          Signal(
            BinaryOp('+', Signal(Accessor('position', 'x')), Signal(Num(1)))
          ),
          Func('osc', [Signal(Num(10))])
        ),
        Bus('speed')
      ),
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('parses a patch with a subpatch', function() {
    const program = dedent(`
                           position->(in => in.x->osc(10)) >> out;
                           `);

    const parsed = parser.parse(program);

    const expected = Program([
      Routing(
        Patch(
          Signal(Bus('position')),
          SubPatch(
            'in',
            Patch(Signal(Accessor('in', 'x')), Func('osc', [Signal(Num(10))]))
          )
        ),
        Bus('out')
      ),
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('parses a chain of functions', function() {
    const program = dedent(`
                           position.x -> rotate(3) -> osc(10) -> invert() >> speed;
                           `);

    const parsed = parser.parse(program);

    const expected = Program([
      Routing(
        Patch(
          Patch(
            Patch(
              Signal(Accessor('position', 'x')),
              Func('rotate', [Signal(Num(3))])
            ),
            Func('osc', [Signal(Num(10))])
          ),
          Func('invert', [])
        ),
        Bus('speed')
      ),
    ]);

    assert.deepEqual(parsed, expected);
  });
});
