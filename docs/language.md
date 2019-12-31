# Language

```

// Expression source routed to a bus
3 * pi >> rotAngle;

// x component of the position signal modified by an oscilator function
// 1.0 added to the signal then routed to a channel
position.x -> osc() + 1 >> speed;

//
position->rotate(rotAngle, speed.0)->(in => in.x->osc(10) + in.y->osc(12)) >> out;

```
