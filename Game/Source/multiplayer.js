
var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

class Multiplayer {
  constructor(game) {
    this.database = firebase.database();
    this.game = game;


    // var volleyRef = this.database.ref("games/ancha/volley");
    // volleyRef.on("value", (snapshot) => {
    //   const data = snapshot.val();
    //   console.log("Updated volley");
    //   console.log(data);
    //   this.game.volley = data;
    // });
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
      4: -1
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
      time_limit: time_limits[this.game.time_limit_choice],
      word_size: word_sizes[this.game.word_size_choice],
      origin: "",
      target: "",
      volley: "",
      turn: ""
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

    var ref_player_1_ready = this.database.ref("games/" + game.game_code + "/player_1_ready");
    ref_player_1_ready.on("value", (snapshot) => {
      game.state.player_1_ready = snapshot.val();
      if (game.state.player_1_ready && game.state.player_2_ready) {
        game.startVolleying();
      }
    });

    var ref_player_2_ready = this.database.ref("games/" + game.game_code + "/player_2_ready");
    ref_player_2_ready.on("value", (snapshot) => {
      game.state.player_2_ready = snapshot.val();
      if (game.state.player_1_ready && game.state.player_2_ready) {
        game.startVolleying();
      }
    });

    var ref_origin = this.database.ref("games/" + game.game_code + "/origin");
    ref_origin.on("value", (snapshot) => {
      game.state.origin = snapshot.val();
      if (game.volley != null) game.volley.statement.text = game.state.origin + "        " + game.state.target;
    });

    var ref_target = this.database.ref("games/" + game.game_code + "/target");
    ref_target.on("value", (snapshot) => {
      game.state.target = snapshot.val();
      if (game.volley != null) game.volley.statement.text = game.state.origin + "        " + game.state.target;
    });

    var ref_volley = this.database.ref("games/" + game.game_code + "/volley");
    ref_volley.on("value", (snapshot) => {
      // TO DO: more stuff happens here. like, critical game stuff.
      game.state.volley = snapshot.val();
    });

    var ref_turn = this.database.ref("games/" + game.game_code + "/turn");
    ref_turn.on("value", (snapshot) => {
      // TO DO: more stuff happens here. like, critical game stuff.
      game.state.turn = snapshot.val();
    });

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
}