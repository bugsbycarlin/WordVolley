

Game.prototype.initializeTestScreen = function() {
  var self = this;

  var excellent_rectangle = PIXI.Sprite.from(PIXI.Texture.WHITE);
  excellent_rectangle.width = 300;
  excellent_rectangle.height = 100;
  excellent_rectangle.anchor.set(0.5, 0.5);
  excellent_rectangle.tint = 0xf1e594;
  excellent_rectangle.position.set(this.width * 4/8, this.height * 1/2 - 8);
  this.scenes["test"].addChild(excellent_rectangle);

  var title_left = new PIXI.Sprite(PIXI.Texture.from("Art/title_left.png"));
  title_left.position.set(this.width * 1/8, this.height * 1/2);
  title_left.anchor.set(0.5, 0.5);
  this.scenes["test"].addChild(title_left);

  var title_right = new PIXI.Sprite(PIXI.Texture.from("Art/title_right.png"));
  title_right.position.set(this.width * 7/8, this.height * 1/2);
  title_right.anchor.set(0.5, 0.5);
  this.scenes["test"].addChild(title_right);

  var title_text = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: 96, fill: 0x000000, letterSpacing: 25, align: "center"});
  title_text.position.set(this.width * 1/2, this.height * 1/2);
  title_text.anchor.set(0.5,0.5);
  this.scenes["test"].addChild(title_text);

  this.makeLetterPalette(this.scenes["test"], this.width * 9/16, this.height * 13/16, function(letter) {
    
  });

  this.test_ball = new Ball(
    this.scenes["test"], 5,
    this.width * 1/4, this.height * 1/3,
    this.width * 1/4, this.width * 3/4, this.height * 1/3 // left, right, bottom
  );

  this.test_ball.addWord("start", 1);
  this.test_ball.words[0].rotation = Math.atan2(-15, 26.4);
  title_text.text = this.test_ball.words[0].text;

  more_words = ["stars", "stabs", "slabs", "slaps", "slips", "flips", "blips", "clips", "chips", "chaps", "craps"]

  console.log(this.test_ball.words[0].width);

  var current_direction = 1;

  document.addEventListener("keyup", function(ev) {
    ev.preventDefault();
    console.log("I read you");
    if (ev.key == "v") {
      console.log("a volley");
      self.test_ball.addWord(more_words.shift(), 0);
      self.test_ball.smasha(current_direction, 640, 640/7, 800);
      current_direction *= -1;
      title_text.text = self.test_ball.words[0].text;
    }

    if (ev.key == "s") {
      console.log("a smaaash");
      self.test_ball.addWord(more_words.shift(), 0);
      self.test_ball.smasha(current_direction, 1600, 640/7, 600, true);
      self.test_ball.words[0].vy *= 0;
      self.test_ball.bottom_bound = 5000;
      current_direction *= -1;
      title_text.text = self.test_ball.words[0].text;
    }
  }, false);

  // this.test_ball.smasha(1);
}

