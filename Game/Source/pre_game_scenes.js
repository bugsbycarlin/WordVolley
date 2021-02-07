



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
      console.log("Doing action");
      action();
    }
    self.animateSceneSwitch(current, old)
  });
  this.scenes[current].addChild(arrow);
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
    console.log(alphabetArray);
    if (player == 1) {
      var old_character = self.state.player_1_character;
      console.log(old_character);
      var position = alphabetArray.indexOf(old_character);
      var new_character = alphabetArray[(position + alphabetArray.length + 1 * direction) % 26];
      var new_name = character_names[(position + alphabetArray.length + 1 * direction) % 26];
      self.state.player_1_character = new_character;
      self.lobby.player_1_character.text = new_character;
      self.multiplayer.update({player_1_character: new_character, player_1_name: new_name});
    } else if (player == 2) {
      var old_character = self.state.player_2_character;
      var position = alphabetArray.indexOf(old_character);
      var new_character = alphabetArray[(position + alphabetArray.length + 1 * direction) % 26];
      var new_name = character_names[(position + alphabetArray.length + 1 * direction) % 26];
      self.state.player_2_character = new_character;
      self.lobby.player_2_character.text = new_character;
      self.multiplayer.update({player_2_character: new_character, player_2_name: new_name});
    }
  });
  this.scenes[scene].addChild(arrow);
}

Game.prototype.initializeTitleScreen = function() {
  // Make the title screen layout
  var title_left = new PIXI.Sprite(PIXI.Texture.from("Art/title_left.png"));
  title_left.position.set(this.width * 1/8, this.height * 1/2);
  title_left.anchor.set(0.5, 0.5);
  this.scenes["title"].addChild(title_left);

  var title_right = new PIXI.Sprite(PIXI.Texture.from("Art/title_right.png"));
  title_right.position.set(this.width * 7/8, this.height * 1/2);
  title_right.anchor.set(0.5, 0.5);
  this.scenes["title"].addChild(title_right);

  var title_text = new PIXI.Text("WORD VOLLEY", {fontFamily: "Bebas Neue", fontSize: 100, fill: 0x000000, letterSpacing: 25, align: "center"});
  title_text.position.set(this.width * 1/2, this.height * 1/2);
  title_text.anchor.set(0.5,0.5);
  this.scenes["title"].addChild(title_text);

  var self = this;

  this.makeButton(
    this.scenes["title"],
    this.width * 6/16, this.height * 5/6,
    "CREATE", 60, 6, 0xFFFFFF,
    256, 90, 0x3cb0f3,
    function() {
      self.initializeSetupCreate();
      self.animateSceneSwitch("title", "setup_create")
    }
  );

  this.makeButton(
    this.scenes["title"],
    this.width * 10/16, this.height * 5/6,
    "JOIN", 60, 6, 0x000000,
    256, 90, 0xf3db3c,
    function() {
      self.initializeSetupJoin();
      self.animateSceneSwitch("title", "setup_join")
    }
  );
}


