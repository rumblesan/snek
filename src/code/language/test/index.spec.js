/* global describe, it */

import { codeToFrag } from '../index';
import { glslFuncs } from '../builtins/functions';

import { dedent } from 'dentist';

import assert from 'assert';

describe('Language', function () {
  it('compiles a simple patch to a fragment shader', function () {
    const program = dedent(`
                           position.x + 1 -> osc(10) >> out;
                           `);

    const result = codeToFrag(program);

    const expected = dedent(`
precision mediump float;

varying vec2 position;
uniform float u_time;

${glslFuncs.osc.code.default}

void main() {
  gl_FragColor = osc(position.x + 1.0, 10.0, 0.1, 0.0);
}
`);

    assert.deepEqual(result.code, expected);
  });

  it('compiles a patch with generic functions', function () {
    const program = dedent(`
                           position.x -> osc(10) -> mult(0.3) >> out;
                           `);

    const result = codeToFrag(program);

    const expected = dedent(`
precision mediump float;

varying vec2 position;
uniform float u_time;

${glslFuncs.osc.code.default}
${glslFuncs.mult.code.vec4}

void main() {
  gl_FragColor = multvec4(osc(position.x, 10.0, 0.1, 0.0), 0.3);
}
`);

    assert.deepEqual(result.code, expected);
  });

  it('compiles a patch with multi channel accessors', function () {
    const program = dedent(`
                           position.yx -> rotate(10, position.y->osc(1).r).y -> osc(4) >> out;
                           `);

    const result = codeToFrag(program);

    const expected = dedent(`
precision mediump float;

varying vec2 position;
uniform float u_time;

${glslFuncs.rotate.code.default}
${glslFuncs.osc.code.default}

void main() {
  gl_FragColor = osc(rotate(position.yx, 10.0, osc(position.y, 1.0, 0.1, 0.0).x).y, 4.0, 0.1, 0.0);
}
`);

    assert.deepEqual(result.code, expected);
  });
});
