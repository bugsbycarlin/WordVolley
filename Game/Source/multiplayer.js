
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


  createNewGame(callback) {
    var self = this;
    var game_code = this.generateGameCode();

    game.state = {
      player_1_present: true,
      player_2_present: false, 
      player_1_character: "A",
      player_2_character: "A",
      player_1_score: 0,
      player_2_score: 0,
      time_limit: this.game.time_limit_choice,
      origin: "",
      target: "",
      volley: "",
      turn: ""
    };

    this.database.ref("/games/" + game_code).set(game.state, (error) => {
      if (error) {
        console.log("Failed to create game " + game_code);
        console.log(error);
      } else {
        console.log("Created game " + game_code)
        self.game_code = game_code;
        callback();
      }
    });
  }


  joinGame(game_code, yes_callback, no_callback) {
    var self = this;
    this.database.ref("/games/" + game_code).once("value").then((result) => {
      if (result.exists()) {
        self.game_code = game_code;
        this.database.ref("games/" + game_code).update({
          player_2_present: true,
        }, (error) => {
          if (error) {
            console.log("Could not join game " + game_code);
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
    
    var ref_player_2_present = this.database.ref("games/" + this.game_code + "/player_2_present");
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
        }
      } else if (game.state.player_2_present == true && snapshot.val() == false) {
        // Player 2 is leaving the game
        game.state.player_2_present = snapshot.val();
        if (game.player == 1) {
          // TO DO showAlert "Player 2 has left the game!"
        }
      }
    });

    var ref_player_1_present = this.database.ref("games/" + this.game_code + "/player_1_present");
    ref_player_1_present.on("value", (snapshot) => {
      if (game.state.player_1_present == true && snapshot.val() == false) {
        // Player 1 is leaving the game
        game.state.player_1_present = snapshot.val();
        if (game.player == 2) {
          // TO DO showAlert "Player 1 has left the game!"
        }
      }
    });

    var ref_player_1_character = this.database.ref("games/" + this.game_code + "/player_1_character");
    ref_player_1_character.on("value", (snapshot) => {
      game.state.player_1_character = snapshot.val();
      game.lobby.player_1_character.text = snapshot.val();
    });

    var ref_player_2_character = this.database.ref("games/" + this.game_code + "/player_2_character");
    ref_player_2_character.on("value", (snapshot) => {
      game.state.player_2_character = snapshot.val();
      game.lobby.player_2_character.text = snapshot.val();
    });


  }


  leaveGame(code, player) {
    if (player == 1) {
      this.database.ref("games/" + code).update({player_1_present: false});
    } else if (player == 2) {
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
    this.database.ref("games/" + this.game_code).update(sheet);
  }
}