---
layout: base.njk
---

# Todo

## SubPatches

The parser has support for _SubPatches_ though the type checker currently doesn't.

```snek
position->(in => in.x->osc(10)) >> out;
```

It's not really clear wether these are likely to be useful though.

## Custom GLSL Functions

It would be good to be able to define custom functions and provide them with GLSL code within the program. The tricky thing is going to be type checking, and it's likely that the new syntax would need to include allowing argument type definitions as trying to parse GLSL to discern types would probably be difficult.
