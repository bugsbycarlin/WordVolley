
//
// This is a "ball" for the game Word Volley.
// It looks like a tail or a comet or a streamer.
// There's one big word in black, trailed by smaller, greyer words.
// The head moves, and the tail follows along gradually.
//

class Ball {
  constructor(parent, word_length, x, y, left_bound, right_bound, bottom_bound) {
    
    this.parent = parent;
    this.word_length = word_length;
    this.left_bound = left_bound;
    this.right_bound = right_bound;
    this.bottom_bound = bottom_bound;

    var self = this;
    PIXI.Loader.shared.add("Art/fire.json").load(function() {
      var sheet = PIXI.Loader.shared.resources["Art/fire.json"].spritesheet;
      self.fireSprite = new PIXI.AnimatedSprite(sheet.animations["fire"]);
      self.fireSprite.anchor.set(0.5,0.85);
      self.fireSprite.position.set(640, 360);
      self.parent.addChild(self.fireSprite);
      self.fireSprite.animationSpeed = 0.5; 
      self.fireSprite.scale.set(0.4, 0.6)
      self.fireSprite.play();
      self.fireSprite.visible = false;
    });

    this.words = [];
    for (var i = 0; i < 5; i++) {
      var color = PIXI.utils.rgb2hex([0 + 0.2 * i, 0 + 0.2 * i, 0 + 0.2 * i]);
      this.words[i] = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: (i == 0 ? 50 : 40) - 8 * i, fill: color, letterSpacing: 6 - i*3/4, align: "center"});
      this.words[i].anchor.set(0.5,0.5);
      //this.words[i].gap = (38 - i*2.5) * word_length * i;
      // this.words[i].y_gap = 20;
      //this.words[i].position.set(x - this.words[i].gap, y);
      this.words[i].position.set(x, y);
      this.words[i].vx = 0;
      this.words[i].vy = 0;
      this.parent.addChild(this.words[i]);
    }

    // this.vx = 0;
    // this.vy = 0;
    this.gravity = 0;

    this.flying = false;
  }


  smasha(direction, x_distance, y_distance, duration, fire=false) {
    //
    // Compute and start a trajectory that travels x_distance horizontally
    // and y_distance vertically in duration milliseconds in a parabolic arc.
    //
    // My ideals are 640px horizontally, 1/7th that vertically, and 3 seconds.
    // Seem like good video game tennis ball values.
    //

    // Show your work.
    //
    // y = vy0 * t - gt^2/2
    //
    // vy = vy0 - tg
    //
    // time to the top of parabola: when vy = 0, or
    // t = vy0/g
    //
    // therefore time to the end of the whole arc
    // t = 2vy0/g
    //
    // ymax = vy0^2/g - g*vy0^2/(2*g^2) = vy0^2/(2g)
    //
    // duration = 2vy0/g
    //
    // g = 2vy0/duration
    //
    // Plugging g back into the ymax equation gives
    // ymax = vy0^2/(2*2vy0/duration) = vy0*duration/4
    // so
    // vy0 = ymax*4/duration
    //
    // and g = 2 * (ymax*4/duration)/duration = 8*ymax/duration^2
    //
    // and of course
    // vx0 = xmax/duration (that is, you just need to move forward for D ticks at xmax/D speed to get xmax distance)
    //
    // but you can check that with the equations, because
    // xmax = vx0 * 2vy0/g = vx0 * 2(ymax*4/duration)/(8*ymax/duration^2)
    //      = vx0*duration

    var duration_ticks = duration / 33; // rough average 33 milliseconds per tick

    var vx = direction * x_distance / duration_ticks;
    var vy = -1 * (y_distance * 4 / duration_ticks);
    var g = 8 * y_distance / (duration_ticks * duration_ticks);

    console.log("My values are");
    console.log("vx: " + vx);
    console.log("vy: " + vy);
    console.log("g: " + g);

    this.words[0].vx = vx;
    this.words[0].vy = vy;
    this.gravity = g;
    this.history = [];
    this.history_size = 25;

    var tween = new TWEEN.Tween(this.words[0].scale)
    .to({x: 0.35})
    .duration(250)
    .easing(TWEEN.Easing.Quartic.Out)
    .chain(new TWEEN.Tween(this.words[0].scale)
            .to({x: 1})
            .duration(550)
            .easing(TWEEN.Easing.Quartic.Out)
            )
    .start();

    this.flying = true;
    this.start_time = Date.now();
    if (fire) {
      this.history = [];
      this.fireball = true;
      for (var i = 1; i < 5; i++) {
        this.words[i].visible = false;
      }
    }
  }


  addWord(word, location = 0) {
    for (var i = 4; i > 0; i--) this.words[i].text = this.words[i - 1].text;
    this.words[0].text = word;
    if (location == -1) {
      for (var i = 1; i < 5; i++) {
        this.words[i].x = this.words[i-1].x - this.words[i-1].width;
      }
    } else if (location == 1) {
      for (var i = 1; i < 5; i++) {
        this.words[i].x = this.words[i-1].x + this.words[i-1].width;
      }
    }
  }

  distance(x1,y1,x2,y2) {
    return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
  }

  update() {
    // if (this.fireSprite != null) {
    //   this.fireSprite.rotation += 0.1;
    // }
    if (this.flying && this.words[0].y + this.words[0].vy <= this.bottom_bound) {
      this.words[0].x += this.words[0].vx;
      this.words[0].y += this.words[0].vy;

      this.words[0].vy += this.gravity;

      if (this.flying) {
        if (this.words[0].vx > 0) {
          this.words[0].rotation = Math.atan2(this.words[0].vy, this.words[0].vx);
        } else if (this.words[0].vx < 0) {
          this.words[0].rotation = Math.atan2(-this.words[0].vy, -this.words[0].vx);
        }

        this.history.push([this.words[0].x, this.words[0].y, this.words[0].rotation]);
        if (this.history.length > this.history_size) {
          this.history.shift();
        }

        if (this.fireSprite != null && this.fireball && this.history.length > 2) {
          var hp = this.history[this.history.length - 2];
          this.fireSprite.x = hp[0];
          this.fireSprite.y = hp[1];
          this.fireSprite.rotation = hp[2] + Math.PI/2 * (this.words[0].vx > 0 ? -1 : 1);
          this.fireSprite.visible = true;
        }

        var backfill = 1;
        for (var i = this.history.length - 1; i >= 0; i--) {
          var hp = this.history[i];
          if (backfill < 5 && this.distance(this.words[backfill-1].x, this.words[backfill-1].y, hp[0], hp[1]) >= this.words[backfill - 1].width) {
            this.words[backfill].x = hp[0];
            this.words[backfill].y = hp[1];
            this.words[backfill].rotation = hp[2];
            backfill++;
          }
        }     
      }
    } else {
      for (var i = 0; i < 5; i++) {
        this.words[0].vy = 0;
        this.words[0].vx = 0;
      }
      this.words[0].position.y = this.bottom_bound;
      if (this.flying) {
        this.flying = false;
        console.log("Duration: " + (Date.now() - this.start_time));
        console.log(this.history);
      }
    }
  }
}