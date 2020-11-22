---
layout: base.njk
---

# Language

Snek is built around the idea of analogue signal processing, using a language that tries to make these signal paths explicit. The language gets translated fairly directly into GLSL code which can easily be viewed in the editor.

Signals flow between input buses and output buses The built in input buses are `position`, the screen pixel coordinates, and `time`, the number of seconds since the program started. There is only a single output bus, called `out`.
Users can also create their own buses, which can then be used elsewhere in the program to make routing signals easier.

These signal processing programs are run for every single pixel on the canvas in parallel.

Signals can have multiple channels and they can be transformed using functions.

These signal paths are type checked but the type system is essentially just limited to Numbers, with a multi channel signal essentially being a Vector of Numbers.

## Starting

In the following code

```snek
position.x -> osc(5) >> out;
```
The signal on the `x` channel of the `position` bus is transformed by the `osc` function (which is given a value of `5` for its frequency argument) and then routed that to the `out` bus.

There's quite a few things going on here so let's break it down.

The `position` bus has two channels, x and y, and we can use the `.` followed by their names to split them out.

The `osc` function expects a single channel routed into it, and uses this to create an oscillating signal out, with the argument we give it defining the frequency of that oscillator.

The output from the oscillator function is actually a four channel signal, which we route to the `out` bus to be used as *rgba* colour information which results in a black and white oscillator across the X axis.

## Basic Syntax

At this point we should cover the basic syntax of snek.

The `->` operator is used to route a signal into a transformation function.

The `>>` operator is used to route a signal to a bus.

Each line defines one patch from one bus to another, so needs to start with the name of a bus and finish with another one.

The semicolon, `;`, is used to define the end of a routing from one bus to another.

When splitting channels out of a signal, the characters `r`, `g`, `b`, `a`, `x`, `y`, `z` and `w` can all be used and combined freely.

* `r` and `x` will get the first channel.
* `g` and `y` will get the second channel.
* `b` and `z` will get the third channel.
* `a` and `w` will get the fourth channel.

This can be used to switch the order of channels in a signal, as well as duplicate them,.

```snek
position.x -> osc(5).bryy >> out;
```

The above code will take the four channel signal output from the `osc` function and then combine the third, first, third, and a duplicate third channel together.


## Additional Functions

A simple next change would be to use the `shift` function to shift the values in each channel of the oscillator output.

```snek
position.x -> osc(5) -> shift(0.1, 0.2, 0.3, 0) >> out;
```

`shift` expects to be routed four channels in it's input, and then can be given up to four arguments which specify how much those values should be shifted by, with them being wrapped around to 0 if they go above 1. So here the blue channel is being shifted by 0.3, meaning a value of 0.85 will be wrapped around to 0.15.

## Using Signals as Arguments

Signals can be passed to functions as arguments, just like numbers can.

```snek
position.x -> osc(5) -> shift(0.1, 0.2, position.y, 0) >> out;
```

Here you should see an offset for the blue colour in the *y* axis, but it's quite static, so let's make that signal an oscillator.

```snek
position.x -> osc(5) -> shift(0.1, 0.2, position.y -> osc(6).r, 0) >> out;
```

We transform the `position.y` signal with the `osc` function, and then get the `r` channel from the output signal and route it straight into the value for how much we want to offset the original blue channel by.

In this way we can start modulating everything we see in the patch.

## Custom Buses

Whilst it's fine to nest signals like this in small patches, in larger patches it may start getting messy, and we may want to reuse a signal in multiple places. This can be simplified by creating a custom bus.

In this slightly larger example

```snek
position.y -> osc(3).rg >> mod;

position -> modulate(mod) -> repeat(time / 8, 3, 0.1, 1.1)
    -> rotate(5).x -> osc(5, 0.1, mod.g) >> out;
```

A bus called `mod` is created which then gets used twice on the second line. This bus has 2 channels, because when it's created on the first line, only the `r` and `g` channels of the `osc` function output are sent to it.

The `modulate` function on the second line uses both of these channels, but only the second channel from the `mod` bus is used as an argument to the `osc` function near the end of the line.

## Operators

Signals can also be transformed using basic mathematical operators.

```snek
position.x / position.y * 30 -> osc(5) >> out;
```
