
var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

class Multiplayer {
  constructor(game) {
    this.database = firebase.database();
    this.game = game;
  }


  generateGameCode() {
    
    var name = "";
    for (var i = 0; i < 5; i++) {
      name += alphabet.charAt(Math.floor(Math.random() * alphabet.length));

    }
    return name;
  }


  createNewGame(callback, tries_left = 0) {
    var self = this;
    var game_code = this.generateGameCode();

    var time_limits = {
      0: 5,
      1: 10,
      2: 20,
      3: 30,
      4: 60,
      5: 300,
      6: -1
    };
    var word_sizes = {
      0: 4,
      1: 5,
      2: 6,
      3: 7,
      4: 1,
    };

    console.log(this.game.time_limit_choice);
    console.log(time_limits[this.game.time_limit_choice]);

    game.state = {
      player_1_present: true,
      player_2_present: false, 
      player_1_character: "A",
      player_2_character: "B",
      player_1_name: "ALFIE",
      player_2_name: "BERT",
      player_1_score: 0,
      player_2_score: 0,
      player_1_ready: false,
      player_2_ready: false,
      time_limit: time_limits[this.game.time_limit_choice] + 1, // one second to make it nicer
      word_size: word_sizes[this.game.word_size_choice],
      live_word: "",
      origin: "",
      target: "",
      volley: "",
      turn: 1,
      volley_state: "none",
    };

    this.database.ref("/games/" + game_code).set(game.state, (error) => {
      if (error) {
        console.log("Failed to create game " + game_code + " on try number " + tries_left);
        console.log(error);
        if (tries_left > 0) {
          self.createNewGame(callback, tries_left - 1)
        } else {
          self.game.showAlert("Sorry! I could't\nmake a game.\nPlease try later.", function() {});
        }
      } else {
        console.log("Created game " + game_code)
        self.game.game_code = game_code;
        callback();
      }
    });
  }


  joinGame(game_code, yes_callback, no_callback) {
    var self = this;
    this.database.ref("/games/" + game_code).once("value").then((result) => {
      if (result.exists()) {
        self.game.game_code = game_code;
        this.database.ref("games/" + game_code).update({
          player_2_present: true,
        }, (error) => {
          if (error) {
            console.log("Could not join game " + game_code);
            no_callback();
          } else {
            console.log("Managed to join game " + game_code);
            this.database.ref("/games/" + game_code).once("value").then((result) => {
              self.game.state = result.val();
              console.log("Loaded game state");
              console.log(result.val());
              console.log(self.game.state);
              yes_callback();
            });
          }
        });
      } else {
        console.log("Could not find game " + game_code);
        no_callback();
      }
    });
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


  leaveGame(code, player) {
    console.log("In leave game");
    console.log(code);
    console.log(player);
    if (player == 1) {
      console.log("Player 1 leaving the game");
      this.database.ref("games/" + code).update({player_1_present: false});
    } else if (player == 2) {
      console.log("Player 2 leaving the game");
      this.database.ref("games/" + code).update({player_2_present: false});
    } 
  }


  getState() {
    // return this.database.ref("/games/ancha").once("value").then((result) => {
    //   game.volley = result.val().volley;
    // });
  }

  updateVolley(volley) {
    // this.database.ref("games/ancha").update({
    //   volley: volley,
    // });
  }

  update(sheet) {
    this.database.ref("games/" + this.game.game_code).update(sheet);
  }

  updateState() {
   this.database.ref("games/" + this.game.game_code).update(this.game.state); 
  }
}