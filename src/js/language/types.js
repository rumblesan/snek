export const FLOAT = 'FLOAT';
export const VEC = 'VEC';
export const INPUT = 'INPUT';
export const GENERIC = 'GENERIC';

export function Generic() {
  return {
    type: GENERIC,
  };
}

export function Float() {
  return {
    type: FLOAT,
  };
}

export function Vector(count, dataType) {
  return {
    type: VEC,
    count,
    dataType,
  };
}

export function Input() {
  return {
    type: INPUT,
  };
}

export function typesMatch(target, value) {
  switch (target.type) {
    case GENERIC:
      return true;
    case FLOAT:
      return value.type === FLOAT;
    case VEC:
      if (value.type === VEC) {
        return value.count === target.count;
      }
      return false;
  }
}

export function typeToString(type) {
  switch (type.type) {
    case GENERIC:
      return 'generic';
    case FLOAT:
      return 'float';
    case VEC:
      return `vec${type.count}`;
  }
}

export function busTypeChannels(type) {
  const channels = [];
  const available = ['x', 'y', 'z', 'w'];
  switch (type.type) {
    case FLOAT:
      channels.push('x');
      break;
    case VEC:
      for (let i = 0; i < type.count; i += 1) {
        channels.push(available[i]);
      }
      break;
  }
  return channels;
}

const channelNumbers = {
  x: 0,
  r: 0,
  y: 1,
  g: 1,
  z: 2,
  b: 2,
  w: 3,
  a: 3,
};

export function validChannelsForSource(channels, busType) {
  if (busType.type === GENERIC || busType.type === FLOAT) {
    return false;
  }
  return channels.every(c => channelNumbers[c] <= busType.count - 1);
}

export function isGeneric(type) {
  return type.type === GENERIC;
}
