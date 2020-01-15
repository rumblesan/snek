import { codeToFrag, lint } from './js/language';
import { defaultVertexShader } from './js/glsl';

export default class Snek {
  constructor(config, regl, CodeMirror) {
    this.draw = null;
    this.regl = regl;

    this.editor = CodeMirror.fromTextArea(document.getElementById('code'), {
      keyMap: config.keyMap,
      lineNumbers: config.lineNumbers,
      theme: config.theme,
      mode: 'snek',
      autofocus: true,
      gutters: ['CodeMirror-lint-markers'],
      lint: {
        getAnnotations: text => {
          const { errors } = lint(text);

          return errors.map(err => ({
            from: CodeMirror.Pos(err.line - 1, err.character - 1),
            to: CodeMirror.Pos(err.line - 1, err.character - 1 + err.length),
            message: err.message,
            severity: 'error',
          }));
        },
      },
      extraKeys: {
        'Ctrl-Enter': () => this.evaluate(),
      },
    });
  }

  setProgram(program) {
    this.editor.setValue(program);
  }

  evaluate() {
    const program = this.editor.getValue();
    const result = codeToFrag(program);
    if (result.errors.length < 1) {
      this.updateDraw(result.code);
    } else {
      console.log('errors', result.errors);
    }
  }

  updateDraw(fragShader) {
    this.draw = this.regl({
      frag: fragShader,

      vert: defaultVertexShader,

      attributes: {
        a_position: [-2, 0, 0, -2, 2, 2],
      },

      uniforms: {
        u_time: args => 0.01 * args.tick,
      },

      count: 3,
    });
  }

  start() {
    this.regl.frame(() => {
      this.regl.clear({
        color: [0, 0, 0, 1],
      });

      if (this.draw !== null) {
        this.draw();
      }
    });
  }
}
