# Snek

Snek is an experiment in building live-coding languages.

It's really more a research and learning project than a performance tool. Mostly the aim is to play around with how languages can be built, improved, made more interactive, and more user-friendly.

The aesthetic is heavily [hydra](https://hydra-editor.glitch.me/) influenced. Primarily because it seemed that the signal chaining style of it would fit well for a small DSL and the data types involved are few and simple enough that it would be easy to build a basic type checker as well.

* If you're after something for performing, or experimenting with these kinds of visuals then you're probably better off using hydra.
* If you want to use any of the ideas, concepts, features or pieces of code in the project then by all means do.
* If you're interested in language design and how live-coders use tools then please get in touch.

## Language

The [Language](docs/language) document should hopefully detail everything, though it's liable to be out of date as I hack on things.


## Technical Details

Under the hood, snek is really just taking the input code and turning it into a GLSL fragment shader. There are pre-built functions for most of the transformations which are included in the shader if used.


## Credits

Some bits of code pulled from [hydra-synth](https://github.com/ojack/hydra-synth).
The [Virgil](https://github.com/rumblesan/virgil) parsing library is based on [Canto34](https://github.com/stevecooperorg/canto34).


## Contact

Drop me an email at guy@rumblesan.com


## License

BSD License.
