import Handlebars from 'handlebars';

export const popupSurround = Handlebars.compile(`
  <h3>{{title}}</h3>
  <hr />
  <div class='content'>
  </div>
`);

export const glslDisplay = Handlebars.compile(`
  <div class='title'>
    <h3>Currently Running GLSL</h3>
    <button id='popup-close' class='close'>Close</button>
  </div>
  <hr />
  <div class='content'>
    <pre>{{frag}}</pre>
    <pre>{{vert}}</pre>
  </div>
`);
