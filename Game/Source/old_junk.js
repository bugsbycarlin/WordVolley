
  volleySetup() {
    var choice_size = this.state.word_size
    if (choice_size == 1) {
      choice_size = Math.floor(Math.random() * 4) + 4;
    }

    var words = Object.keys(this.common_words[choice_size]);
    this.state.origin = words[Math.floor(Math.random() * words.length)];

    this.state.target = words[Math.floor(Math.random() * words.length)];

    // this.state.origin = "BEER"
    // this.state.target = "BEET"
    var tries = 3;
    while(this.state.target == this.state.origin && tries > 0) {
      this.state.target = words[Math.floor(Math.random() * words.length)];
      tries -= 1;
    }

    this.state.volley = this.state.origin;
    this.state.live_word = this.state.origin;
    this.state.turn = 1 + Math.floor(Math.random() * 2);

    this.multiplayer.update({
      origin: this.state.origin,
      target: this.state.target,
      volley: this.state.volley,
      live_word: this.state.live_word,
      turn: this.state.turn,
      volley_state: "change_to_start",
    });
  }


  startVolleyScene() {

    this.initializeVolleyScreen();
    this.animateSceneSwitch("lobby", "volley");

    this.state.volley_state = "start";
    this.volley_start = Date.now();
  }


  volleyLob(direction) {
    this.state.volley_state = "lob";
    if (direction == 1) {
      this.ball.words[0].position.set(this.width * 1/4, this.height * 4/16);
      this.ball.words[0].rotation = Math.atan2(-15, 26.4);
    } else if (direction == -1) {
      this.ball.words[0].position.set(this.width * 3/4, this.height * 4/16);
      this.ball.words[0].rotation = Math.atan2(-15, -26.4);
    }
    this.volley.info_text.text = "";
    this.ball.show();
    this.ball.smasha(direction, 640, 640/7, 800);
    this.play_button.disable();
    var self = this;
    setTimeout(function() {
      self.volleyStateInteractive();
    }, 800)
  }


  volleyStateInteractive() {
    this.state.volley_state = "interactive";
    this.volley_start = Date.now();
    this.live_word_letter_choice = 0;
    this.setLiveWord();
    this.play_button.disable();

    if (this.player == this.state.turn) {
      for (var i = 0; i < this.letterPalette.length; i++) {
        this.letterPalette[i].enable();
      }
      this.live_word_letter_choice = 0
      for (var i = 0; i < this.live_word_letters.length; i++) {
        this.live_word_letters[i].backing.tint = (i == this.live_word_letter_choice ? 0xf1e594 : 0xFFFFFF);
      }
    } else {
      for (var i = 0; i < this.letterPalette.length; i++) {
        this.letterPalette[i].disable();
      }
      for (var i = 0; i < this.live_word_letters.length; i++) {
        this.live_word_letters[i].backing.tint = 0xFFFFFF;
      }
    }
  }


  volleyMiss() {
    var self = this;

    this.play_button.disable();
    this.state.volley_state = "animating_miss";
    
    this.ball.words[0].vx = this.ball.last_vx;
    this.ball.words[0].vy = this.ball.last_vy;
    this.ball.words[0].rotation = this.ball.last_rotation;
    this.ball.bottom_bound = this.height * 7/16 + 80;
    this.ball.flying = true;
    this.ball.bounce = true;

    this.volley.info_text.text = "";

    self.state.live_word = "";
    self.setLiveWord();

    setTimeout(function() {
      self.ball.flying = false;
      self.ball.bounce = false;
      self.ball.bottom_bound = self.ball.permanent_bottom_bound;
      self.ball.clear();

      if (self.player == 1) {
        // some extra work to do to start the game
        self.volleySetup();

        game.state.volley_state = "start";
        game.volley_start = Date.now();
      }
    }, 800);
  }


  volleyHit() {
    var self = this;

    if (this.player == this.state.turn) {
      if (this.state.live_word != this.state.target) { // regular volley
          this.state.volley = this.state.volley + "-" + this.state.live_word;
          this.state.turn = this.state.turn == 1 ? 2 : 1;
          
          this.multiplayer.update({
            volley_state: "lob",
            volley: this.state.volley,
            turn: this.state.turn,
          });

          this.setPriorWords();
          this.volleyLob((this.state.turn == 1 ? -1 : 1));
      } else { // winning shot
        if (this.player == 1) {
          this.state.player_1_score += 1;
          this.volley.player_1_score.text = this.state.player_1_score;
        } else if (this.player == 2) {
          this.state.player_2_score += 1;
          this.volley.player_2_score.text = this.state.player_2_score;
        }

        this.state.volley = this.state.volley + "-" + this.state.live_word;
        this.state.live_word = "";

        this.state.volley_state = "winning_shot";

        this.multiplayer.update({
          volley: this.state.volley,
          live_word: this.state.live_word,
          player_1_score: this.state.player_1_score,
          player_2_score: this.state.player_2_score,
          volley_state: this.state.volley_state,
        });

        this.volleyWinning((game.state.turn == 1 ? 1 : -1));
      }
    }
  }


  volleyWinning(direction) {
    if (direction == 1) {
      this.ball.words[0].position.set(this.width * 1/4, this.height * 4/16);
      this.ball.words[0].rotation = Math.atan2(-15, 26.4);
    } else if (direction == -1) {
      this.ball.words[0].position.set(this.width * 3/4, this.height * 4/16);
      this.ball.words[0].rotation = Math.atan2(-15, -26.4);
    }
    this.volley.info_text.text = "";
    this.ball.show();
    this.ball.smasha(direction, 1600, 640/7, 600, true);
    this.ball.words[0].vy *= 0;
    this.ball.bottom_bound = 5000;
    this.play_button.disable();

    this.state.live_word = "";
    this.setLiveWord();

    setTimeout(function() {
      self.ball.flying = false;
      self.ball.bounce = false;
      self.ball.bottom_bound = self.ball.permanent_bottom_bound;
      self.ball.clear();

      if (self.player == 1) {
        // some extra work to do to start the game
        self.volleySetup();

        game.state.volley_state = "start";
        game.volley_start = Date.now();
      }
    }, 800);
  }


  setLiveWord() {
    if (this.state.volley_state == "interactive" && this.live_word_letters != null) {
      for (var i = 0; i < this.live_word_letters.length; i++) {
        this.live_word_letters[i].text.text = this.state.live_word[i];
        this.live_word_letters[i].backing.tint = (i == this.live_word_letter_choice ? 0xf1e594 : 0xFFFFFF);
      }
      this.liveWordContainer.visible = true;
    } else {
      for (var i = 0; i < this.live_word_letters.length; i++) {
        this.live_word_letters[i].text.text = this.state.live_word[i];
        this.live_word_letters[i].backing.tint = 0xFFFFFF;
      }
      this.liveWordContainer.visible = false;
    }
  }


  setPriorWords() {
    this.priorWords = this.state.volley.split("-");
  }


  checkRedUnderline() {
    return !(this.state.live_word in this.legal_words[this.state.origin.length]);
  }


  checkBlueUnderline() {
    return (this.state.live_word != this.ball.words[0].text.text
      && this.priorWords.includes(this.state.live_word));
  }


  update() {

    if (this.current_scene == "volley") {
      this.ball.update();
    }

    var dots = Math.floor(4/1000.0 * (Date.now() - this.start_time)) % 3;
    if (this.current_scene == "lobby" && this.player == 1 && this.state.player_2_present == false) {
      this.lobby.info_text.text = "WAITING FOR PLAYER 2" + ".".repeat(dots + 1);
    }

    if (this.current_scene == "volley" && this.state.volley_state == "start") {
      var time_remaining = 3 - (Date.now() - this.volley_start) / 1000;
      if (time_remaining < 0) time_remaining = 0;
      this.volley.info_text.text = "READY? " + Math.floor(time_remaining);

      if (time_remaining <= 0) {
        game.volleyLob((this.state.turn == 1 ? -1 : 1));
      }
    }

    if (this.current_scene == "volley" && this.state.volley_state == "interactive") {
      var time_remaining = this.state.time_limit - (Date.now() - this.volley_start)/1000;
      if (time_remaining < 0) time_remaining = 0;
      
      var minutes = Math.floor(time_remaining / 60);
      var seconds = Math.floor(time_remaining - 60*minutes);
      this.volley.info_text.text = minutes + ":" + seconds.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
    
      if (time_remaining <= 0) {

        if (this.player == this.state.turn) {
          game.volleyMiss();

          if (this.player == 1) {
            this.state.player_2_score += 1;
            this.volley.player_2_score.text = this.state.player_2_score;
          } else if (this.player == 2) {
            this.state.player_1_score += 1;
            this.volley.player_1_score.text = this.state.player_1_score;
          }
          this.multiplayer.update({
            player_1_score: this.state.player_1_score,
            player_2_score: this.state.player_2_score,
            volley_state: this.state.volley_state,
          })
        }
      }
    }

    this.render();
  }





   setWatches() {
    var self = this;
    var game = this.game;

    var ref_player_2_present = this.database.ref("games/" + game.game_code + "/player_2_present");
    ref_player_2_present.on("value", (snapshot) => {
      if (game.state.player_2_present == false && snapshot.val() == true) {
        // Player 2 is joining the game
        game.state.player_2_present = snapshot.val();
        console.log("Player_2_present: " + game.state.player_2_present);
        if (game.player == 1) {
            game.lobby.info_text.anchor.set(0.5,0.5);
            game.lobby.info_text.position.set(game.width * 1/2, game.height * 1/2);
            game.lobby.info_text.text = "PLAYER 2 HAS JOINED. GET READY!";
            game.lobby.player_2_character.visible = true;
            game.lobby.player_2_name.visible = true;
        }
      } else if (game.state.player_2_present == true && snapshot.val() == false) {
        // Player 2 is leaving the game
        game.state.player_2_present = snapshot.val();
        if (game.player == 1) {
          game.showAlert("Player 2 has\nleft the game!", function() {
            game.resetTitle();
            game.animateSceneSwitch(game.current_scene, "title");
          })
        }
      }
    });

    var ref_player_1_present = this.database.ref("games/" + game.game_code + "/player_1_present");
    ref_player_1_present.on("value", (snapshot) => {
      if (game.state.player_1_present == true && snapshot.val() == false) {
        // Player 1 is leaving the game
        game.state.player_1_present = snapshot.val();
        if (game.player == 2) {
          game.showAlert("Player 1 has\nleft the game!", function() {
            game.resetTitle();
            game.animateSceneSwitch(game.current_scene, "title");
          })
        }
      }
    });

    var ref_player_1_character = this.database.ref("games/" + game.game_code + "/player_1_character");
    ref_player_1_character.on("value", (snapshot) => {
      game.state.player_1_character = snapshot.val();
      game.lobby.player_1_character.text = snapshot.val();
    });

    var ref_player_2_character = this.database.ref("games/" + game.game_code + "/player_2_character");
    ref_player_2_character.on("value", (snapshot) => {
      game.state.player_2_character = snapshot.val();
      game.lobby.player_2_character.text = snapshot.val();
    });

    var ref_player_1_name = this.database.ref("games/" + game.game_code + "/player_1_name");
    ref_player_1_name.on("value", (snapshot) => {
      game.state.player_1_name = snapshot.val();
      game.lobby.player_1_name.text = snapshot.val();
    });

    var ref_player_2_name = this.database.ref("games/" + game.game_code + "/player_2_name");
    ref_player_2_name.on("value", (snapshot) => {
      game.state.player_2_name = snapshot.val();
      game.lobby.player_2_name.text = snapshot.val();
    });

    var ref_player_1_score = this.database.ref("games/" + game.game_code + "/player_1_score");
    ref_player_1_score.on("value", (snapshot) => {
      game.state.player_1_score = snapshot.val();
      if (game.volley != null) game.volley.player_1_score.text = snapshot.val();
    });

    var ref_player_2_score = this.database.ref("games/" + game.game_code + "/player_2_score");
    ref_player_2_score.on("value", (snapshot) => {
      game.state.player_2_score = snapshot.val();
      if (game.volley != null) game.volley.player_2_score.text = snapshot.val();
    });

    var ref_player_1_ready = this.database.ref("games/" + game.game_code + "/player_1_ready");
    ref_player_1_ready.on("value", (snapshot) => {
      game.state.player_1_ready = snapshot.val();
      if (game.state.player_1_ready && game.state.player_2_ready) {
        if (game.state.origin == "" && game.player == 1) {
          game.volleySetup();
        }
      }
    });

    var ref_player_2_ready = this.database.ref("games/" + game.game_code + "/player_2_ready");
    ref_player_2_ready.on("value", (snapshot) => {
      game.state.player_2_ready = snapshot.val();
      if (game.state.player_1_ready && game.state.player_2_ready) {
        if (game.state.origin == "" && game.player == 1) {
          game.volleySetup();
        }
      }
    });



    var ref_state_change = this.database.ref("games/" + game.game_code);
    ref_state_change.on("value", (snapshot) => {
      var old_state = game.state;
      var new_state = snapshot.val();
      console.log(old_state);
      console.log(new_state);
      console.log(old_state.live_word);
      console.log(new_state.live_word);
      console.log(old_state.volley_state);
      console.log(new_state.volley_state);
      game.state = new_state;

      if (game.current_scene == "lobby" && new_state.volley_state == "change_to_start") {
        game.startVolleyScene();
      }

      if (game.current_scene == "volley" && old_state.volley_state != "start" && new_state.volley_state == "start") {
        game.state.volley_state = "start";
        game.volley_start = Date.now();
      }

      if (game.current_scene == "volley" || game.current_scene == "lobby") {
        if (new_state.origin != old_state.origin || new_state.target != old_state.target) {
          if (game.volley != null) game.volley.statement.text = game.state.origin + "        " + game.state.target;
          game.remakeLiveWordContainer();
        }
      }

      if (game.current_scene == "volley" && old_state.volley_state == "interactive" && new_state.volley_state == "animating_miss" && new_state.turn != game.player) {
        game.volleyMiss();
      }

      if (old_state.live_word != new_state.live_word && game.live_word_letters != null) {
        game.setLiveWord();
      }

      if (old_state.volley_state == "interactive" && new_state.volley_state == "lob" && game.player != old_state.turn) {
        game.volleyLob((old_state.turn == 1 ? -1 : 1));
      }

      if (old_state.volley_state == "interactive" && new_state.volley_state == "winning_shot" && game.player != old_state.turn) {
        game.volleyWinning((old_state.turn == 1 ? -1 : 1));
      }

      if (game.current_scene == "volley" && new_state.volley.length != old_state.volley.length) {
        game.setPriorWords();
        if (game.ball != null) {
          if (game.state.volley == "") {
            // clear the ball
            game.ball.clear();
          } else {
            var words = game.state.volley.split("-");
            var last_word = words[words.length - 1];
            if (last_word != game.ball.words[0].text) {
              game.ball.addWord(last_word);
            }
          }
        }
      }

      if (old_state.turn != new_state.turn) {
        if (game.play_button != null) {
          if (game.player == game.state.turn) {
            game.play_button.visible = true;
            game.play_button.disable();
          } else {
            game.play_button.visible = false;
          }
        }
      }
    });



    // var ref_origin = this.database.ref("games/" + game.game_code + "/origin");
    // ref_origin.on("value", (snapshot) => {
    //   var old_origin = game.state.origin;
    //   game.state.origin = snapshot.val();
    //   if (game.volley != null) game.volley.statement.text = game.state.origin + "        " + game.state.target;
    //   if (old_origin.length != game.state.origin.length) {
    //     game.remakeLiveWordContainer();
    //   }
    // });

    // var ref_target = this.database.ref("games/" + game.game_code + "/target");
    // ref_target.on("value", (snapshot) => {
    //   game.state.target = snapshot.val();
    //   if (game.volley != null) game.volley.statement.text = game.state.origin + "        " + game.state.target;
    // });

    // var ref_volley = this.database.ref("games/" + game.game_code + "/volley");
    // ref_volley.on("value", (snapshot) => {
    //   // TO DO: more stuff happens here. like, critical game stuff.
    //   var old_volley = game.state.volley;
    //   game.state.volley = snapshot.val();
    //   game.setPriorWords();
    //   if (game.ball != null) {
    //     if (game.state.volley == "") {
    //       // clear the ball
    //       game.ball.clear();
    //     } else {
    //       var words = game.state.volley.split("-");
    //       var last_word = words[words.length - 1];
    //       if (last_word != game.ball.words[0].text) {
    //         game.ball.addWord(last_word);
    //       }
    //     }
    //   }

    //   if (game.current_scene == "volley" && game.state != null && game.state.volley_state != "pre" && game.state.volley != old_volley && game.state.volley != "" && game.state.volley.includes(old_volley)) {
    //     console.log(game.state.volley_state);
    //     console.log("i got here too early");
    //     game.volleyLob((game.state.turn == 1 ? 1 : -1));
    //   }
    // });

    // var ref_volley_state = this.database.ref("games/" + game.game_code + "/volley_state");
    // ref_volley_state.on("value", (snapshot) => {


    //   if (game.state.volley_state == "sync") {
    //     game.state.volley_state = "pre";
    //     game.volley_start = Date.now();
    //   }

    //   console.log("Anka");
    //   console.log("State: " + game.state.volley_state);
    //   console.log("Player: " + game.player);
    //   console.log("Turn: " + game.state.turn);
    //   if (game.state.volley_state == "animation_winning" && game.player != game.state.turn) {
    //     console.log("I am being induced to take the winning shot from afar")
    //     game.volleyWinning((game.state.turn == 1 ? -1 : 1))
    //   }

    // });

    // var ref_live_word = this.database.ref("games/" + game.game_code + "/live_word");
    // ref_live_word.on("value", (snapshot) => {
    //   if (game.live_word_letters != null && game.state.turn != game.player) {
    //     game.state.live_word = snapshot.val();
    //     game.setLiveWord(game.state.live_word);
    //   }
    // });

    // var ref_turn = this.database.ref("games/" + game.game_code + "/turn");
    // ref_turn.on("value", (snapshot) => {
    //   // TO DO: more stuff happens here. like, critical game stuff.
      
    //   // if (game.state.volley_state == "animating_miss" && game.state.update())
    //   var old_turn = game.state.turn;
    //   console.log("updated turn from the other side");
    //   game.state.turn = snapshot.val();

    //   if (game.play_button != null) {
    //     if (game.player == game.state.turn) {
    //       game.play_button.visible = true;
    //       game.play_button.disable();
    //     } else {
    //       game.play_button.visible = false;
    //     }
    //   }
    // });

    // var ref_turn = this.database.ref("games/" + game.game_code + "/live_word");
    // ref_turn.on("value", (snapshot) => {
    //   // TO DO: more stuff happens here. like, critical game stuff.
    //   game.state.live_word = snapshot.val();
    //   if (game.live_word != null) {
    //     // game.live_word.text = game.state.live_word;
    //     game.setLiveWord();
    //   }
    // });

  }


