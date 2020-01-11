# Snek

An experiment in creating a custom language for hydra-like visual live-coding.


## Description

This is really more a research and learning project than a performance tool. Mostly I just want to play around with how live-coding languages can be built, improved made more interactive, and more user-friendly.

The aesthetic of this is heavily [hydra](https://hydra-editor.glitch.me/) influenced. I felt that the signal chaining style of it would fit well for a small DSL and the data types involved are few and simple enough that I could build a basic type checker as well.

If you're after something for performing, or experimenting with graphics then I recommend you go use hydra. If you're interested in language design and how live-coders use tools then get in touch.


## Language

The [Language](docs/language.md) document should hopefully detail everything, though it's liable to be out of date as I hack on things.


## Technical Details

Under the hood, snek is really just taking the input code and turning it into a GLSL fragment shader. There are pre-built functions for most of the transformations which are included in the shader if used.


## Credits

Some bits of code pulled from [hydra-synth](https://github.com/ojack/hydra-synth).
The [Virgil](https://github.com/rumblesan/virgil) parsing library is based on [Canto34](https://github.com/stevecooperorg/canto34).


## Contact

Drop me an email at guy@rumblesan.com


## License

BSD License.
