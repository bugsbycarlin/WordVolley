
const exhortations = [
  "Wow!",
  "Zowie!",
  "Jeezy Creezy.",
  "Wowsers!",
  "Jeepers!",
  "Dangles!",
  "Dang!",
  "Win-go, man!",
  "Zappa zappa.",
  "Zam!",
  "Blam!",
  "Shazaam!",
  "Keep going!",
  "Go go go!",
  "Wheeeee!",
  "Yay!",
];

Game.prototype.updateFromMulti = function(snapshot) {
  // I don't know why this happens, but I need to cancel it.
  // if (this.state.volley_state == "interactive" && snapshot.val().volley_state == "start_volley") {
  //   this.state.live_word = snapshot.val().live_word;
  //   this.setLiveWord();
  //   return;
  // }

  var self = this;
  var old_state = this.state;
  var new_state = snapshot.val();
  this.state = new_state;
  var date = new Date();
  console.log(date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ": Updating from multiplayer");
  console.log(old_state.volley_state);
  console.log(new_state.volley_state);

  // Player 1, notice player 2 joining or leaving the game
  if (game.player != 2) {
    if (old_state.player_2_state != "joined" && new_state.player_2_state == "joined") {
      this.lobby.info_text.anchor.set(0.5,0.5);
      this.lobby.info_text.position.set(this.width * 1/2, this.height * 4/16);
      this.lobby.info_text.text = "PLAYER 2 HAS JOINED. GET READY!";
      this.lobby.player_2_character.visible = true;
      this.lobby.player_2_name.visible = true;
    } else if (old_state.player_2_state != "quit" && new_state.player_2_state == "quit") {
      this.showAlert("Whoa. The other player\nhas left the game.", function() {
        // I should also leave, in an attempt to keep the game state coherent for later matching or cleanup
        self.multiplayer.leaveGame(self.game_code, self.player)
        self.resetTitle();
        self.animateSceneSwitch(self.current_scene, "title");
      })
    }
  }

  // Player 2, notice player 1 leaving the game
  if (game.player != 1) {
    if (old_state.player_1_state != "quit" && new_state.player_1_state == "quit") {
      this.showAlert("Whoa. The other player\nhas left the game.", function() {
        // I should also leave, in an attempt to keep the game state coherent for later matching or cleanup
        self.multiplayer.leaveGame(self.game_code, self.player)
        self.resetTitle();
        self.animateSceneSwitch(self.current_scene, "title");
      })
    }
  }

  // Update player's character, name, and score
  if (old_state.player_1_name != new_state.player_1_name) {
    this.lobby.player_1_name.text = new_state.player_1_name;
    this.lobby.player_1_character.text = new_state.player_1_name.substring(0,1);
  }
  if (old_state.player_2_name != new_state.player_2_name) {
    this.lobby.player_2_name.text = new_state.player_2_name;
    this.lobby.player_2_character.text = new_state.player_2_name.substring(0,1);
  }
  if (old_state.player_1_score != new_state.player_1_score) {
    if (this.volley != null) {
      this.volley.player_1_score.text = new_state.player_1_score;
      if (this.state.game_type == "code_coop") {
        console.log("score changed");
        if (new_state.player_1_score == 0) {
           console.log("score 0");
          this.volley.coop_score.text = "";
        } else if (new_state.player_1_score == 1){
           console.log("score 1");
          this.volley.coop_score.text = "1 Volley";
        } else {
          console.log("score 2+");
          this.volley.coop_score.text = new_state.player_1_score + " Volleys." 
            + ((Math.floor(Math.random() * 100 > 85)) ? (" " +exhortations[Math.floor(Math.random() * exhortations.length)]) : "");
        }
      }
    }
  }
  if (old_state.player_2_score != new_state.player_2_score) {
    if (this.volley != null) this.volley.player_2_score.text = new_state.player_2_score;
  }

  // Update the live word
  if (old_state.live_word != new_state.live_word && this.live_word_letters != null) {
    this.setLiveWord();
  }

  // If the origin or target change, show the new ones, and remake the live word container
  if (old_state.origin != new_state.origin || old_state.target != new_state.target) {
    if (this.current_scene == "volley") {
      // this.volley.statement.text = new_state.origin + "        " + new_state.target;
      this.remakeLiveWordContainer();
      this.setLiveWord();
      this.setPriorWords();
    }
  }

  // Start the proper game if both players register as ready
  if (old_state.player_1_state != new_state.player_1_state || old_state.player_2_state != new_state.player_2_state) {
    if (new_state.player_1_state == "ready" && new_state.player_2_state == "ready") {
      if (this.current_scene == "lobby" && this.player == 1) {
        console.log("From here I start the volley")
        this.setupVolley("start_volley");
      }
    }
  }

  // If we receive the start_volley state, make the actual transition to the volley scene and start us up.
  if (old_state.volley_state != new_state.volley_state && new_state.volley_state == "start_volley") {
    console.log("starting volley");
    this.initializeVolleyScreen();
    this.animateSceneSwitch("lobby", "volley");
    this.setPriorWords();
    this.volleyStateCountdown();
  }


  // If we receive the reset_volley state, go back to the countdown
  if (old_state.volley_state != new_state.volley_state && new_state.volley_state == "reset_volley") {
    console.log("resetting volley");
    this.volleyStateCountdown();
  }


  // If we receive the change_to_miss state, and we were not in the miss state, change to the miss state.
  if (old_state.volley_state != new_state.volley_state && new_state.volley_state == "change_to_miss") {
    if (old_state.volley_state == "miss") {
      this.state.volley_state = "miss";
    } else {
      this.volleyStateMiss();
    }
  }


  // If we receive the change_to_win, and we were not in the win state, change to the win state.
  if (old_state.volley_state != new_state.volley_state && new_state.volley_state == "change_to_win") {
    if (old_state.volley_state == "win") {
      this.state.volley_state = "win";
    } else {
      this.volleyStateWin();
    }
  }


  // If we receive change_to_lob, we are now the turn player and should prepare for the lob!
  if (old_state.volley_state != new_state.volley_state && new_state.volley_state == "change_to_lob") {
    if (old_state.volley_state != "lob") {
      console.log("changing to lob");
      var words = new_state.volley.split("-");
      var last_word = words[words.length - 1];
      this.ball.addWord(last_word);
      this.setPriorWords();
      this.volleyStateLob();
    }
  }

  // If we receive changeywee, we are now ready to stop the game as well
  if (old_state.volley_state != new_state.volley_state && new_state.volley_state == "changeywee") {
    if (old_state.volley_state != "ended") {
      console.log("I got a signal from the other guy to finish coop");
      this.finishCoop(false);
    }
  }

  console.log("Final volley state: " + this.state.volley_state);

}


