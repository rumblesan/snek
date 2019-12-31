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
  Channel,
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
          BinaryOp('+', Channel('position', 'x'), Num(1)),
          Func('osc', [Signal(Num(10))])
        ),
        Bus('speed')
      ),
    ]);

    assert.deepEqual(parsed, expected);
  });

  it('parses a patch with a subpatch', function() {
    const program = dedent(`
                           position->(in => (in.x->osc(10)) + (in.y->osc(12))) >> out;
                           `);

    const parsed = parser.parse(program);

    const expected = Program([
      Routing(
        Patch(
          Bus('position'),
          SubPatch(
            'in',
            Signal(
              BinaryOp(
                '+',
                Patch(Channel('in', 'x'), Func('osc', [Signal(Num(10))])),
                Patch(Channel('in', 'y'), Func('osc', [Signal(Num(12))]))
              )
            )
          )
        ),
        Bus('out')
      ),
    ]);

    assert.deepEqual(parsed, expected);
  });
});
