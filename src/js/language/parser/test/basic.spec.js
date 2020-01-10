/* global describe, it */

import Parser from '../index';

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

    const parser = new Parser({ testing: true });
    const { ast, errors } = parser.parse(program);

    const expected = Program([
      Routing(
        Patch(
          Source(
            BinaryOp(
              '+',
              Source(Accessor(Bus('position'), ['x'])),
              Source(Num(1))
            )
          ),
          Func('osc', [Source(Num(10))])
        ),
        Bus('speed')
      ),
    ]);

    assert.deepEqual(errors, []);
    assert.deepEqual(ast, expected);
  });

  it('parses a patch with a subpatch', function() {
    const program = dedent(`
                           position->(in => in.x->osc(10)) >> out;
                           `);

    const parser = new Parser({ testing: true });
    const { ast, errors } = parser.parse(program);

    const expected = Program([
      Routing(
        Patch(
          Source(Bus('position')),
          SubPatch(
            'in',
            Patch(
              Source(Accessor(Bus('in'), ['x'])),
              Func('osc', [Source(Num(10))])
            )
          )
        ),
        Bus('out')
      ),
    ]);

    assert.deepEqual(errors, []);
    assert.deepEqual(ast, expected);
  });

  it('parses a chain of functions', function() {
    const program = dedent(`
                           position.x -> rotate(3) -> osc(10) -> invert() >> speed;
                           `);

    const parser = new Parser({ testing: true });
    const { ast, errors } = parser.parse(program);

    const expected = Program([
      Routing(
        Patch(
          Patch(
            Patch(
              Source(Accessor(Bus('position'), ['x'])),
              Func('rotate', [Source(Num(3))])
            ),
            Func('osc', [Source(Num(10))])
          ),
          Func('invert', [])
        ),
        Bus('speed')
      ),
    ]);

    assert.deepEqual(errors, []);
    assert.deepEqual(ast, expected);
  });
});