Game.prototype.update = function() {
  if (this.state.length != 0 && (
    this.state.player_1_state == "quit" || this.state.player_2_state == "quit" ||
    this.state.player_1_state == "ended" || this.state.player_2_state == "ended" || this.state.volley_state == "ended")) {
    return;
  }

  if (this.current_scene == "volley") {
    this.ball.update();
  }

  var dots = Math.floor(4/1000.0 * (Date.now() - this.start_time)) % 3;
  if (this.current_scene == "lobby" && this.player != 2 && this.state.player_2_state == "empty") {
    this.lobby.info_text.text = "WAITING FOR PLAYER 2" + ".".repeat(dots + 1);
  }

  if (this.current_scene == "volley" && this.state.volley_state == "countdown") {
    var time_remaining = 5 - (Date.now() - this.volley_start) / 1000;
    if (time_remaining < 0) time_remaining = 0;
    
    if (this.state.game_type == "code_coop") {
      this.volley.info_text.text = "READY? " + Math.floor(time_remaining);
      if (time_remaining <= 0) {
        this.volley_start = Date.now();
        this.volleyStateLob(true);
      }
    } else {
      this.volley.info_text.text = "THE SECRET WORD IS " + this.state.target + ". READY? " + Math.floor(time_remaining);
      if (time_remaining <= 0) {
        this.volleyStateLob(true);
      }
    }
  }

  if (this.current_scene == "volley" && this.state.volley_state == "interactive") {
    var time_remaining = this.state.time_limit - (Date.now() - this.volley_start)/1000;
    if (time_remaining < 0) time_remaining = 0;
    
    var minutes = Math.floor(time_remaining / 60);
    var seconds = Math.floor(time_remaining - 60*minutes);
    this.volley.info_text.text = minutes + ":" + seconds.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
  
    if (this.state.game_type != "code_coop" && time_remaining <= 0 && this.player == this.state.turn) {
      this.volleyStateMiss();
    }

    if (this.state.game_type == "code_coop" && this.state.volley_state != "ended" && time_remaining <= 0 && this.player == this.state.turn) {
      this.finishCoop(true);
    }
  }

  if (this.state.game_type == "code_coop" && this.current_scene == "volley" && 
    (this.state.volley_state == "interactive" || this.state.volley_state == "lob" || this.state.volley_state == "miss")) {
    var time_remaining = this.state.time_limit - (Date.now() - this.volley_start)/1000;
    if (time_remaining < 0) time_remaining = 0;
    
    var minutes = Math.floor(time_remaining / 60);
    var seconds = Math.floor(time_remaining - 60*minutes);
    this.volley.info_text.text = minutes + ":" + seconds.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
  }
}


