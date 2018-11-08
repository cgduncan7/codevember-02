/**
 * TIME
 * 
 * H H : M M : S S
 */
function Time(sketch, palette) {
  this.sketch = sketch;
  this.palette = palette;
  this.width = this.sketch.width * 0.6;
  this.height = this.width / 4;
  this.numWidth = this.width / 9.0;
  this.numHeight = this.numWidth * 2.0;
  this.numThickness = this.numWidth / 10.0;
  this.h = [null,null];
  this.m = [null,null];
  this.s = [null,null];
  this.numbers = [];
  this.separators = [
    new TimeNumber(
      (this.sketch.width - this.width) / 2 + 3 * this.numWidth,
      0,
      this.numWidth,
      this.numHeight,
      this.numThickness,
      -1,
      palette.getColor(0.7),
    ),
    new TimeNumber(
      (this.sketch.width - this.width) / 2 + 6 * this.numWidth,
      0,
      this.numWidth,
      this.numHeight,
      this.numThickness,
      -1,
      palette.getColor(0.7),
    ),
  ];
  this.oldNumbers = [];
}

Time.prototype.formatNumber = function(number) {
  return [Math.floor(number / 10), number % 10];
}

Time.prototype.numberEquals = function(a, b) {
  const inequalities = [];
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) inequalities.push(i);
  }
  return inequalities;
}

Time.prototype.run = function() {
  const date = new Date();
  const _h = this.formatNumber(date.getHours());
  const _m = this.formatNumber(date.getMinutes());
  const _s = this.formatNumber(date.getSeconds());
  const _t = _h.concat(_m, _s);

  const hi = this.numberEquals(this.h, _h);
  const mi = this.numberEquals(this.m, _m).map((i) => i + 2);
  const si = this.numberEquals(this.s, _s).map((i) => i + 4);
  const di = hi.concat(mi, si);

  if (di.length > 0) {
    di.map((col) => {
      const offset = [1, 2, 4, 5, 7, 8];
      const newNumber = new TimeNumber(
        (this.sketch.width - this.width) / 2 + offset[col] * this.numWidth,
        0,
        this.numWidth,
        this.numHeight,
        this.numThickness,
        _t[col],
        this.palette.getColor(Math.random()),
      );
      const oldNumber = this.numbers[col];
      this.numbers[col] = newNumber;
      if (oldNumber) {
        this.oldNumbers.push(oldNumber);
        oldNumber.die();
      }
    });
  }

  this.h = _h;
  this.m = _m;
  this.s = _s;


  this.sketch.fill(255);
  this.sketch.stroke(255);
  this.sketch.rectMode(this.sketch.CENTER);
  this.sketch.rect(this.sketch.width / 2, this.sketch.height / 2, this.width, this.height);
  this.sketch.translate(0, this.sketch.height / 2);
  
  const toDelete = [];
  for (let i = 0; i < this.numbers.length; i += 1) {
    const number = this.numbers[i];
    const isAlive = number.run(this.sketch);
    if (!isAlive) toDelete.push(i);
  }

  for (let i = 0; i < this.oldNumbers.length; i += 1) {
    const number = this.oldNumbers[i];
    const isAlive = number.run(this.sketch);
    if (!isAlive) toDelete.push(i);
  }

  for (let i = 0; i < this.separators.length; i += 1) {
    this.separators[i].run(this.sketch);
  }

  for (let i = toDelete.length - 1; i >= 0; i -= 1) {
    this.oldNumbers.splice(i, 1);
  }
};

/**
 * SEGMENTS
 *  -A-
 * F   B
 *  -G-
 * E   C
 *  -D-
 */
function TimeNumber(x, y, w, h, t, number, color) {
  this.x = x;
  this.y = y;
  this.w = w - 3*t;
  this.h = h - 2*t;
  this.t = t;
  this.age = 0;
  this.number = number;
  this.color = color;
  this.segments = [];
  this.isDying = false;
  switch (number) {
    case 0: this.segmentString = 'abcedf'; break;
    case 1: this.segmentString = 'bc'; break;
    case 2: this.segmentString = 'abged'; break;
    case 3: this.segmentString = 'abgcd'; break;
    case 4: this.segmentString = 'fgbc'; break;
    case 5: this.segmentString = 'afgcd'; break;
    case 6: this.segmentString = 'afgced'; break;
    case 7: this.segmentString = 'abc'; break;
    case 8: this.segmentString = 'fabgedc'; break;
    case 9: this.segmentString = 'fgabcd'; break;
    default: this.segmentString = 'xy'; break;
  }

  for (let i = 0; i < this.segmentString.length; i += 1) {
    const char = this.segmentString.charAt(i);
    let l = this.w;
    let t = this.t;
    let x = this.x;
    let y = this.y;
    let a = 0;
    switch (char) {
      case 'a': {
        a = 0;
        y -= l;
        break;
      }
      case 'b': {
        a = Math.PI / 2;
        x += l/2;
        y -= l/2;
        break;
      }
      case 'c': {
        a = Math.PI / 2;
        x += l/2;
        y += l/2;
        break;
      }
      case 'd': {
        a = 0;
        y += l;
        break;
      }
      case 'e': {
        a = Math.PI / 2;
        x -= l/2;
        y += l/2;
        break;
      }
      case 'f': {
        a = Math.PI / 2;
        x -= l/2;
        y -= l/2;
        break;
      }
      case 'g': {
        a = 0;
        break;
      }
      case 'x': {
        l = 2*this.t;
        t = l/2;
        a = 0;
        y -= l;
        break;
      }
      case 'y': {
        l = 2*this.t;
        t = l/2;
        a = 0;
        y += l;
        break;
      }
    }
    this.segments.push(new NumberSegment(x, y, a, l, t, this.color));
  }
}

TimeNumber.prototype.die = function() {
  this.isDying = true;
}

TimeNumber.prototype.run = function(s) {
  if (this.isDying) this.age += 0.01;
  s.push();
  s.stroke(this.color);
  s.fill(this.color);
  for (let segment of this.segments) {
    segment.draw(s, this.age);
  }
  s.pop();
  return (this.age < 1);
}

function NumberSegment(x, y, a, l, t, color) {
  this.x = x;
  this.y = y;
  this.a = a;
  this.l = l;
  this.t = t;
  this.vertices = [
    [-this.l/2, 0],
    [-this.l/2 + this.t, this.t],
    [this.l/2 - this.t, this.t],
    [this.l/2, 0],
    [this.l/2 - this.t, -this.t],
    [-this.l/2 + this.t, -this.t],
  ];
  this.color = color;
  this.rot = Math.random() / 10;
  this.vel = [Math.random() * 2 - 1, 2];
}

NumberSegment.prototype.draw = function(s, age) {
  let scale = 1;
  if (age > 0) {
    this.x += this.vel[0];
    this.y += this.vel[1];
    this.a += this.rot;
    scale -= age;
  }
  if (scale > 0) {
    s.push();
    s.translate(this.x, this.y);
    s.rotate(this.a);
    s.scale(scale, scale);
    s.push();
    s.fill(s.color(0, 0, 0, 50));
    s.noStroke();
    s.rotate(-this.a);
    s.translate(2, 2);
    s.rotate(this.a);
    s.beginShape();
    for (let v of this.vertices) {
      s.vertex(v[0], v[1]);
    }
    s.endShape(s.CLOSE);
    s.pop();
    s.beginShape();
    for (let v of this.vertices) {
      s.vertex(v[0], v[1]);
    }
    s.endShape(s.CLOSE);
    s.pop();
  }
}