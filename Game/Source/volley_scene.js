

Game.prototype.initializeVolleyScreen = function() {
  var self = this;
  console.log("Initializing volley screen");
  this.clearScene(this.scenes["volley"]);

  this.volley = [];

  // this.volley.statement = new PIXI.Text(this.state.origin + "        " + this.state.target, {fontFamily: "Bebas Neue", fontSize: 56, fill: 0x000000, letterSpacing: 6, align: "center"});
  // this.volley.statement.anchor.set(0.5,0.5);
  // this.volley.statement.position.set(this.width * 1/2, this.height * 1/16);
  // this.scenes["volley"].addChild(this.volley.statement);

  // this.volleyArrow = new PIXI.Sprite(PIXI.Texture.from("Art/origin_to_target.png"));
  // this.volleyArrow.position.set(this.width * 1/2, this.height * 1/16 - 10);
  // this.volleyArrow.anchor.set(0.5, 0.5);
  // this.scenes["volley"].addChild(this.volleyArrow);

  this.volley.info_text = new PIXI.Text("READY? 3", {fontFamily: "Bebas Neue", fontSize: 48, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.volley.info_text.anchor.set(0.5,0.5);
  this.volley.info_text.position.set(this.width * 1/2, this.height * 2/16);
  this.scenes["volley"].addChild(this.volley.info_text);

  this.volley.player_1_character = new PIXI.Text(this.state.player_1_name.substring(0,1), {fontFamily: "Bebas Neue", fontSize: 144, fill: 0x3cb0f3, letterSpacing: 6, align: "center"});
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

  this.volley.player_2_character = new PIXI.Text(this.state.player_2_name.substring(0,1), {fontFamily: "Bebas Neue", fontSize: 144, fill: 0xf3db3c, letterSpacing: 6, align: "center"});
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

  this.volley.coop_score = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: 48, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.volley.coop_score.anchor.set(0.5,0.5);
  this.volley.coop_score.position.set(this.width * 1/2, this.height * 7/32);
  this.scenes["volley"].addChild(this.volley.coop_score);

  if (this.state.game_type == "code_coop") {
    this.volley.coop_score.visible = true;
    this.volley.player_1_score.visible = false;
    this.volley.player_2_score.visible = false;
  } else {
    this.volley.coop_score.visible = false;
    this.volley.player_1_score.visible = true;
    this.volley.player_2_score.visible = true;
  }

  this.volley.hint_text = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: 36, fill: 0xDDDDDD, letterSpacing: 6, align: "center"});
  this.volley.hint_text.anchor.set(0.5,0.5);
  this.volley.hint_text.position.set(this.width * 7/8, this.height * 7/16 + 170);
  this.scenes["volley"].addChild(this.volley.hint_text);
  this.volley.hint_text.visible = false;

  this.volley.back_arrow = this.backArrow("volley", "title", function() {
    self.multiplayer.leaveGame(self.game_code, self.player)
    self.resetTitle();
  });

  console.log("I am remaking the live word container");
  this.remakeLiveWordContainer();

  this.play_button = this.makeButton(
    this.scenes["volley"],
    this.width * 1/2, this.height * 21/32,
    "   PLAY", 60, 6, 0xFFFFFF,
    236, 84, 0x3cb0f3,
    function() {
      self.returnVolley();
    }
  );
  this.play_button.racket_sprite = new PIXI.Sprite(PIXI.Texture.from("Art/racket.png"));
  this.play_button.racket_sprite.position.set(-75, -4);
  this.play_button.racket_sprite.anchor.set(0.5, 0.5);
  this.play_button.racket_sprite.scale.set(0.5, 0.50);
  this.play_button.addChild(this.play_button.racket_sprite);
  this.play_button.visible = false;

  this.letter_palette = this.makeLetterPalette(this.scenes["volley"], this.width * 9/16, this.height * 14/16, function(letter) {
    if (self.state.volley_state == "interactive") {
      self.live_word_letters[self.live_word_letter_choice].text.text = letter;
      // underline the bads 
      var new_live_word = "";
      for (var i = 0; i < self.live_word_letters.length; i++) {
        new_live_word += self.live_word_letters[i].text.text;
      }
      self.state.live_word = new_live_word;

      console.log(new_live_word);

      // self.multiplayer.update({
      //   live_word: new_live_word
      // })

      self.red_underline.visible = self.checkRedUnderline();
      self.blue_underline.visible = self.checkBlueUnderline();

      if (!self.red_underline.visible && !self.blue_underline.visible 
        && self.player == self.state.turn
        && new_live_word != self.ball.words[0].text.text) {
        self.play_button.visible = true; //probably not necessary
        self.play_button.enable();
      } else {
        self.play_button.disable();
      }
    }
  });
  for (var i = 0; i < this.letter_palette.letters.length; i++) {
    this.letter_palette.letters[i].disable();
  }

  this.ball = new Ball(
    this.scenes["volley"], 5,
    this.width * 1/4, this.height * 4/16,
    this.width * 1/4, this.width * 3/4, this.height * 4/16 // left, right, bottom
  );
  this.ball.addWord(this.state.volley) // assuming volley is equal to the first word at time of creation
  this.ball.hide();

  this.conclusion_text = new PIXI.Text("EH. OKAY.", {fontFamily: "Bebas Neue", fontSize: 64, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.conclusion_text.anchor.set(0.5,0.5);
  this.conclusion_text.position.set(this.width * 1/2, this.height * 7/16);
  this.scenes["volley"].addChild(this.conclusion_text);
  this.conclusion_text.visible = false;

  if (this.player == 1 || this.player == 2) {
    this.conclusion_rematch_button = this.makeButton(
      this.scenes["volley"],
      this.width * 2/6, this.height * 5/6,
      "REMATCH", 44, 6, 0xFFFFFF,
      224, 80, 0x3cb0f3,
      function() {
        self.requestRematch();
        // self.initializeSetupCreate();
        // self.animateSceneSwitch("title", "setup_create")
      }
    );
    this.conclusion_rematch_button.visible = false;
  } else {
    this.conclusion_rematch_button = this.makeButton(
      this.scenes["volley"],
      this.width * 2/6, this.height * 5/6,
      "WATCH MO", 44, 6, 0xFFFFFF,
      224, 80, 0x3cb0f3,
      function() {
        self.requestRematch();
        // self.initializeSetupCreate();
        // self.animateSceneSwitch("title", "setup_create")
      }
    );
    this.conclusion_rematch_button.visible = false;
  }

  this.conclusion_quit_button = this.makeButton(
    this.scenes["volley"],
    this.width * 4/6, this.height * 5/6,
    "QUIT", 44, 6, 0x000000,
    224, 80, 0xf3db3c,
    function() {
      self.multiplayer.leaveGame(self.game_code, self.player);
      self.resetTitle();
      self.animateSceneSwitch("volley", "title");
      // self.initializeSetupCreate();
      // self.animateSceneSwitch("title", "setup_create")
    }
  );
  this.conclusion_quit_button.visible = false;
}

Game.prototype.remakeLiveWordContainer = function() {
  var self = this;
  this.scenes["volley"].removeChild(this.live_word_container);
  this.scenes["volley"].removeChild(this.red_underline);
  this.scenes["volley"].removeChild(this.blue_underline);
  
  this.live_word_letters = [];
  this.live_word_container = new PIXI.Container();
  this.scenes["volley"].addChild(this.live_word_container);

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
      this.live_word_container,
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

          self.play_button.disable();
        }
        self.red_underline.visible = false;
        self.blue_underline.visible = false;
      }
    ));
  }
  this.live_word_container.visible = false;
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

