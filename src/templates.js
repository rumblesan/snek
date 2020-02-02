import Handlebars from 'handlebars';

export const popupSurround = Handlebars.compile(`
  <h3>{{title}}</h3>
  <hr />
  <div class='content'>
  </div>
`);