Game.prototype.initializeSetupCreate = function() {
  this.clearScene(this.scenes["setup_create"]);

  var create_button = this.makeButton(
    this.scenes["setup_create"],
    this.width * 1/2, this.height * 5/6,
    "CREATE", 60, 6, 0xFFFFFF,
    256, 90, 0x3cb0f3,
    function() {
      self.createGame()
    }
  );
  create_button.visible = false;

  this.makeButton(
    this.scenes["setup_create"],
    84, 68,
    "", 60, 6, 0x000000,
    128, 90, 0xFFFFFF,
    function() {
      self.animateSceneSwitch("title", "setup_join");
    }
  );


  var word_selection_marker = PIXI.Sprite.from(PIXI.Texture.WHITE);
  word_selection_marker.width = 100;
  word_selection_marker.height = 3;
  word_selection_marker.anchor.set(0.5, 0.5);
  word_selection_marker.tint = 0x3cb0f3;
  word_selection_marker.position.set(this.width * 1/2,this.height * 8/32 + 32);
  word_selection_marker.visible = false;
  this.scenes["setup_create"].addChild(word_selection_marker);

  var choose_a_word_size_text = new PIXI.Text("WORD SIZE", {fontFamily: "Bebas Neue", fontSize: 36, fill: 0x000000, letterSpacing: 6, align: "center"});
  choose_a_word_size_text.anchor.set(0.5,0.5);
  choose_a_word_size_text.position.set(this.width * 1/2, this.height * 6/32);
  this.scenes["setup_create"].addChild(choose_a_word_size_text);

  var self = this;

  this.word_size_choices = ["FOUR", "FIVE", "SIX", "SEVEN", "ANY"]
  this.word_size_choice = -1;
  for (var i = 0; i < this.word_size_choices.length; i++) {
    let choice_num = i;
    this.makeButton(
      this.scenes["setup_create"],
      this.width * (i+1)/6 , this.height * 8/32,
      this.word_size_choices[i], 36, 6, 0x3cb0f3,
      20 * (1 + this.word_size_choices[i].length), 60, 0xFFFFFF,
      function() {
        if (self.word_size_choice == -1) {
          self.word_size_choice = choice_num;
          word_selection_marker.visible = true;
          word_selection_marker.position.x = self.width * (choice_num+1)/6;
          if (self.time_limit_choice != -1) create_button.visible = true;
        } else {
          self.word_size_choice = choice_num;
          var tween = new TWEEN.Tween(word_selection_marker.position)
            .to({x: self.width * (choice_num+1)/6})
            .duration(250)
            .easing(TWEEN.Easing.Cubic.Out)
            .start();
        }
      }
    );
  }

  var time_selection_marker = PIXI.Sprite.from(PIXI.Texture.WHITE);
  time_selection_marker.width = 100;
  time_selection_marker.height = 3;
  time_selection_marker.anchor.set(0.5, 0.5);
  time_selection_marker.tint = 0x3cb0f3;
  time_selection_marker.position.set(this.width * 1/2,this.height * 17/32 + 32);
  time_selection_marker.visible = false;
  this.scenes["setup_create"].addChild(time_selection_marker);

  var choose_a_time_limit_text = new PIXI.Text("TIME LIMIT", {fontFamily: "Bebas Neue", fontSize: 36, fill: 0x000000, letterSpacing: 6, align: "center"});
  choose_a_time_limit_text.anchor.set(0.5,0.5);
  choose_a_time_limit_text.position.set(this.width * 1/2, this.height * 15/32);
  this.scenes["setup_create"].addChild(choose_a_time_limit_text);

  var self = this;

  this.time_limit_choices = ["5 SEC", "10 SEC", "20 SEC", "30 SEC", "60 SEC", "5 MIN", "NO LIMIT"]
  this.time_limit_choice = -1;
  for (var i = 0; i < this.time_limit_choices.length; i++) {
    let choice_num = i;
    this.makeButton(
      this.scenes["setup_create"],
      this.width * (i+1)/8 , this.height * 17/32,
      this.time_limit_choices[i], 36, 6, 0x3cb0f3,
      20 * (1 + this.time_limit_choices[i].length), 60, 0xFFFFFF,
      function() {
        if (self.time_limit_choice == -1) {
          self.time_limit_choice = choice_num;
          time_selection_marker.visible = true;
          time_selection_marker.position.x = self.width * (choice_num+1)/8;
          if (self.word_size_choice != -1) create_button.visible = true;
        } else {
          self.time_limit_choice = choice_num;
          var tween = new TWEEN.Tween(time_selection_marker.position)
            .to({x: self.width * (choice_num+1)/8})
            .duration(250)
            .easing(TWEEN.Easing.Cubic.Out)
            .start();
        }
      }
    );
  }

  this.backArrow("setup_create", "title", function() {self.resetTitle();})
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
  join_button.visible = false;
  
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
        // for (var i = choice_num; i < 4; i++) {
        //   game_code_letters[i].text.text = game_code_letters[i+1].text.text;
        // }
        // game_code_letters[4].text.text = "";
        // join_button.visible = false;
      }
    ));
  }

  this.makeLetterPalette(this.scenes["setup_join"], this.width * 9/16, this.height * 9/16, function(letter) {
    self.game_code_letters[self.game_code_letter_choice].text.text = letter;
    if (self.game_code_letter_choice < 4) {
      self.game_code_letter_choice += 1;
    }
    join_button.visible = true;
    for (var i = 0; i < 5; i++) {
      if (self.game_code_letters[i].text.text == "") {
        join_button.visible = false;
      }
      self.game_code_letters[i].backing.tint = (i == self.game_code_letter_choice ? 0xf1e594 : 0xFFFFFF);
    }
  });

  this.backArrow("setup_join", "title", function() {self.resetTitle();});
}

