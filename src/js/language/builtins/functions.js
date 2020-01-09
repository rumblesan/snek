import { dedent } from 'dentist';

import { isGeneric, Generic, Input, Vector, Float } from '../types';
import { FunctionType } from '../typechecker';
import { BuiltInFunction } from '../compiler';

import { Source, Num } from '../ast';

export const glslFuncs = {
  osc: {
    inputType: Float(),
    args: [
      { name: 'frequency', type: Float(), default: Source(Num(60.0)) },
      { name: 'sync', type: Float(), default: Source(Num(0.1)) },
      { name: 'offset', type: Float(), default: Source(Num(0.0)) },
    ],
    returnType: Vector(4, Float()),
    code: {
      default: dedent(`
            vec4 osc(float x, float freq, float sync, float offset){
              float r = sin((x-offset/freq+u_time*sync)*freq)*0.5  + 0.5;
              float g = sin((x+u_time*sync)*freq)*0.5 + 0.5;
              float b = sin((x+offset/freq+u_time*sync)*freq)*0.5  + 0.5;
              return vec4(r, g, b, 1.0);
            }`),
    },
  },
  mult: {
    inputType: Generic(),
    args: [{ name: 'mult', type: Float(), default: Source(Num(1.0)) }],
    returnType: Input(),
    code: {
      float: dedent(`
          float multfloat(float signal, float multiplier){
            return signal * multiplier;
          }`),
      vec2: dedent(`
          vec2 multvec2(vec2 signal, float multiplier){
            return signal * multiplier;
          }`),
      vec3: dedent(`
          vec3 multvec3(vec3 signal, float multiplier){
            return signal * multiplier;
          }`),
      vec4: dedent(`
          vec4 multvec4(vec4 signal, float multiplier){
            return signal * multiplier;
          }`),
    },
  },
};

export const funcTypes = Object.keys(glslFuncs).map(name => {
  const info = glslFuncs[name];
  return FunctionType(
    name,
    info.inputType,
    info.args.map(a => a.type),
    info.returnType
  );
});

export const funcCompileTargets = Object.keys(glslFuncs).map(name => {
  const info = glslFuncs[name];
  return BuiltInFunction(
    name,
    info.args.map(a => a.default),
    isGeneric(info.inputType),
    info.code
  );
});
