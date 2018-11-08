/**
 * sketch
 */
const _sketch = function(_s) {
  // #region settings
  const framerate = 60;
  const w = window.innerWidth;
  const h = window.innerHeight;
  // #endregion

  const a = [0.5,0.5,0.5];
  const b = [0.5,0.5,0.5];
  const c = [1.0,1.0,1.0];
  const d = [0.33,0.67,0.8];
  const palette = new Palette(a,b,c,d);
  const bg = palette.getColor(0.1);

  let time;

  // #region p5
  _s.setup = function() {
    const p5canvas = _s.createCanvas(w, h);
    canvas = p5canvas.canvas;
    time = new Time(_s, palette);
    _s.frameRate(framerate);
    _s.background(bg);
  }

  _s.draw = function() {
    _s.background(bg);
    time.run();
  }
  // #endregion
};

const sketch = new p5(_sketch, document.getElementById('sketch'));