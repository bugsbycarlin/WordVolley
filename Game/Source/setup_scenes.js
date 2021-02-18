
// My colors
// Blue: 0x3cb0f3
// Yellow: 0xf3db3c
// Red: 0xdb5858
// Green: 0x71d07d


Game.prototype.backArrow = function(current, old, action=null) {
  var self = this;
  var arrow = new PIXI.Sprite(PIXI.Texture.from("Art/left_arrow.png"));
  arrow.position.set(64, 48);
  arrow.anchor.set(0.5, 0.5);
  arrow.scale.set(0.4, 0.4);
  arrow.interactive = true;
  arrow.buttonMode = true;
  arrow.on("click", function() {
    if (action != null) {
      action();
    }
    self.animateSceneSwitch(current, old)
  });
  this.scenes[current].addChild(arrow);
  return arrow;
}

var character_names = [
  "ALFIE",
  "BERT",
  "CALLIE",
  "DENZEL",
  "EMMA",
  "FATIMA",
  "GRETA",
  "HAKEEM",
  "INEZ",
  "JIN",
  "KRISHNA",
  "LIAN",
  "MARCUS",
  "NAOMI",
  "OMAR",
  "PABLO",
  "QUARREN",
  "RIYA",
  "SOPHIE",
  "TANIEL",
  "UBA",
  "VIJAY",
  "WINTER",
  "XAVIER",
  "YAIR",
  "ZHANG",
];
Game.prototype.changeCharacterArrow = function(scene, player, direction, x, y) {
  var self = this;
  var arrow = new PIXI.Sprite(PIXI.Texture.from("Art/left_arrow.png"));
  arrow.position.set(x, y);
  arrow.anchor.set(0.5, 0.5);
  arrow.scale.set(0.2, 0.4);
  arrow.rotation = Math.PI / 2;
  if (direction == -1) {
    arrow.rotation = Math.PI / -2;
  }
  arrow.interactive = true;
  arrow.buttonMode = true;
  arrow.on("click", function() {
    var alphabetArray = alphabet.split('');
    if (player == 1) {
      var old_character = self.state.player_1_name.substring(0,1);
      var position = alphabetArray.indexOf(old_character);
      var new_character = alphabetArray[(position + alphabetArray.length + 1 * direction) % 26];
      var new_name = character_names[(position + alphabetArray.length + 1 * direction) % 26];
      self.lobby.player_1_character.text = new_character;
      self.multiplayer.update({player_1_name: new_name});
    } else if (player == 2) {
      var old_character = self.state.player_2_name.substring(0,1);;
      var position = alphabetArray.indexOf(old_character);
      var new_character = alphabetArray[(position + alphabetArray.length + 1 * direction) % 26];
      var new_name = character_names[(position + alphabetArray.length + 1 * direction) % 26];
      self.lobby.player_2_character.text = new_character;
      self.multiplayer.update({player_2_name: new_name});
    }
  });
  this.scenes[scene].addChild(arrow);
}