Game.prototype.initializeVolleyScreen = function() {
  var self = this;

  this.clearScene(this.scenes["volley"]);

  this.volley = [];

  this.volley.statement = new PIXI.Text(this.state.origin + "        " + this.state.target, {fontFamily: "Bebas Neue", fontSize: 56, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.volley.statement.anchor.set(0.5,0.5);
  this.volley.statement.position.set(this.width * 1/2, this.height * 1/16);
  this.scenes["volley"].addChild(this.volley.statement);

  this.volleyArrow = new PIXI.Sprite(PIXI.Texture.from("Art/origin_to_target.png"));
  this.volleyArrow.position.set(this.width * 1/2, this.height * 1/16 - 10);
  this.volleyArrow.anchor.set(0.5, 0.5);
  this.scenes["volley"].addChild(this.volleyArrow);

  this.volley.info_text = new PIXI.Text("READY? 3", {fontFamily: "Bebas Neue", fontSize: 36, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.volley.info_text.anchor.set(0.5,0.5);
  this.volley.info_text.position.set(this.width * 1/2, this.height * 3/16);
  this.scenes["volley"].addChild(this.volley.info_text);

  this.volley.player_1_character = new PIXI.Text(this.state.player_1_character, {fontFamily: "Bebas Neue", fontSize: 144, fill: 0x3cb0f3, letterSpacing: 6, align: "center"});
  this.volley.player_1_character.anchor.set(0.5,0.5);
  this.volley.player_1_character.position.set(this.width * 1/8, this.height * 7/16);
  this.scenes["volley"].addChild(this.volley.player_1_character);

  this.volley.player_1_name = new PIXI.Text(this.state.player_1_name, {fontFamily: "Bebas Neue", fontSize: 36, fill: 0x3cb0f3, letterSpacing: 6, align: "center"});
  this.volley.player_1_name.anchor.set(0.5,0.5);
  this.volley.player_1_name.position.set(this.width * 1/8, this.height * 7/16 + 80);
  this.scenes["volley"].addChild(this.volley.player_1_name);

  this.volley.player_1_score = new PIXI.Text(this.state.player_1_score, {fontFamily: "Bebas Neue", fontSize: 48, fill: 0x3cb0f3, letterSpacing: 6, align: "center"});
  this.volley.player_1_score.anchor.set(0.5,0.5);
  this.volley.player_1_score.position.set(this.width * 1/8, this.height * 7/16 + 130);
  this.scenes["volley"].addChild(this.volley.player_1_score);

  this.volley.player_2_character = new PIXI.Text(this.state.player_2_character, {fontFamily: "Bebas Neue", fontSize: 144, fill: 0xf3db3c, letterSpacing: 6, align: "center"});
  this.volley.player_2_character.anchor.set(0.5,0.5);
  this.volley.player_2_character.position.set(this.width * 7/8, this.height * 7/16);
  this.scenes["volley"].addChild(this.volley.player_2_character);

  this.volley.player_2_name = new PIXI.Text(this.state.player_2_name, {fontFamily: "Bebas Neue", fontSize: 36, fill: 0xf3db3c, letterSpacing: 6, align: "center"});
  this.volley.player_2_name.anchor.set(0.5,0.5);
  this.volley.player_2_name.position.set(this.width * 7/8, this.height * 7/16 + 80);
  this.scenes["volley"].addChild(this.volley.player_2_name);

  this.volley.player_2_score = new PIXI.Text(this.state.player_2_score, {fontFamily: "Bebas Neue", fontSize: 48, fill: 0xf3db3c, letterSpacing: 6, align: "center"});
  this.volley.player_2_score.anchor.set(0.5,0.5);
  this.volley.player_2_score.position.set(this.width * 7/8, this.height * 7/16 + 130);
  this.scenes["volley"].addChild(this.volley.player_2_score);

  this.backArrow("volley", "title", function() {
    self.multiplayer.leaveGame(self.game_code, self.player)
    self.resetTitle();
  });


  // this will have to be redone to fit letter size
  this.remakeLiveWordContainer();

  this.play_button = this.makeButton(
    this.scenes["volley"],
    this.width * 1/2, this.height * 21/32,
    "   PLAY", 60, 6, 0xFFFFFF,
    236, 84, 0x3cb0f3,
    function() {
      self.volleyHit();
    }
  );
  this.play_button.racket_sprite = new PIXI.Sprite(PIXI.Texture.from("Art/racket.png"));
  this.play_button.racket_sprite.position.set(-75, -4);
  this.play_button.racket_sprite.anchor.set(0.5, 0.5);
  this.play_button.racket_sprite.scale.set(0.5, 0.50);
  this.play_button.addChild(this.play_button.racket_sprite);
  this.play_button.visible = false;

  this.letterPalette = this.makeLetterPalette(this.scenes["volley"], this.width * 9/16, this.height * 14/16, function(letter) {
    self.live_word_letters[self.live_word_letter_choice].text.text = letter;
    // underline the bads 
    var new_live_word = "";
    for (var i = 0; i < self.live_word_letters.length; i++) {
      new_live_word += self.live_word_letters[i].text.text;
    }
    self.state.live_word = new_live_word;

    self.multiplayer.update({
      live_word: new_live_word
    })

    self.red_underline.visible = self.checkRedUnderline();
    self.blue_underline.visible = self.checkBlueUnderline();

    if (!self.red_underline.visible && !self.blue_underline.visible && self.player == self.state.turn) {
      self.play_button.visible = true; //probably not necessary
      self.play_button.enable();
    } else {
      self.play_button.disable();
    }
  });
  for (var i = 0; i < this.letterPalette.length; i++) {
    this.letterPalette[i].disable();
  }

  this.ball = new Ball(
    this.scenes["volley"], 5,
    this.width * 1/4, this.height * 4/16,
    this.width * 1/4, this.width * 3/4, this.height * 4/16 // left, right, bottom
  );
  this.ball.addWord(this.state.volley) // assuming volley is equal to the first word at time of creation
  this.ball.hide();

}

Game.prototype.remakeLiveWordContainer = function() {
  var self = this;
  this.scenes["volley"].removeChild(this.liveWordContainer)
  
  this.live_word_letters = [];
  this.liveWordContainer = new PIXI.Container();
  this.scenes["volley"].addChild(this.liveWordContainer);

  var length = 5;
  var turn = false;
  if (this.state != null && this.state.origin != null && this.state.origin != "") {
    length = this.state.origin.length;
    turn = (this.player == this.state.turn);
  }

  this.live_word_letter_choice = 0;
  for (var i = 0; i < length; i++) {
    let choice_num = i;
    this.live_word_letters.push(this.makeButton(
      this.liveWordContainer,
      this.width * 1/2 - (50*(length - 1)) + 100*i , this.height * 7/16,
      "", 100, 6, 0x000000,
      98, 100, ((turn && i == 0) ? 0xf1e594 : 0xFFFFFF),
      function() {
        if (self.player == self.state.turn) {
          for (var i = 0; i < self.live_word_letters.length; i++) {
            self.live_word_letters[i].text.text = self.ball.words[0].text[i];
          }
          self.multiplayer.update({
            live_word: self.ball.words[0].text,
            volley_state: self.state.volley_state,
          })

          self.live_word_letter_choice = choice_num
          for (var i = 0; i < self.live_word_letters.length; i++) {
            self.live_word_letters[i].backing.tint = (i == self.live_word_letter_choice ? 0xf1e594 : 0xFFFFFF);
          }
        }
        self.red_underline.visible = false;
        self.blue_underline.visible = false;
      }
    ));
  }
  this.liveWordContainer.visible = false;
  // for (var i = 0; i < this.live_word_letters.length; i++) {
  //   this.live_word_letters[i].visible = false;
  // }

  this.red_underline = new PIXI.Sprite(PIXI.Texture.from("Art/red_underline.png"));
  this.red_underline.position.set(this.width * 1/2, this.height * 7/16 + 60);
  this.red_underline.scale.set(length / 5, 1);
  this.red_underline.anchor.set(0.5, 0.5);
  this.scenes["volley"].addChild(this.red_underline);
  this.red_underline.visible = false;

  this.blue_underline = new PIXI.Sprite(PIXI.Texture.from("Art/blue_underline.png"));
  this.blue_underline.position.set(this.width * 1/2, this.height * 7/16 + 60);
  this.blue_underline.scale.set(length / 5, 1);
  this.blue_underline.anchor.set(0.5, 0.5);
  this.scenes["volley"].addChild(this.blue_underline);
  this.blue_underline.visible = false;
}