Game.prototype.checkVictory = function() {
  var self = this;

  // var show = false;
  // var text = "";
  // var character = "";

       
  // if (this.state.player_1_score >= 6 && this.state.player_1_score - this.state.player_2_score >= 2) {
  //   this.state.volley_state = "ended";
  //   show = true;
  //   character = this.state.player_1_name.substring(0,1);

  //   if (this.state.player == 1) {
  //     this.multiplayer.finishGame(this.game_code, this.player, this.player)
  //     text = "You win, " + this.state.player_1_name + "!";
  //   } else if (this.state.player == 2) {
  //     text = this.state.player_1_name + " wins! You lose.";
  //   } else {
  //     text = this.state.player_1_name + " wins!";
  //   }
  // } else if (this.state.player_2_score >= 6 && this.state.player_2_score - this.state.player_1_score >= 2) {
  //   this.state.volley_state = "ended";
  //   show = true;
  //   character = this.state.player_2_name.substring(0,1);

  //   if (this.state.player == 2) {
  //     this.multiplayer.finishGame(this.game_code, this.player, this.player)
  //     text = "You win, " + this.state.player_2_name + "!";
  //   } else if (this.state.player == 1) {
  //     text = this.state.player_2_name + " wins! You lose.";
  //   } else {
  //     text = this.state.player_2_name + " wins!";
  //   }
  // }

  if (this.state.player_1_score >= 6 && this.state.player_1_score - this.state.player_2_score >= 2) {
    this.state.volley_state = "ended";
    if (this.player == 1) {
      this.multiplayer.finishGame(this.game_code, this.player, this.player)
    }
    this.showConclusion(1);
  } else if (this.state.player_2_score >= 6 && this.state.player_2_score - this.state.player_1_score >= 2) {
    this.state.volley_state = "ended";
    if (this.player == 2) {
      this.multiplayer.finishGame(this.game_code, this.player, this.player)
    }
    this.showConclusion(2);
  }
}


Game.prototype.finishCoop = function(update_others) {
  var self = this;

  this.state.volley_state = "ended";

  if (update_others == true) {
    console.log("Updating others about finish game");
    this.multiplayer.finishGame(this.game_code, this.player, this.player);
  }

  // this.showConclusion(text, character, function() {
  //   self.resetTitle();
  //   self.animateSceneSwitch(self.current_scene, "title");
  // });
  self.showConclusion(3);
}


Game.prototype.setupVolley = function(new_volley_state) {
  if (this.state.volley_state == "ended") {
    return;
  }
  var choice_size = this.state.word_size
  if (choice_size == 1) {
    choice_size = Math.floor(Math.random() * 3) + 4;
  }

  var words = Object.keys(this.common_words[choice_size]);
  var origin = words[Math.floor(Math.random() * words.length)];
  var target = words[Math.floor(Math.random() * words.length)];

  var tries = 3;
  while(target == origin && tries > 0) {
    target = words[Math.floor(Math.random() * words.length)];
    tries -= 1;
  }

  var turn = 1 + Math.floor(Math.random() * 2);
  if (new_volley_state == "reset_volley") {
    turn = this.state.turn == 1 ? 2 : 1;
  }

  var player_1_score = this.state.player_1_score;
  var player_2_score = this.state.player_2_score;
  if (new_volley_state == "start_volley") {
    player_1_score = 0;
    player_2_score = 0;
  }

  console.log("From here i update the state when i setup volley in setupvolley")
  this.multiplayer.update({
    origin: origin,
    target: target,
    volley: origin,
    live_word: origin,
    turn: turn,
    player_1_score: player_1_score,
    player_2_score: player_2_score,
    volley_state: new_volley_state, // should be start_volley or reset_volley
  });
}


Game.prototype.volleyStateCountdown = function() {
  this.state.volley_state = "countdown";
  this.volley_start = Date.now();
}


