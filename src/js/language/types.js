export const FLOAT = 'FLOAT';
export const VEC = 'VEC';

export function Vector(count, dataType) {
  return {
    type: VEC,
    count,
    dataType,
  };
}
