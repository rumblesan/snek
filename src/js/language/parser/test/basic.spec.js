/* global describe, it */

import parser from '../index';

import {
  Program,
  Routing,
  Source,
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
          Source(
            BinaryOp('+', Source(Accessor('position', 'x')), Source(Num(1)))
          ),
          Func('osc', [Source(Num(10))])
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
          Source(Bus('position')),
          SubPatch(
            'in',
            Patch(Source(Accessor('in', 'x')), Func('osc', [Source(Num(10))]))
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
              Source(Accessor('position', 'x')),
              Func('rotate', [Source(Num(3))])
            ),
            Func('osc', [Source(Num(10))])
          ),
          Func('invert', [])
        ),
        Bus('speed')
      ),
    ]);

    assert.deepEqual(parsed, expected);
  });
});
