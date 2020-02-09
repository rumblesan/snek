import { codeToFrag, lint } from './language';
import { defaultVertexShader } from './glsl';

export class Snek {
  constructor(config, eventBus, regl, CodeMirror) {
    this.config = config;
    this.draw = null;
    this.regl = regl;
    this.eventBus = eventBus;
    this.currentGLSL = {
      frag: '',
      vert: '',
    };

    this.editor = CodeMirror(
      el => {
        document.querySelector('body').appendChild(el);
      },
      {
        keyMap: config.keyMap,
        lineNumbers: config.lineNumbers,
        theme: config.theme,
        value: config.program,
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
      }
    );
    this.evaluate();

    this.eventBus.on('evaluate', () => this.evaluate());

    this.regl.frame(() => {
      this.regl.clear({
        color: [0, 0, 0, 1],
      });

      this.draw();
    });
  }

  getProgram() {
    return this.editor.getValue();
  }

  getGLSL() {
    return this.currentGLSL;
  }

  evaluate() {
    try {
      const program = this.editor.getValue();
      const result = codeToFrag(program);
      if (result.errors.length < 1) {
        this.eventBus.emit('clear-error');
        this.updateDraw(result.code);
      } else {
        const errCount = result.errors.length;
        const msg = errCount === 1 ? '1 Error!' : `${errCount} Errors!`;
        this.eventBus.emit('display-error', new Error(msg));
      }
    } catch (err) {
      this.eventBus.emit('display-error', err);
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
    this.currentGLSL = {
      vert: defaultVertexShader,
      frag: fragShader,
    };
  }
}
