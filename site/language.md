---
layout: base.njk
---

# Language

Snek's language is based on the idea of signal patching. A Source is patched through a bunch of transformation functions, before being routed to a Bus.

For example, the following program takes the x channel of the `position` signal, patches it into the `osc` transformation function (which is also given a value of `100` for it's frequency argument), and then routes that to the `out` bus.

```snek
position.x -> osc(100) >> out;
```

The result is a black and white oscillator across the X axis.

Something more interesting would be the following:

```snek
position -> rotate(time/10).y -> osc(0.07) >> speed;

time / 30 -> osc(30).yx -> rotate(time).x -> osc(1) >> sync;

position.x -> osc(5, speed.r, sync.x * 2) >> out;
```

## TODO

This document is obviously incomplete currently. The language is potentially going to evolve significantly as I play with different things, so it may not always be fully up to date at any point in the future either.
