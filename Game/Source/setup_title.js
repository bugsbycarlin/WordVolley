


Game.prototype.initializeTitleScreen = function() {
  // create the title screen layout
  var title_left = new PIXI.Sprite(PIXI.Texture.from("Art/title_left.png"));
  title_left.position.set(this.width * 1/8, this.height * 1/2);
  title_left.anchor.set(0.5, 0.5);
  this.scenes["title"].addChild(title_left);

  var title_right = new PIXI.Sprite(PIXI.Texture.from("Art/title_right.png"));
  title_right.position.set(this.width * 7/8, this.height * 1/2);
  title_right.anchor.set(0.5, 0.5);
  this.scenes["title"].addChild(title_right);

  var title_text = new PIXI.Text("WORD VOLLEY", {fontFamily: "BebasNeue-Regular", fontSize: 100, fill: 0x000000, letterSpacing: 25, align: "center"});
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
      self.animateSceneSwitch("title", "setup_create")
    }
  );

  this.makeButton(
    this.scenes["title"],
    this.width * 10/16, this.height * 5/6,
    "JOIN", 60, 6, 0x000000,
    256, 90, 0xf3db3c,
    function() {
      self.animateSceneSwitch("title", "setup_join")
    }
  );
}


Game.prototype.initializeSetupCreate = function() {
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

  var selection_marker = PIXI.Sprite.from(PIXI.Texture.WHITE);
  selection_marker.width = 100;
  selection_marker.height = 3;
  selection_marker.anchor.set(0.5, 0.5);
  selection_marker.tint = 0x3cb0f3;
  selection_marker.position.set(this.width * 1/2,this.height * 1/2 + 40);
  selection_marker.visible = false;
  this.scenes["setup_create"].addChild(selection_marker);

  var choose_a_time_limit_text = new PIXI.Text("CHOOSE A TIME LIMIT", {fontFamily: "BebasNeue-Regular", fontSize: 36, fill: 0x000000, letterSpacing: 6, align: "center"});
  choose_a_time_limit_text.anchor.set(0.5,0.5);
  choose_a_time_limit_text.position.set(this.width * 1/2, this.height * 13/32);
  this.scenes["setup_create"].addChild(choose_a_time_limit_text);

  var self = this;

  this.time_limit_choices = ["5 SEC", "10 SEC", "20 SEC", "30 SEC", "60 SEC", "5 MIN", "NO LIMIT"]
  this.time_limit_choice = -1;
  for (var i = 0; i < this.time_limit_choices.length; i++) {
    let choice_num = i;
    console.log(choice_num);
    this.makeButton(
      this.scenes["setup_create"],
      this.width * (i+1)/8 , this.height * 1/2,
      this.time_limit_choices[i], 36, 6, 0x3cb0f3,
      20 * (1 + this.time_limit_choices[i].length), 60, 0xFFFFFF,
      function() {
        if (self.time_limit_choice == -1) {
          self.time_limit_choice = choice_num;
          selection_marker.visible = true;
          selection_marker.position.x = self.width * (choice_num+1)/8;
          create_button.visible = true;
        } else {
          console.log(self.width * (choice_num+1)/8);
          console.log(choice_num);
          self.time_limit_choice = choice_num;
          var tween = new TWEEN.Tween(selection_marker.position)
            .to({x: self.width * (choice_num+1)/8})
            .duration(250)
            .easing(TWEEN.Easing.Cubic.Out)
            .start();
        }
        //self.animateSceneSwitch("title", "setup_create")
      }
    );
  }
}


Game.prototype.initializeSetupJoin = function() {
  var your_game_code_give_it_to_me = new PIXI.Text("YOUR GAME CODE. GIVE IT TO ME.", {fontFamily: "BebasNeue-Regular", fontSize: 36, fill: 0x000000, letterSpacing: 6, align: "center"});
  your_game_code_give_it_to_me.anchor.set(0.5,0.5);
  your_game_code_give_it_to_me.position.set(this.width * 1/2, this.height * 1/5 - 60);
  this.scenes["setup_join"].addChild(your_game_code_give_it_to_me);

  var self = this;

  game_code_letters = [];
  this.game_code_letter_choice = 0;
  for (var i = 0; i < 5; i++) {
    let choice_num = i;
    game_code_letters.push(this.makeButton(
      this.scenes["setup_join"],
      this.width * 1/2 - 200 + 100*i , this.height * 1/5 + 40,
      "", 100, 6, 0x000000,
      98, 100, (i == 0 ? 0xf1e594 : 0xFFFFFF),
      function() {
        // if (self.time_limit_choice == -1) {
        //   self.time_limit_choice = choice_num;
        //   selection_marker.visible = true;
        //   selection_marker.position.x = self.width * (choice_num+1)/8;
        //   create_button.visible = true;
        // } else {
        //   console.log(self.width * (choice_num+1)/8);
        //   console.log(choice_num);
        //   self.time_limit_choice = choice_num;
        //   var tween = new TWEEN.Tween(selection_marker.position)
        //     .to({x: self.width * (choice_num+1)/8})
        //     .duration(250)
        //     .easing(TWEEN.Easing.Cubic.Out)
        //     .start();
        // }
        //self.animateSceneSwitch("title", "setup_create")
      }
    ));
  }

  this.makeLetterPalette(this.scenes["setup_join"], this.width * 9/16, this.height * 9/16, function(letter) {
    game_code_letters[self.game_code_letter_choice].text.text = letter;
    if (self.game_code_letter_choice < 4) {
      self.game_code_letter_choice += 1;
    }
    for (var i = 0; i < 5; i++) {
      game_code_letters[i].backing.tint = (i == self.game_code_letter_choice ? 0xf1e594 : 0xFFFFFF);
    }
  });
}


Game.prototype.initializeSetupLobby = function() {

  this.lobby = [];
  this.lobby.game_waiting = new PIXI.Text("Waiting for game name", {fontFamily: "BebasNeue-Regular", fontSize: 48, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.lobby.game_waiting.anchor.set(0,0.5);
  this.lobby.game_waiting.position.set(this.width * 1/2 - 230, this.height * 1/4);
  this.scenes["lobby"].addChild(this.lobby.game_waiting);

  this.lobby.game_code = new PIXI.Text("GAME CODE DFGHS", {fontFamily: "BebasNeue-Regular", fontSize: 100, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.lobby.game_code.anchor.set(0.5,0.5);
  this.lobby.game_code.position.set(this.width * 1/2, this.height * 1/4);
  this.scenes["lobby"].addChild(this.lobby.game_code);
  this.lobby.game_code.visible = false;

  this.lobby.player_waiting = new PIXI.Text("Waiting for player 2", {fontFamily: "BebasNeue-Regular", fontSize: 48, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.lobby.player_waiting.anchor.set(0,0.5);
  this.lobby.player_waiting.position.set(this.width * 1/2 - 230, this.height * 1/2);
  this.scenes["lobby"].addChild(this.lobby.player_waiting);
  this.lobby.player_waiting.visible = false;

  this.lobby.player_2_joined = new PIXI.Text("PLAYER 2 JOINED", {fontFamily: "BebasNeue-Regular", fontSize: 100, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.lobby.player_2_joined.anchor.set(0.5,0.5);
  this.lobby.player_2_joined.position.set(this.width * 1/2, this.height * 1/2);
  this.scenes["lobby"].addChild(this.lobby.player_2_joined);
  this.lobby.player_2_joined.visible = false;
}
