import { Vector, Float } from '../types';
import { BusType } from '../typechecker';
import { BuiltInBus } from '../compiler';

export const glslBusses = {
  position: {
    type: Vector(2, Float()),
    channels: ['x', 'y'],
    direction: 'input',
    glslName: 'position',
    glslType: 'varying',
  },
  out: {
    type: Vector(4, Float()),
    channels: ['x', 'y', 'z', 'w'],
    direction: 'output',
    glslName: 'gl_FragColor',
    glslType: '',
  },
  time: {
    type: Float(),
    channels: [],
    direction: 'input',
    glslName: 'u_time',
    glslType: 'uniform',
  },
};

export const busTypes = Object.keys(glslBusses).map(name => {
  const info = glslBusses[name];
  return BusType(name, info.type, info.channels);
});

export const busCompileTargets = Object.keys(glslBusses).map(name => {
  const info = glslBusses[name];
  return BuiltInBus(
    name,
    info.direction,
    info.type,
    info.glslName,
    info.glslType
  );
});
