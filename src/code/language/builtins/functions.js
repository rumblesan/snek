import { dedent } from 'dentist';

import { isGeneric, Generic, Input, Vector, Float } from '../types';
import { FunctionType } from '../typechecker';
import { BuiltInFunction } from '../compiler';

import { Source, Bus, Num } from '../ast';

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
  repeat: {
    inputType: Vector(2, Float()),
    args: [
      { name: 'repeatX', type: Float(), default: Source(Num(3.0)) },
      { name: 'repeatY', type: Float(), default: Source(Num(3.0)) },
      { name: 'offsetX', type: Float(), default: Source(Num(0.0)) },
      { name: 'offsetY', type: Float(), default: Source(Num(0.0)) },
    ],
    returnType: Vector(2, Float()),
    code: {
      default: dedent(`
        vec2 repeat(vec2 _st, float repeatX, float repeatY, float offsetX, float offsetY){
          vec2 st = _st * vec2(repeatX, repeatY);
          st.x += step(1., mod(st.y,2.0)) * offsetX;
          st.y += step(1., mod(st.x,2.0)) * offsetY;
          return fract(st);
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
  rotate: {
    inputType: Vector(2, Float()),
    args: [{ name: 'angle', type: Float(), default: Source(Bus('time')) }],
    returnType: Vector(2, Float()),
    code: {
      default: dedent(`
        vec2 rotate(vec2 st, float angle){
          vec2 xy = st - vec2(0.5);
          xy = mat2(cos(angle),-sin(angle), sin(angle),cos(angle)) * xy;
          xy += 0.5;
          return xy;
        }`),
    },
  },
  modulate: {
    inputType: Vector(2, Float()),
    args: [
      { name: 'modulator', type: Vector(2, Float()) },
      { name: 'amount', type: Float(), default: Source(Num(0.1)) },
    ],
    returnType: Vector(2, Float()),
    code: {
      default: dedent(`
        vec2 modulate(vec2 st, vec2 c1, float amount){
          return st + c1*amount;
        }`),
    },
  },
  pixelate: {
    inputType: Vector(2, Float()),
    args: [
      { name: 'pixelX', type: Float(), default: Source(Num(20)) },
      { name: 'pixelY', type: Float(), default: Source(Num(20)) },
    ],
    returnType: Vector(2, Float()),
    code: {
      default: dedent(
        `vec2 pixelate(vec2 st, float pixelX, float pixelY){
          vec2 xy = vec2(pixelX, pixelY);
          return (floor(st * xy) + 0.5)/xy;
        }`
      ),
    },
  },
  posterize: {
    inputType: Vector(4, Float()),
    args: [
      { name: 'bins', type: Float(), default: Source(Num(3.0)) },
      { name: 'gamma', type: Float(), default: Source(Num(0.6)) },
    ],
    returnType: Vector(4, Float()),
    code: {
      default: dedent(`
        vec4 posterize(vec4 c, float bins, float gamma){
          vec4 c2 = pow(c, vec4(gamma));
          c2 *= vec4(bins);
          c2 = floor(c2);
          c2/= vec4(bins);
          c2 = pow(c2, vec4(1.0/gamma));
          return vec4(c2.xyz, c.a);
        }`),
    },
  },
  shift: {
    inputType: Vector(4, Float()),
    args: [
      { name: 'r', type: Float(), default: Source(Num(0.5)) },
      { name: 'g', type: Float(), default: Source(Num(0.0)) },
      { name: 'b', type: Float(), default: Source(Num(0.0)) },
      { name: 'a', type: Float(), default: Source(Num(0.0)) },
    ],
    returnType: Vector(4, Float()),
    code: {
      default: dedent(`
        vec4 shift(vec4 c, float r, float g, float b, float a){
          vec4 c2 = vec4(c);
          c2.r = fract(c2.r + r);
          c2.g = fract(c2.g + g);
          c2.b = fract(c2.b + b);
          c2.a = fract(c2.a + a);
          return vec4(c2.rgba);
        }`),
    },
  },
};

export const funcTypes = Object.keys(glslFuncs).map((name) => {
  const info = glslFuncs[name];
  return FunctionType(
    name,
    info.inputType,
    info.args.map((a) => a.type),
    info.returnType
  );
});

export const funcCompileTargets = Object.keys(glslFuncs).map((name) => {
  const info = glslFuncs[name];
  return BuiltInFunction(
    name,
    info.args.map((a) => a.default),
    isGeneric(info.inputType),
    info.code
  );
});