Game.prototype.volleyStateLob = function(reset=false) {
  this.state.volley_state = "lob";
  if (reset) {
    this.ball.clear();
    this.ball.addWord(this.state.origin);
  }
  if (this.state.turn == 2) {
    this.ball.words[0].position.set(this.width * 1/4, this.height * 4/16);
    this.ball.words[0].rotation = Math.atan2(-15, 26.4);
    this.ball.smasha(1, 640, 640/7, 800);
  } else if (this.state.turn == 1) {
    this.ball.words[0].position.set(this.width * 3/4, this.height * 4/16);
    this.ball.words[0].rotation = Math.atan2(-15, -26.4);
    this.ball.smasha(-1, 640, 640/7, 800);
  }
  if (this.state.game_type != "code_coop") {
    this.volley.info_text.text = "";
  }
  this.ball.show();

  // this.hideHint();
  this.play_button.visible = false;
  this.play_button.disable();
  var self = this;
  setTimeout(function() {
    self.volleyStateInteractive();
  }, 800)
}


Game.prototype.volleyStateInteractive = function() {
  var self = this;
  this.state.volley_state = "interactive";
  if (this.state.game_type != "code_coop") {
    this.volley_start = Date.now();
  }
  this.live_word_letter_choice = 0;
  this.setLiveWord();

  // this.findHint();
  // setTimeout(function() {
  //   self.showHint();
  // }, Math.max(30, this.state.time_limit * 1000 - 7000));

  if (this.player == this.state.turn) {
    for (var i = 0; i < this.letter_palette.letters.length; i++) {
      this.letter_palette.letters[i].enable();
    }
    this.live_word_letter_choice = 0
    for (var i = 0; i < this.live_word_letters.length; i++) {
      this.live_word_letters[i].backing.tint = (i == this.live_word_letter_choice ? 0xf1e594 : 0xFFFFFF);
    }
  } else {
    for (var i = 0; i < this.letter_palette.letters.length; i++) {
      this.letter_palette.letters[i].disable();
    }
    for (var i = 0; i < this.live_word_letters.length; i++) {
      this.live_word_letters[i].backing.tint = 0xFFFFFF;
    }
  }
}


Game.prototype.volleyStateMiss = function() {
  var self = this;

  this.state.volley_state = "miss";

  if (this.player == this.state.turn) {
    var player_1_score = this.state.player_1_score;
    var player_2_score = this.state.player_2_score;

    if (this.state.game_type != "code_coop") {
      if (this.player == 1) {
        player_2_score += 6;
      } else if (this.player == 2) {
        player_1_score += 6;
      }
    }

    this.multiplayer.update({
      player_1_score: player_1_score,
      player_2_score: player_2_score,
      volley_state: "change_to_miss",
      live_word: "",
    })
  }

  // this.hideHint();
  this.play_button.visible = false;

  if (this.state.game_type != "code_coop") {
    this.volley.info_text.text = "";
  }
  this.state.live_word = "";
  this.setLiveWord();
  this.red_underline.visible = false;
  this.blue_underline.visible = false;

  this.ball.words[0].vx = this.ball.last_vx;
  this.ball.words[0].vy = this.ball.last_vy;
  this.ball.words[0].rotation = this.ball.last_rotation;
  this.ball.bottom_bound = this.height * 7/16 + 80;
  this.ball.flying = true;
  this.ball.bounce = true;

  setTimeout(function() {
    self.ball.flying = false;
    self.ball.bounce = false;
    self.ball.bottom_bound = self.ball.permanent_bottom_bound;
    self.ball.clear();

    if (self.state.game_type != "code_coop") {
      self.checkVictory();
    }

    if (self.player == 1 && self.state.game_type != "code_coop") {
      console.log("I shouldn't reach here from miss in a coop game");
      self.setupVolley("reset_volley");
    }
  }, 800);

  
}