Game.prototype.initializeTitleScreen = function() {
  // Make the title screen layout
  
  var self = this;

  // Sign in button
  this.sign_in_button = this.makeButton(
    this.scenes["title"],
    this.width - 90, this.height - 50,
    "SIGN IN", 24, 6, 0xFFFFFF,
    120, 40, 0x3cb0f3,
    function() {
      self.multiplayer.googleSignIn();
    }
  );

  this.sign_out_button = this.makeButton(
    this.scenes["title"],
    this.width - 90, this.height - 50,
    "SIGN OUT", 24, 6, 0xFFFFFF,
    120, 40, 0x3cb0f3,
    function() {
      self.multiplayer.signOut();
    }
  );
  this.sign_out_button.disable();
  this.sign_out_button.visible = false;


  // FOUR SQUARE LAYOUT
  // var title_left = new PIXI.Sprite(PIXI.Texture.from("Art/title_left.png"));
  // title_left.position.set(this.width * 1/8, this.height * 1/3);
  // title_left.anchor.set(0.5, 0.5);
  // this.scenes["title"].addChild(title_left);

  // var title_right = new PIXI.Sprite(PIXI.Texture.from("Art/title_right.png"));
  // title_right.position.set(this.width * 7/8, this.height * 1/3);
  // title_right.anchor.set(0.5, 0.5);
  // this.scenes["title"].addChild(title_right);

  // var title_text = new PIXI.Text("WORD VOLLEY", {fontFamily: "Bebas Neue", fontSize: 100, fill: 0x000000, letterSpacing: 25, align: "center"});
  // title_text.position.set(this.width * 1/2, this.height * 1/3);
  // title_text.anchor.set(0.5,0.5);
  // this.scenes["title"].addChild(title_text);
  //
  // this.makeButton(
  //   this.scenes["title"],
  //   this.width * 6/16, this.height * 4/6,
  //   "CREATE", 50, 6, 0xFFFFFF,
  //   256, 90, 0x3cb0f3,
  //   function() {
  //     self.initializeSetupCreate();
  //     self.animateSceneSwitch("title", "setup_create")
  //   }
  // );

  // this.makeButton(
  //   this.scenes["title"],
  //   this.width * 10/16, this.height * 4/6,
  //   "JOIN", 50, 6, 0x000000,
  //   256, 90, 0xf3db3c,
  //   function() {
  //     self.initializeSetupJoin();
  //     self.animateSceneSwitch("title", "setup_join")
  //   }
  // );

  // this.makeButton(
  //   this.scenes["title"],
  //   this.width * 6/16, this.height * 5/6,
  //   "QUICKPLAY", 50, 6, 0x000000,
  //   256, 90, 0x71d07d,
  //   function() {
  //   }
  // );

  // this.makeButton(
  //   this.scenes["title"],
  //   this.width * 10/16, this.height * 5/6,
  //   "WATCH", 50, 6, 0xFFFFFF,
  //   256, 90, 0xdb5858,
  //   function() {
  //   }
  // );

  // STACK LAYOUT
  var title_left = new PIXI.Sprite(PIXI.Texture.from("Art/title_left.png"));
  title_left.position.set(this.width * 1/8, this.height * 5/16);
  title_left.anchor.set(0.5, 0.5);
  this.scenes["title"].addChild(title_left);

  var title_right = new PIXI.Sprite(PIXI.Texture.from("Art/title_right.png"));
  title_right.position.set(this.width * 7/8, this.height * 5/16);
  title_right.anchor.set(0.5, 0.5);
  this.scenes["title"].addChild(title_right);

  var title_text = new PIXI.Text("WORD VOLLEY", {fontFamily: "Bebas Neue", fontSize: 100, fill: 0x000000, letterSpacing: 25, align: "center"});
  title_text.position.set(this.width * 1/2, this.height * 4/16);
  title_text.anchor.set(0.5,0.5);
  this.scenes["title"].addChild(title_text);

  this.makeButton(
    this.scenes["title"],
    this.width * 1/2, this.height * 4/8,
    "QUICKPLAY", 44, 6, 0x000000,
    224, 80, 0x71d07d,
    function() {
      if (self.auth_user == null) {
        self.multiplayer.anonymousSignIn(function() {self.quickPlayGame()});
      } else {
        self.quickPlayGame();
      }
    }
  );

  this.makeButton(
    this.scenes["title"],
    this.width * 1/2, this.height * 5/8,
    "CREATE", 44, 6, 0xFFFFFF,
    224, 80, 0x3cb0f3,
    function() {
      self.initializeSetupCreate();
      self.animateSceneSwitch("title", "setup_create")
    }
  );

  this.makeButton(
    this.scenes["title"],
    this.width * 1/2, this.height * 6/8,
    "JOIN", 44, 6, 0x000000,
    224, 80, 0xf3db3c,
    function() {
      self.initializeSetupJoin();
      self.animateSceneSwitch("title", "setup_join")
    }
  );

  this.makeButton(
    this.scenes["title"],
    this.width * 1/2, this.height * 7/8,
    "WATCH", 44, 6, 0xFFFFFF,
    224, 80, 0xdb5858,
    function() {
      self.initializeSetupWatch();
      self.animateSceneSwitch("title", "setup_watch")
    }
  );
}