// Game.prototype.initializeConclusionBox = function() {
//   this.conclusionBox.position.set(this.width / 2, this.height / 2);
//   this.conclusionBox.visible = false;

//   this.conclusionMask.position.set(this.width / 2, this.height / 2);
//   this.conclusionMask.visible = false;
//   this.conclusionMask.interactive = true;
//   this.conclusionMask.buttonMode = true;
//   this.conclusionMask.on("click", function() {
//   });

//   this.conclusionBox.conclusionCharacter = [];

//   var mask = PIXI.Sprite.from(PIXI.Texture.WHITE);
//   mask.width = this.width;
//   mask.height = this.height;
//   mask.anchor.set(0.5, 0.5);
//   mask.alpha = 0.2;
//   mask.tint = 0x000000;
//   this.conclusionMask.addChild(mask);

//   var outline = PIXI.Sprite.from(PIXI.Texture.WHITE);
//   outline.width = this.width * 3/5;
//   outline.height = this.height * 3/5;
//   outline.anchor.set(0.5, 0.5);
//   outline.position.set(-1, -1);
//   outline.tint = 0xDDDDDD;
//   this.conclusionBox.addChild(outline);

//   for (var i = 0; i < 4; i++) {
//     var backingGrey = PIXI.Sprite.from(PIXI.Texture.WHITE);
//     backingGrey.width = this.width * 3/5;
//     backingGrey.height = this.height * 3/5;
//     backingGrey.anchor.set(0.5, 0.5);
//     backingGrey.position.set(4 - i, 4 - i);
//     backingGrey.tint = PIXI.utils.rgb2hex([0.8 - 0.1*i, 0.8 - 0.1*i, 0.8 - 0.1*i]);
//     this.conclusionBox.addChild(backingGrey);
//   }

//   var backingWhite = PIXI.Sprite.from(PIXI.Texture.WHITE);
//   backingWhite.width = this.width * 3/5;
//   backingWhite.height = this.height * 3/5;
//   backingWhite.anchor.set(0.5, 0.5);
//   backingWhite.position.set(0,0);
//   backingWhite.tint = 0xFFFFFF;
//   this.conclusionBox.addChild(backingWhite);

//   this.conclusionBox.conclusionText = new PIXI.Text("EH. OKAY.", {fontFamily: "Bebas Neue", fontSize: 48, fill: 0x000000, letterSpacing: 6, align: "center"});
//   this.conclusionBox.conclusionText.anchor.set(0.5,0.5);
//   this.conclusionBox.conclusionText.position.set(0, -160);
//   this.conclusionBox.addChild(this.conclusionBox.conclusionText);

//   this.conclusionBox.interactive = true;
//   this.conclusionBox.buttonMode = true;
// }