Game.prototype.initializeAlertBox = function() {
  this.alertBox.position.set(this.width / 2, this.height / 2);
  this.alertBox.visible = false;

  var outline = PIXI.Sprite.from(PIXI.Texture.WHITE);
  outline.width = this.width / 3;
  outline.height = this.height / 3;
  outline.anchor.set(0.5, 0.5);
  outline.position.set(-1, -1);
  outline.tint = 0xDDDDDD;
  this.alertBox.addChild(outline);

  for (var i = 0; i < 4; i++) {
    var backingGrey = PIXI.Sprite.from(PIXI.Texture.WHITE);
    backingGrey.width = this.width / 3;
    backingGrey.height = this.height / 3;
    backingGrey.anchor.set(0.5, 0.5);
    backingGrey.position.set(4 - i, 4 - i);
    backingGrey.tint = PIXI.utils.rgb2hex([0.8 - 0.1*i, 0.8 - 0.1*i, 0.8 - 0.1*i]);
    this.alertBox.addChild(backingGrey);
  }

  var backingWhite = PIXI.Sprite.from(PIXI.Texture.WHITE);
  backingWhite.width = this.width / 3;
  backingWhite.height = this.height / 3;
  backingWhite.anchor.set(0.5, 0.5);
  backingWhite.position.set(0,0);
  backingWhite.tint = 0xFFFFFF;
  this.alertBox.addChild(backingWhite);

  this.alertBox.alertText = new PIXI.Text("EH. OKAY.", {fontFamily: "Bebas Neue", fontSize: 36, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.alertBox.alertText.anchor.set(0.5,0.5);
  this.alertBox.alertText.position.set(0, this.height * -1/12 + 20);
  this.alertBox.addChild(this.alertBox.alertText);

  this.alertBox.button = this.makeButton(
    this.alertBox,
    0, this.height * 1/12,
    "OK, DANG", 36, 6, 0xFFFFFF,
    180, 60, 0x3cb0f3,
    function() {},
  );
}


Game.prototype.resetSetupLobby = function() {
  var self = this;

  this.clearScene(this.scenes["lobby"]);

  this.lobby = [];

  console.log(this.state.player_1_character);
  this.lobby.player_1_character = new PIXI.Text(this.state.player_1_character, {fontFamily: "Bebas Neue", fontSize: 144, fill: 0x3cb0f3, letterSpacing: 6, align: "center"});
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

  this.lobby.player_2_character = new PIXI.Text(this.state.player_2_character, {fontFamily: "Bebas Neue", fontSize: 144, fill: 0xf3db3c, letterSpacing: 6, align: "center"});
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
  
  if (this.player == 1) {
    this.lobby.game_code = new PIXI.Text("GAME CODE DFGHS", {fontFamily: "Bebas Neue", fontSize: 96, fill: 0x000000, letterSpacing: 6, align: "center"});
    this.lobby.game_code.anchor.set(0.5,0.5);
    this.lobby.game_code.position.set(this.width * 1/2, this.height * 3/16);
    this.scenes["lobby"].addChild(this.lobby.game_code);
    this.lobby.game_code.visible = true;

    this.lobby.info_text = new PIXI.Text("WAITING FOR PLAYER 2", {fontFamily: "Bebas Neue", fontSize: 36, fill: 0x000000, letterSpacing: 6, align: "center"});
    this.lobby.info_text.anchor.set(0,0.5);
    this.lobby.info_text.position.set(this.width * 1/2 - 180, this.height * 1/2);
    this.scenes["lobby"].addChild(this.lobby.info_text);

    // this.lobby.player_2_joined = new PIXI.Text("PLAYER 2 JOINED", {fontFamily: "Bebas Neue", fontSize: 36, fill: 0x000000, letterSpacing: 6, align: "center"});
    // this.lobby.player_2_joined.anchor.set(0.5,0.5);
    // this.lobby.player_2_joined.position.set(this.width * 1/2, this.height * 1/2);
    // this.scenes["lobby"].addChild(this.lobby.player_2_joined);
    // this.lobby.player_2_joined.visible = false;

    this.lobby.player_2_character.visible = false;
    this.lobby.player_2_name.visible = false;

  } else if (this.player == 2) {
    this.lobby.info_text = new PIXI.Text("GET IN THE CHOPPER!", {fontFamily: "Bebas Neue", fontSize: 36, fill: 0x000000, letterSpacing: 6, align: "center"});
    this.lobby.info_text.anchor.set(0.5,0.5);
    this.lobby.info_text.position.set(this.width * 1/2, this.height * 1/2);
    this.scenes["lobby"].addChild(this.lobby.info_text);
  }

  this.backArrow("lobby", "title", function() {
    console.log("Here's the action");
    console.log(self.game_code);
    console.log(self.player);
    self.multiplayer.leaveGame(self.game_code, self.player)
    self.resetTitle();
  });

  this.makeButton(
    this.scenes["lobby"],
    this.width * 1/2, this.height * 5/6,
    "READY", 60, 6, 0xFFFFFF,
    256, 90, 0x3cb0f3,
    function() {
      if (self.player == 1) self.multiplayer.update({player_1_ready: true});
      if (self.player == 2) self.multiplayer.update({player_2_ready: true});
      this.disable();
    }
  );
}