Game.prototype.initializeSetupCreate = function() {
  this.clearScene(this.scenes["setup_create"]);

  var create_button = this.makeButton(
    this.scenes["setup_create"],
    this.width * 1/2, this.height * 21/24,
    "CREATE", 60, 6, 0xFFFFFF,
    256, 90, 0x3cb0f3,
    function() {
      self.createGame()
    }
  );
  create_button.disable();

  var self = this;

  this.makeOptionChooser(this.scenes["setup_create"], this.width * 2/6, this.height * 4/24, ["COOPERATIVE", "COMPETITIVE"], "GAME TYPE", create_button);
  this.makeOptionChooser(this.scenes["setup_create"], this.width * 4/6, this.height * 4/24, ["EASY", "MEDIUM", "HARD"], "DIFFICULTY", create_button);
  // this.makeOptionChooser(this.scenes["setup_create"], this.width * 19/24, this.height * 1/6, ["SHORT", "LONG"], "TIME LIMIT", create_button);

  this.options_text_box = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: 30, fill: 0x000000, letterSpacing: 6, align: "left"});
  this.options_text_box.anchor.set(0,0.5);
  this.options_text_box.position.set(this.width * 9/48, this.height * 31/48);
  this.scenes["setup_create"].addChild(this.options_text_box);

  this.backArrow("setup_create", "title", function() {self.resetTitle();})
}


Game.prototype.resetOptionsText = function() {
    var options_text = [];
    // for (const [key,value] of Object.entries(this.choices)) {
    //   var choice_strings = this.choice_strings[key];
    //   if (this.choices[key] in choice_strings) {
    //     options_text.append(this.choices[key][value])
    //   }
    // }
    if (this.choices["GAME TYPE"] == "COMPETITIVE") {
      options_text = options_text.concat(["Play by changing one letter to make a new word.",
        "1 point if the other player drops.",
        "3 points for spelling the special word.",
        "First to 6, win by 2."])
    
      if (this.choices["DIFFICULTY"] == "EASY") {
        options_text = options_text.concat(["4 letter words", "10 seconds per turn."])
      } else if (this.choices["DIFFICULTY"] == "MEDIUM") {
        options_text = options_text.concat(["4 to 6 letter words", "20 seconds per turn."])
      } else if (this.choices["DIFFICULTY"] == "HARD") {
        options_text = options_text.concat(["7 letter words", "20 seconds per turn."])
      }
    } else if (this.choices["GAME TYPE"] == "COOPERATIVE") {
      options_text = options_text.concat(["Play by changing one letter to make a new word.",
        "Cooperate to make as many new words as you can."])

      if (this.choices["DIFFICULTY"] == "EASY") {
        options_text = options_text.concat(["4 letter words", "2 minute game."])
      } else if (this.choices["DIFFICULTY"] == "MEDIUM") {
        options_text = options_text.concat(["4 to 6 letter words", "1 minute game."])
      } else if (this.choices["DIFFICULTY"] == "HARD") {
        options_text = options_text.concat(["7 letter words", "1 minute game."])
      }
    }
   
    for (var i = 0; i < options_text.length; i++) {
      options_text[i] = "- " + options_text[i];
    }
    this.options_text_box.text = options_text.join("\n");
  }


