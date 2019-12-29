export const glslFuncs = {
  osc: {
    type: 'src',
    inputs: [
      { name: 'frequency', type: 'float', default: 60.0 },
      { name: 'sync', type: 'float', default: 0.1 },
      { name: 'offset', type: 'float', default: 0.0 },
    ],
    glsl: `
          vec4 osc(vec2 _st, float freq, float sync, float offset){
            vec2 st = _st;
            float r = sin((st.x-offset/freq+u_time*sync)*freq)*0.5  + 0.5;
            float g = sin((st.x+u_time*sync)*freq)*0.5 + 0.5;
            float b = sin((st.x+offset/freq+u_time*sync)*freq)*0.5  + 0.5;
            return vec4(r, g, b, 1.0);
          }`,
  },
};