Game.prototype.volleyStateWin = function() {
  var self = this;
  this.state.volley_state = "win";
  this.state.volley = this.state.volley + "-" + this.state.live_word;

  if (this.player == this.state.turn) {
    var player_1_score = this.state.player_1_score;
    var player_2_score = this.state.player_2_score;

    if (this.player == 1) {
      player_1_score += 3;
    } else if (this.player == 2) {
      player_2_score += 3;
    }

    this.multiplayer.update({
      player_1_score: player_1_score,
      player_2_score: player_2_score,
      volley_state: "change_to_win",
      volley: this.state.volley,
      live_word: "",
    })
  }

  // this.hideHint();
  this.play_button.visible = false;
  
  this.volley.info_text.text = "";
  this.state.live_word = "";
  this.setLiveWord();
  this.red_underline.visible = false;
  this.blue_underline.visible = false;

  if (this.state.turn == 1) {
    this.ball.words[0].position.set(this.width * 1/4, this.height * 4/16);
    this.ball.words[0].rotation = Math.atan2(-15, 26.4);
    this.ball.smasha(1, 1600, 640/7, 600, true);
  } else if (this.state.turn == 2) {
    this.ball.words[0].position.set(this.width * 3/4, this.height * 4/16);
    this.ball.words[0].rotation = Math.atan2(-15, -26.4);
    this.ball.smasha(-1, 1600, 640/7, 600, true);
  }
  this.ball.words[0].vy *= 0;
  this.ball.bottom_bound = 5000;
  this.ball.show();

  setTimeout(function() {
    self.ball.flying = false;
    self.ball.bounce = false;
    self.ball.bottom_bound = self.ball.permanent_bottom_bound;
    self.ball.clear();

    self.checkVictory();
    if (self.player == 1) {
      self.setupVolley("reset_volley");
    }
  }, 800);
}


Game.prototype.returnVolley = function() {
  var self = this;

  if (this.player == this.state.turn) {
    if (this.state.game_type == "code_coop" || this.state.live_word != this.state.target) { // regular volley

      this.state.volley = this.state.volley + "-" + this.state.live_word;
      this.state.turn = this.state.turn == 1 ? 2 : 1;
      //this.state.live_word = ;

      var words = this.state.volley.split("-");
      var last_word = words[words.length - 1];
      this.ball.addWord(last_word);

      var player_1_score = this.state.player_1_score;
      var player_2_score = this.state.player_2_score;
      if (this.state.game_type == "code_coop") {
        player_2_score += 1;
        player_1_score += 1;
      }

      this.setPriorWords();
      this.volleyStateLob();
      this.setLiveWord();
        
      console.log("It can't be here surely")
      this.multiplayer.update({
        player_1_score: player_1_score,
        player_2_score: player_2_score,
        volley_state: "change_to_lob",
        volley: this.state.volley,
        turn: this.state.turn,
        live_word: this.state.live_word,
      });
    } else { // winning shot
      this.volleyStateWin();
    }
  }
}


Game.prototype.setLiveWord = function() {
  if (this.state.volley_state == "interactive" && this.live_word_letters != null && this.player == this.state.turn) {
    for (var i = 0; i < this.live_word_letters.length; i++) {
      this.live_word_letters[i].text.text = this.state.live_word[i];
      this.live_word_letters[i].backing.tint = (i == this.live_word_letter_choice ? 0xf1e594 : 0xFFFFFF);
    }
    this.live_word_container.visible = true;
  } else {
    for (var i = 0; i < this.live_word_letters.length; i++) {
      this.live_word_letters[i].text.text = this.state.live_word[i];
      this.live_word_letters[i].backing.tint = 0xFFFFFF;
    }
    this.live_word_container.visible = false;
  }
}


Game.prototype.setPriorWords = function() {
  this.priorWords = this.state.volley.split("-");
}


Game.prototype.checkRedUnderline = function() {
  return !(this.state.live_word in this.legal_words[this.state.origin.length]);
}


Game.prototype.checkBlueUnderline = function() {
  return (this.priorWords.includes(this.state.live_word));
}


Game.prototype.findHint = function() {
  var base_word = this.ball.words[0].text;
  this.hint_text = "";
  for (const [key, value] of Object.entries(this.legal_words[base_word.length])) {
    if (this.distance(key, base_word) == 1 && !this.priorWords.includes(key)) {
      this.hint_text = key;
      break;
    }
  }
}


Game.prototype.distance = function(word1, word2) { //assumes same length
  var distance = 0;
  for (var i = 0; i < word1.length; i++) {
    if (word1[i] != word2[i]) distance += 1;
  }
  return distance;
}


Game.prototype.showHint = function() {
  if (this.state.turn == 1) {
    this.volley.hint_text.position.set(this.width * 1/8, this.height * 7/16 + 190);
  } else if (this.state.turn == 2) {
    this.volley.hint_text.position.set(this.width * 7/8, this.height * 7/16 + 190);
  }
  this.volley.hint_text.text = this.hint_text == "" ? "OUT OF LUCK" : this.hint_text;
  this.volley.hint_text.visible = true;

  new TWEEN.Tween(this.volley.hint_text)
      .to({rotation: Math.PI / 60.0})
      .duration(70)
      .yoyo(true)
      .repeat(3)
      .start()
}


Game.prototype.hideHint = function() {
  this.volley.hint_text.text = "";
  this.volley.hint_text.visible = false;
}