Game.prototype.initializeSetupJoin = function() {
  this.clearScene(this.scenes["setup_join"]);

  var your_game_code_give_it_to_me = new PIXI.Text("YOUR CODES. GIVE DEM TO ME.", {fontFamily: "Bebas Neue", fontSize: 36, fill: 0x000000, letterSpacing: 6, align: "center"});
  your_game_code_give_it_to_me.anchor.set(0.5,0.5);
  your_game_code_give_it_to_me.position.set(this.width * 1/2, this.height * 1/5 - 60);
  this.scenes["setup_join"].addChild(your_game_code_give_it_to_me);

  var self = this;

  this.game_code_letters = [];

  var join_button = this.makeButton(
    this.scenes["setup_join"],
    this.width * 1/2, this.height * 5/6,
    "JOIN", 60, 6, 0x000000,
    256, 90, 0xf3db3c,
    function() {
      var potential_game_code = "";
      for (var i = 0; i < 5; i++) {
        potential_game_code += self.game_code_letters[i].text.text;
      }
      self.joinGame(potential_game_code);
    }
  );
  join_button.disable();
  
  this.game_code_letter_choice = 0;
  for (var i = 0; i < 5; i++) {
    let choice_num = i;
    this.game_code_letters.push(this.makeButton(
      this.scenes["setup_join"],
      this.width * 1/2 - 200 + 100*i , this.height * 1/5 + 40,
      "", 100, 6, 0x000000,
      98, 100, (i == 0 ? 0xf1e594 : 0xFFFFFF),
      function() {
        self.game_code_letter_choice = choice_num
        for (var i = 0; i < 5; i++) {
          self.game_code_letters[i].backing.tint = (i == self.game_code_letter_choice ? 0xf1e594 : 0xFFFFFF);
        }
      }
    ));
  }

  this.makeLetterPalette(this.scenes["setup_join"], this.width * 9/16, this.height * 9/16, function(letter) {
    self.game_code_letters[self.game_code_letter_choice].text.text = letter;
    if (self.game_code_letter_choice < 4) {
      self.game_code_letter_choice += 1;
    }
    join_button.enable();
    for (var i = 0; i < 5; i++) {
      if (self.game_code_letters[i].text.text == "") {
        join_button.disable();
      }
      self.game_code_letters[i].backing.tint = (i == self.game_code_letter_choice ? 0xf1e594 : 0xFFFFFF);
    }
  });

  this.backArrow("setup_join", "title", function() {self.resetTitle();});
}



Game.prototype.initializeSetupWatch = function() {
  this.clearScene(this.scenes["setup_watch"]);

  var your_game_code_give_it_to_me = new PIXI.Text("YOUR CODES. GIVE DEM TO ME.", {fontFamily: "Bebas Neue", fontSize: 36, fill: 0x000000, letterSpacing: 6, align: "center"});
  your_game_code_give_it_to_me.anchor.set(0.5,0.5);
  your_game_code_give_it_to_me.position.set(this.width * 1/2, this.height * 1/5 - 60);
  this.scenes["setup_watch"].addChild(your_game_code_give_it_to_me);

  var self = this;

  this.game_code_letters = [];

  var watch_button = this.makeButton(
    this.scenes["setup_watch"],
    this.width * 1/2, this.height * 5/6,
    "WATCH", 60, 6, 0xFFFFFF,
    256, 90, 0xdb5858,
    function() {
      var potential_game_code = "";
      for (var i = 0; i < 5; i++) {
        potential_game_code += self.game_code_letters[i].text.text;
      }
      self.watchGame(potential_game_code);
    }
  );
  watch_button.disable();
  
  this.game_code_letter_choice = 0;
  for (var i = 0; i < 5; i++) {
    let choice_num = i;
    this.game_code_letters.push(this.makeButton(
      this.scenes["setup_watch"],
      this.width * 1/2 - 200 + 100*i , this.height * 1/5 + 40,
      "", 100, 6, 0x000000,
      98, 100, (i == 0 ? 0xf1e594 : 0xFFFFFF),
      function() {
        self.game_code_letter_choice = choice_num
        for (var i = 0; i < 5; i++) {
          self.game_code_letters[i].backing.tint = (i == self.game_code_letter_choice ? 0xf1e594 : 0xFFFFFF);
        }
      }
    ));
  }

  this.makeLetterPalette(this.scenes["setup_watch"], this.width * 9/16, this.height * 9/16, function(letter) {
    self.game_code_letters[self.game_code_letter_choice].text.text = letter;
    if (self.game_code_letter_choice < 4) {
      self.game_code_letter_choice += 1;
    }
    watch_button.enable();
    for (var i = 0; i < 5; i++) {
      if (self.game_code_letters[i].text.text == "") {
        watch_button.disable();
      }
      self.game_code_letters[i].backing.tint = (i == self.game_code_letter_choice ? 0xf1e594 : 0xFFFFFF);
    }
  });

  this.backArrow("setup_watch", "title", function() {self.resetTitle();});
}


