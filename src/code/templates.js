import Handlebars from 'handlebars';

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

export const settingsDisplay = Handlebars.compile(`
  <div class='title'>
    <h3>Settings</h3>
    <button id='popup-close' class='close'>Close</button>
  </div>
  <hr />
  <div class='content'>

    <section>
      <p>
        All of the settings in Snek can be changed by setting query string arguments in the URL of the page.
      </p>
    </section>

    <section>
      <h4>Key Map</h4>
      <p>The editor keymapping can be changed with the <em>keymap</em> query argument. Currently the supported bindings are the CodeMirror defaults and Vim bindings</p>
      <ul>
        <li><a href="{{defaultKeymapURL}}">Default Keymap</a></li>
        <li><a href="{{vimKeymapURL}}">Vim Keymap</a></li>
      </ul>
    </section>

    <section>
      <h4>Performance Mode</h4>
      <p>Enabling performance mode will hide the header bar so that there can be more canvas visible</p>
      <ul>
        <li><a href="{{performanceEnabledURL}}">Enable Performance Mode</a></li>
        <li><a href="{{performanceDisabledURL}}">Disable Performance Mode</a></li>
      </ul>
    </section>

    <section>
      <h4>Line Numbers</h4>
      <p>Line numbers can be added to the editor with the <em>linenumbers</em> query argument.</p>
      <ul>
        <li><a href="{{lineNumbersEnabledURL}}">Enable Line Numbers</a></li>
        <li><a href="{{lineNumbersDisabledURL}}">Disable Line Numbers</a></li>
      </ul>
    </section>

  </div>
`);
