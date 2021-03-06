/*
 * Copyright (C) 2012 Benjamin Feng
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */


var TAU = 2*Math.PI;

/* Yet another complex number implementation. */
function Complex(real, imag, mag, dir) {
  if(!(this instanceof Complex)) { return new Complex(real, imag, mag, dir); }

  this.real = real;
  this.imag = imag;
  this.mag = mag;
  this.dir = dir;
}

$.extend(Complex, {
  rect: function(real, imag) {
    return new this(real, imag).sRecalcPolar();
  },

  polar: function(mag, dir) {
    return new this(0, 0, mag, dir).sRecalcRect();
  },

  zero: function() {
    return new this(0, 0, 0, 0);
  }
});

$.extend(Complex.prototype, {
  clone: function() {
    return new Complex(this.real, this.imag, this.mag, this.dir);
  },

  sRecalcRect: function() {
    this.real = this.mag*Math.cos(this.dir);
    this.imag = this.mag*Math.sin(this.dir);
    return this;
  },

  sRecalcPolar: function() {
    this.mag = Math.sqrt(this.real*this.real + this.imag*this.imag)
    this.dir = Math.atan2(this.imag, this.real);
    return this;
  },

  sAdd: function(c) {
    this.real += c.real;
    this.imag += c.imag;
    return this.sRecalcPolar();
  },

  sMult: function(c) {
    if(c.dir) {
      this.mag *= c.mag;
      this.dir += c.dir;
      return this.sRecalcRect();
    } else {
      var mag = c.mag || c;
      this.real *= mag;
      this.imag *= mag;
      this.mag *= mag;
      return this;
    }
  },

  sReflectReal: function(c) {
    this.real = -this.real;
    return this.sRecalcPolar();
  },

  sReflectImag: function(c) {
    this.imag = -this.imag;
    return this.sRecalcPolar();
  },

  add: function(c) {
    return this.clone().sAdd(c);
  },

  mult: function(c) {
    return this.clone().sMult(c);
  }
});

function pong(container, fieldwidth, fieldheight, ballsize, paddlewidth) {
  var paddlespeed = 200;
  var $field = $('<div id="field" />').appendTo(container);
  $field.css({width: fieldwidth, height: fieldheight});

  var cssTransition = (function(undefined) {
    var style = (document.body || document.documentElement).style;
    return (style.WebkitTransition !== undefined ? '-webkit-transition' :
            style.MozTransition !== undefined ? '-moz-transition' :
            style.OTransition !== undefined ? '-o-transition' :
            style.transition !== undefined ? 'transition' :
            null);
  })();
  var score = 0;
  var $score = $('<span class="score">0</span>').appendTo(container);

  function actor(classes, width, height) {
    var $e = $('<div class="actor ' + classes + '" />').appendTo($field).
               css({width:      width,    height: height,
                    marginLeft: -width/2, marginTop: -height/2});

    return {
      cssPos: function(pos) {
        return {left: fieldwidth/2 + pos.real, top: fieldheight/2 - pos.imag};
      },

      jumpTo: function(pos) {
        if(!pos) { return; }

        this.posStart = pos;
        this.moveBeginTime = null;
        if(cssTransition) {
          $e.css(cssTransition, 'all linear');
        } else {
          $e.stop();
        }
        $e.css(this.cssPos(pos));
      },

      pos: function() {
        if(!this.moveBeginTime) { return this.posStart; }

        var duration = (+new Date() - this.moveBeginTime)/1000;
        return this.posStart.add(this.vel.mult(duration));
      },

      posLeftest: function() {
        return this.pos().real - width/2;
      },

      posRightest: function() {
        return this.pos().real + width/2;
      },

      stopMove: function() {
        clearTimeout(this.moveUntilWallId);
        this.jumpTo(this.pos());
      },

      moveUntilWall: function(onHit) {
        if(this.vel.mag == 0) { return; }

        this.moveBeginTime = +new Date();

        var horiWall = (this.vel.real > 0 ? 1 : -1) * (fieldwidth/2 - width/2);
        var vertWall = (this.vel.imag > 0 ? 1 : -1) * (fieldheight/2 - height/2);

        var horiDuration = (horiWall - this.posStart.real) / this.vel.real;
        var vertDuration = (vertWall - this.posStart.imag) / this.vel.imag;

        var duration;
        var whichWall;
        if(horiDuration < vertDuration) {
          whichWall = horiWall > 0 ? 'R' : 'L';
          duration = horiDuration;
        } else {
          whichWall = vertWall > 0 ? 'T' : 'B';
          duration = vertDuration;
        }

        var animDuration = duration - 0.01;
        var posTarget = this.posStart.add(this.vel.mult(duration));
        if(cssTransition) {
          $e.css(cssTransition+'-duration', animDuration+'s');
          $e.css(this.cssPos(posTarget));
        } else {
          $e.animate(this.cssPos(posTarget), animDuration*1000, 'linear');
        }

        var self = this;
        this.moveUntilWallId = setTimeout(function() {
          self.posStart = posTarget;
          self.moveBeginTime = null;
          if(onHit && onHit(whichWall)) {
            self.moveUntilWall(onHit);
          }
        }, duration*1000);
      }
    };
  }

  var ball = actor('ball', ballsize, ballsize);
  ball.reset = function() {
    ball.stopMove();

    ball.jumpTo(Complex.rect(0, -fieldheight/2 + ballsize/2));
    ball.vel = Complex.polar(200, TAU * (4/9 - 3/9*Math.random()));

    function onHit(whichWall) {
      if(whichWall == 'L' || whichWall == 'R') {
        ball.vel.sReflectReal();
      } else {
        if(whichWall == 'B') {
          if(ball.posLeftest() > paddle.posRightest() ||
             ball.posRightest() < paddle.posLeftest()) {
            return false;
          } else {
            score += 1;
            $score.text(score);
          }
        }
        ball.vel.sReflectImag();
      }
      return true;
    }
    setTimeout(function() {ball.moveUntilWall(onHit)}, 10);
  };

  var paddleheight = ballsize/2; // TODO: move to CSS only, doesn't affect logic
  var paddle = actor('paddle', paddlewidth, paddleheight);
  paddle.jumpTo(Complex.rect(0, -fieldheight/2 - paddleheight/2));
  paddle.moveLeft = function() {
    this.stopMove();
    this.vel = Complex(-paddlespeed, 0);
    this.moveUntilWall();
  };
  paddle.moveRight = function() {
    this.stopMove();
    this.vel = Complex(paddlespeed, 0);
    this.moveUntilWall();
  };

  $(document).keydown(function(event) {
    switch(event.which) {
      case 37: //left arrow
        paddle.moveLeft();
        break;
      case 39: //right arrow
        paddle.moveRight();
        break;
    }
  }).keyup(function(event) {
    switch(event.which) {
      case 37:
      case 39:
        paddle.stopMove();
        break;
    }
  });

  return {
    ball: ball,
    paddle: paddle,
    start: function() {
      ball.reset();
    }
  };
}
