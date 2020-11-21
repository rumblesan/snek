---
layout: base.njk
---

# Language

Snek is built around the idea of analogue signal processing, using a language that tries to make these signal paths explicit. The language gets translated fairly directly into GLSL code which can easily be viewed in the editor.

Signals flow between input *Sources* and output *Buses*. The built in input *Sources* are `position`, the screen pixel coordinates, and `time`, the number of milliseconds since the program started. There is only a single output *Bus*, called `out`.
Users can also create their own *Buses*, which can then be used as *Sources* elsewhere in the program to make routing signals easier.

These signal processing programs are run for every single pixel on the canvas in parallel.

Signals can have multiple *Channels*.

The signals can be transformed using *Functions*.

These signal paths are type checked but the type system is essentially just limited to Numbers, with a multi channel signal essentially being a Vector of Numbers.

For example, in the following code

```snek
position.x -> osc(5) >> out;
```
The signal on the `x` channel of the `position` source is transformed by the `osc` function (which is given a value of `5` for its frequency argument) and then routed that to the `out` bus.

The result is a black and white oscillator across the X axis.

In this slightly larger example

```snek
position.y -> osc(3).xy >> mod;

position -> modulate(mod) -> repeat(time / 8, 3, 0.1, 1.1)
    -> rotate(5).x -> osc(5, 0.1, mod.g) >> out;
```

A user bus called `mod` is created which then gets used twice on the second line. This bus has 2 channels, because when it's created on the first line, only the `x` and `y` channels of the `osc` function output are sent to it.

The `modulate` function on the second line uses both of these channels, but only the second channel from the `mod` bus is used as an argument to the `osc` function near the end of the line.
