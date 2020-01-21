---
layout: base.njk
---

# Examples

Some larger examples.


```snek
position.y -> osc(3) -> mult(30).xy >> mod;

position.x -> osc(5) >> sync;

position -> modulate(mod) -> repeat(time / 8, 3, 0.1, 1.1) -> rotate(5).x -> osc(5, 0.1, sync.r) >> out;
```