Game.prototype.initializeAlertBox = function() {
  this.alertBox.position.set(this.width / 2, this.height / 2);
  this.alertBox.visible = false;

  this.alertMask.position.set(this.width / 2, this.height / 2);
  this.alertMask.visible = false;
  this.alertMask.interactive = true;
  this.alertMask.buttonMode = true;
  this.alertMask.on("click", function() {
  });


  var mask = PIXI.Sprite.from(PIXI.Texture.WHITE);
  mask.width = this.width;
  mask.height = this.height;
  mask.anchor.set(0.5, 0.5);
  mask.alpha = 0.2;
  mask.tint = 0x000000;
  this.alertMask.addChild(mask);

  var outline = PIXI.Sprite.from(PIXI.Texture.WHITE);
  outline.width = this.width * 2/5;
  outline.height = this.height * 2/5;
  outline.anchor.set(0.5, 0.5);
  outline.position.set(-1, -1);
  outline.tint = 0xDDDDDD;
  this.alertBox.addChild(outline);

  for (var i = 0; i < 4; i++) {
    var backingGrey = PIXI.Sprite.from(PIXI.Texture.WHITE);
    backingGrey.width = this.width * 2/5;
    backingGrey.height = this.height * 2/5;
    backingGrey.anchor.set(0.5, 0.5);
    backingGrey.position.set(4 - i, 4 - i);
    backingGrey.tint = PIXI.utils.rgb2hex([0.8 - 0.1*i, 0.8 - 0.1*i, 0.8 - 0.1*i]);
    this.alertBox.addChild(backingGrey);
  }

  var backingWhite = PIXI.Sprite.from(PIXI.Texture.WHITE);
  backingWhite.width = this.width * 2/5;
  backingWhite.height = this.height * 2/5;
  backingWhite.anchor.set(0.5, 0.5);
  backingWhite.position.set(0,0);
  backingWhite.tint = 0xFFFFFF;
  this.alertBox.addChild(backingWhite);

  this.alertBox.alertText = new PIXI.Text("EH. OKAY.", {fontFamily: "Bebas Neue", fontSize: 36, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.alertBox.alertText.anchor.set(0.5,0.5);
  this.alertBox.alertText.position.set(0, 0);
  this.alertBox.addChild(this.alertBox.alertText);

  this.alertBox.interactive = true;
  this.alertBox.buttonMode = true;

  // this.alertBox.button = this.makeButton(
  //   this.alertBox,
  //   0, this.height * 1/12,
  //   "OK, DANG", 36, 6, 0xFFFFFF,
  //   180, 60, 0x3cb0f3,
  //   function() {},
  // );
}


Game.prototype.resetSetupLobby = function() {
  var self = this;

  this.clearScene(this.scenes["lobby"]);

  this.lobby = [];

  this.lobby.player_1_character = new PIXI.Text(this.state.player_1_name.substring(0,1), {fontFamily: "Bebas Neue", fontSize: 144, fill: 0x3cb0f3, letterSpacing: 6, align: "center"});
  this.lobby.player_1_character.anchor.set(0.5,0.5);
  this.lobby.player_1_character.position.set(this.width * 1/8, this.height * 1/2);
  this.scenes["lobby"].addChild(this.lobby.player_1_character);

  this.lobby.player_1_name = new PIXI.Text(this.state.player_1_name, {fontFamily: "Bebas Neue", fontSize: 36, fill: 0x3cb0f3, letterSpacing: 6, align: "center"});
  this.lobby.player_1_name.anchor.set(0.5,0.5);
  this.lobby.player_1_name.position.set(this.width * 1/8, this.height * 1/2 + 80);
  this.scenes["lobby"].addChild(this.lobby.player_1_name);

  if (this.player == 1) {
    this.changeCharacterArrow("lobby", 1, 1, this.width * 1/8, this.height * 1/2 - 100);
    this.changeCharacterArrow("lobby", 1, -1, this.width * 1/8, this.height * 1/2 + 120);
  }

  this.lobby.player_2_character = new PIXI.Text(this.state.player_2_name.substring(0,1), {fontFamily: "Bebas Neue", fontSize: 144, fill: 0xf3db3c, letterSpacing: 6, align: "center"});
  this.lobby.player_2_character.anchor.set(0.5,0.5);
  this.lobby.player_2_character.position.set(this.width * 7/8, this.height * 1/2);
  this.scenes["lobby"].addChild(this.lobby.player_2_character);

  this.lobby.player_2_name = new PIXI.Text(this.state.player_2_name, {fontFamily: "Bebas Neue", fontSize: 36, fill: 0xf3db3c, letterSpacing: 6, align: "center"});
  this.lobby.player_2_name.anchor.set(0.5,0.5);
  this.lobby.player_2_name.position.set(this.width * 7/8, this.height * 1/2 + 80);
  this.scenes["lobby"].addChild(this.lobby.player_2_name);

  if (this.player == 2) {
    this.changeCharacterArrow("lobby", 2, 1, this.width * 7/8, this.height * 1/2 - 100);
    this.changeCharacterArrow("lobby", 2, -1, this.width * 7/8, this.height * 1/2 + 120);
  }

  this.lobby.game_code = new PIXI.Text("GAME CODE DFGHS", {fontFamily: "Bebas Neue", fontSize: 96, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.lobby.game_code.anchor.set(0.5,0.5);
  this.lobby.game_code.position.set(this.width * 1/2, this.height * 2/16);
  this.scenes["lobby"].addChild(this.lobby.game_code);
  this.lobby.game_code.visible = true;

  this.lobby.info_text = new PIXI.Text("WAITING FOR PLAYER 2", {fontFamily: "Bebas Neue", fontSize: 36, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.lobby.info_text.anchor.set(0,0.5);
  this.lobby.info_text.position.set(this.width * 1/2 - 180, this.height * 4/16);
  this.scenes["lobby"].addChild(this.lobby.info_text);
  
  if (this.player != 2) {
    if (this.state.player_2_state == "empty") {
      this.lobby.player_2_character.visible = false;
      this.lobby.player_2_name.visible = false;
    }
  } else {
    this.lobby.info_text.text = "GET IN THE CHOPPER!";
    this.lobby.info_text.anchor.set(0.5,0.5);
    this.lobby.info_text.position.set(this.width * 1/2, this.height * 4/16);
  }

  this.options_text_box = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: 24, fill: 0x000000, letterSpacing: 6, align: "left"});
  this.options_text_box.anchor.set(0,0.5);
  this.options_text_box.position.set(this.width * 11/48, this.height * 1/2);
  this.scenes["lobby"].addChild(this.options_text_box);


  if (this.state.game_type == "code_comp") {
    if (this.state.word_size == 4) {
      this.choices["GAME TYPE"] = "COMPETITIVE";
      this.choices["DIFFICULTY"] = "EASY";
    } else if (this.state.word_size == 1) {
      this.choices["GAME TYPE"] = "COMPETITIVE";
      this.choices["DIFFICULTY"] = "MEDIUM";
    } else if (this.state.word_size == 7) {
      this.choices["GAME TYPE"] = "COMPETITIVE";
      this.choices["DIFFICULTY"] = "HARD";
    }
  } else if (this.state.game_type == "code_coop") {
    if (this.state.word_size == 4) {
      this.choices["GAME TYPE"] = "COOPERATIVE";
      this.choices["DIFFICULTY"] = "EASY";
    } else if (this.state.word_size == 1) {
      this.choices["GAME TYPE"] = "COOPERATIVE";
      this.choices["DIFFICULTY"] = "MEDIUM";
    } else if (this.state.word_size == 7) {
      this.choices["GAME TYPE"] = "COOPERATIVE";
      this.choices["DIFFICULTY"] = "HARD";
    }
  } else if (this.state.game_type == "quick_open" || this.state.game_type == "quick_closed") {
    this.choices["GAME TYPE"] = "COMPETITIVE";
    this.choices["DIFFICULTY"] = "MEDIUM";
  }
  

  this.resetOptionsText();

  this.backArrow("lobby", "title", function() {
    self.multiplayer.leaveGame(self.game_code, self.player)
    self.resetTitle();
  });

  this.lobby_ready_button = this.makeButton(
    this.scenes["lobby"],
    this.width * 1/2, this.height * 14/16,
    "READY", 60, 6, 0xFFFFFF,
    256, 90, 0x3cb0f3,
    function() {
      if (self.player == 1) self.multiplayer.update({player_1_state: "ready"});
      if (self.player == 2) self.multiplayer.update({player_2_state: "ready"});
      this.disable();
    }
  );
}

